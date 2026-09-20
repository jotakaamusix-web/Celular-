import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import type { Business, Profile } from "@/lib/types";

export default async function HomePage() {
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

  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .order("slug")
    .returns<Business[]>();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <p className="text-sm text-white/50">Hola, {profile?.full_name || user.email}</p>
          <h1 className="text-lg font-semibold">Elige el número con el que vas a trabajar</h1>
        </div>
        <div className="flex items-center gap-3">
          {profile?.role === "owner" && (
            <Link
              href="/panel"
              className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
            >
              Panel del dueño
            </Link>
          )}
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 px-6 py-12 sm:grid-cols-2">
        {(businesses ?? []).map((b) => (
          <Link
            key={b.id}
            href={`/negocio/${b.slug}/chat`}
            className="group relative overflow-hidden rounded-2xl p-6 shadow-lg transition hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${b.color_primary}, ${b.color_secondary})`,
            }}
          >
            <p className="text-xs uppercase tracking-wide text-white/70">Modo</p>
            <h2
              className="mt-1 text-2xl font-semibold"
              style={{ fontFamily: `"${b.font_heading}", sans-serif` }}
            >
              {b.name}
            </h2>
            <p className="mt-2 text-sm text-white/80">{b.phone_number}</p>
            <span
              className="mt-6 inline-block rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: b.color_accent, color: "#0f172a" }}
            >
              Entrar a este modo →
            </span>
          </Link>
        ))}

        {(!businesses || businesses.length === 0) && (
          <p className="text-white/60">
            Aún no hay negocios configurados. Corre <code>supabase/schema.sql</code> en tu
            proyecto de Supabase.
          </p>
        )}
      </div>
    </main>
  );
}
