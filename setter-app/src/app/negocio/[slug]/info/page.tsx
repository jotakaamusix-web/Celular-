import { createClient } from "@/lib/supabase/server";
import InfoBoard from "@/components/InfoBoard";
import type { Business, BusinessInfo, Profile } from "@/lib/types";

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const { data: entries } = await supabase
    .from("business_info")
    .select("*")
    .eq("business_id", business.id)
    .order("updated_at", { ascending: false })
    .returns<BusinessInfo[]>();

  const isOwner = profile?.role === "owner";

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-slate-900">
        Protocolo & Info — {business.name}
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        {isOwner
          ? "Carga aquí todo lo que la IA y tu setter necesitan saber para no tener que preguntarte."
          : "Esto es lo que el dueño cargó para este negocio. La IA del chat ya lo conoce."}
      </p>
      <InfoBoard businessId={business.id} entries={entries ?? []} isOwner={isOwner} />
    </div>
  );
}
