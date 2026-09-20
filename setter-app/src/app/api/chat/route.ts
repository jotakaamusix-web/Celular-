import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import type { Business, BusinessInfo, ChatMessage, InfoSection } from "@/lib/types";
import { SECTION_LABELS } from "@/lib/types";

const SECTION_ORDER: InfoSection[] = ["protocolo", "servicios", "precios", "negociacion", "otros"];

function buildSystemPrompt(business: Business, info: BusinessInfo[]) {
  const bySection = SECTION_ORDER.map((section) => {
    const rows = info.filter((i) => i.section === section);
    if (rows.length === 0) return null;
    const body = rows
      .map((r) => `- ${r.title}: ${r.content}`)
      .join("\n");
    return `=== ${SECTION_LABELS[section].toUpperCase()} ===\n${body}`;
  }).filter(Boolean);

  return `Eres el asistente interno de diagnóstico y negociación para el negocio "${business.name}", que opera en el número ${business.phone_number}.

Tu única función es ayudar a la persona que atiende ESTE número a resolver dudas, decidir cómo responder a un cliente y negociar bien, usando EXCLUSIVAMENTE la información cargada abajo por el dueño del negocio. No inventes precios, servicios ni políticas que no estén aquí.

Si te preguntan algo que no está cubierto en la información cargada, dilo con claridad ("Eso no está en la información que tengo cargada para este negocio") y sugiere anotarlo como pendiente para que el dueño lo cargue.

${bySection.length > 0 ? bySection.join("\n\n") : "(Todavía no se ha cargado información para este negocio. Indícaselo a quien pregunte.)"}

Reglas importantes:
- Este es el número "${business.name}" (${business.phone_number}). Nunca mezcles esta información con la de otro número/negocio de la empresa.
- Si la pregunta claramente pertenece al otro número, dile a la persona que cambie de modo en la app en vez de responder con datos de este negocio.
- Sé directo, profesional y breve. Da respuestas accionables (qué decirle al cliente, qué protocolo seguir), no ensayos.`;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { slug, message } = (await request.json()) as { slug?: string; message?: string };

  if (!slug || !message || !message.trim()) {
    return NextResponse.json({ error: "Falta el negocio o el mensaje" }, { status: 400 });
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single<Business>();

  if (!business) {
    return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
  }

  const { data: info } = await supabase
    .from("business_info")
    .select("*")
    .eq("business_id", business.id)
    .returns<BusinessInfo[]>();

  const { data: history } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("business_id", business.id)
    .eq("author_id", user.id)
    .order("created_at", { ascending: true })
    .limit(30)
    .returns<ChatMessage[]>();

  const { error: insertUserError } = await supabase.from("chat_messages").insert({
    business_id: business.id,
    author_id: user.id,
    role: "user",
    content: message.trim(),
  });

  if (insertUserError) {
    return NextResponse.json({ error: insertUserError.message }, { status: 500 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Falta configurar ANTHROPIC_API_KEY en el servidor." },
      { status: 500 }
    );
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const messages = [
    ...(history ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message.trim() },
  ];

  let assistantText = "";

  try {
    const completion = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: buildSystemPrompt(business, info ?? []),
      messages,
    });

    assistantText = completion.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: `Error al llamar a la IA: ${detail}` }, { status: 502 });
  }

  if (!assistantText) {
    assistantText = "No tengo una respuesta clara con la información cargada. Anótalo como pendiente.";
  }

  const { error: insertAssistantError } = await supabase.from("chat_messages").insert({
    business_id: business.id,
    author_id: user.id,
    role: "assistant",
    content: assistantText,
  });

  if (insertAssistantError) {
    return NextResponse.json({ error: insertAssistantError.message }, { status: 500 });
  }

  return NextResponse.json({ reply: assistantText });
}
