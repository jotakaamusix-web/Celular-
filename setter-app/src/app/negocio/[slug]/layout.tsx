import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import type { Business } from "@/lib/types";

export default async function BusinessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single<Business>();

  if (!business) notFound();

  const themeStyle = {
    "--color-primary": business.color_primary,
    "--color-secondary": business.color_secondary,
    "--color-accent": business.color_accent,
    "--font-heading": `"${business.font_heading}", sans-serif`,
    "--font-body": `"${business.font_body}", sans-serif`,
  } as React.CSSProperties;

  const tabs = [
    { href: `/negocio/${business.slug}/chat`, label: "Chat IA" },
    { href: `/negocio/${business.slug}/diagnostico`, label: "Diagnóstico diario" },
    { href: `/negocio/${business.slug}/info`, label: "Protocolo & Info" },
  ];

  return (
    <div style={themeStyle} className="min-h-screen font-body" data-business={business.slug}>
      <header
        className="border-b border-black/10 px-6 py-4"
        style={{ backgroundColor: business.color_secondary, color: "white" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <Link href="/" className="text-xs text-white/60 hover:text-white/90">
              ← Cambiar de número
            </Link>
            <h1
              className="text-xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {business.name}
            </h1>
            <p className="text-xs text-white/60">{business.phone_number}</p>
          </div>
          <LogoutButton />
        </div>

        <nav className="mx-auto mt-4 flex max-w-5xl gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-t-lg px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
              style={{ borderBottom: `2px solid transparent` }}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>

      <main
        className="mx-auto max-w-5xl px-6 py-8"
        style={{ accentColor: "var(--color-primary)" }}
      >
        {children}
      </main>
    </div>
  );
}
