import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import type { Business, ChatMessage, DailyDiagnostic, Profile } from "@/lib/types";

export default async function PanelPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (profile?.role !== "owner") redirect("/");

  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .order("slug")
    .returns<Business[]>();

  const { data: profiles } = await supabase.from("profiles").select("*").returns<Profile[]>();
  const authorNames = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name || "Equipo"]));

  const businessData = await Promise.all(
    (businesses ?? []).map(async (business) => {
      const { data: questions } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("business_id", business.id)
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(8)
        .returns<ChatMessage[]>();

      const { data: diagnostics } = await supabase
        .from("daily_diagnostics")
        .select("*")
        .eq("business_id", business.id)
        .order("entry_date", { ascending: false })
        .limit(3)
        .returns<DailyDiagnostic[]>();

      return { business, questions: questions ?? [], diagnostics: diagnostics ?? [] };
    })
  );

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="flex items-center justify-between bg-slate-950 px-6 py-4 text-white">
        <div>
          <Link href="/" className="text-xs text-white/60 hover:text-white/90">
            ← Volver
          </Link>
          <h1 className="text-lg font-semibold">Panel del dueño — ambos números</h1>
        </div>
        <LogoutButton />
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-2">
        {businessData.map(({ business, questions, diagnostics }) => (
          <section
            key={business.id}
            className="overflow-hidden rounded-2xl bg-white shadow-sm"
          >
            <div
              className="px-5 py-4 text-white"
              style={{ backgroundColor: business.color_secondary }}
            >
              <p className="text-xs uppercase tracking-wide text-white/70">{business.phone_number}</p>
              <h2 className="text-lg font-semibold" style={{ fontFamily: `"${business.font_heading}", sans-serif` }}>
                {business.name}
              </h2>
              <div className="mt-3 flex gap-3 text-xs">
                <Link
                  href={`/negocio/${business.slug}/chat`}
                  className="rounded-full bg-white/15 px-3 py-1 hover:bg-white/25"
                >
                  Ir al chat
                </Link>
                <Link
                  href={`/negocio/${business.slug}/info`}
                  className="rounded-full bg-white/15 px-3 py-1 hover:bg-white/25"
                >
                  Editar protocolo
                </Link>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-sm font-semibold text-slate-900">Últimas dudas en el chat</h3>
              {questions.length === 0 ? (
                <p className="mt-1 text-sm text-slate-400">Todavía no hay preguntas.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {questions.map((q) => (
                    <li key={q.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <span className="mr-2 text-xs text-slate-400">
                        {authorNames[q.author_id] || "Equipo"}
                      </span>
                      {q.content}
                    </li>
                  ))}
                </ul>
              )}

              <h3 className="mt-5 text-sm font-semibold text-slate-900">Últimos diagnósticos</h3>
              {diagnostics.length === 0 ? (
                <p className="mt-1 text-sm text-slate-400">Sin diagnósticos registrados.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {diagnostics.map((d) => (
                    <li key={d.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      <p className="text-xs text-slate-400">
                        {new Date(d.entry_date).toLocaleDateString("es", { dateStyle: "long" })} ·{" "}
                        {authorNames[d.author_id] || "Equipo"}
                      </p>
                      <p className="mt-1 text-slate-700">{d.summary}</p>
                      {d.issues && <p className="mt-1 text-amber-700">⚠ {d.issues}</p>}
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href={`/negocio/${business.slug}/diagnostico`}
                className="mt-4 inline-block text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Ver historial completo →
              </Link>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
