import { createClient } from "@/lib/supabase/server";
import ChatWindow from "@/components/ChatWindow";
import type { Business, ChatMessage } from "@/lib/types";

export default async function ChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single<Business>();

  if (!business || !user) return null;

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("business_id", business.id)
    .eq("author_id", user.id)
    .order("created_at", { ascending: true })
    .returns<ChatMessage[]>();

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Chat IA — {business.name}</h2>
      <ChatWindow slug={business.slug} initialMessages={messages ?? []} />
    </div>
  );
}
