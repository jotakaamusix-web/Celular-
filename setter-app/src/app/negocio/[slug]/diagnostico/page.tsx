import { createClient } from "@/lib/supabase/server";
import DiagnosticForm from "@/components/DiagnosticForm";
import DiagnosticList from "@/components/DiagnosticList";
import type { Business, DailyDiagnostic, Profile } from "@/lib/types";

export default async function DiagnosticoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single<Business>();

  if (!business) return null;

  const { data: entries } = await supabase
    .from("daily_diagnostics")
    .select("*")
    .eq("business_id", business.id)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<DailyDiagnostic[]>();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .returns<Profile[]>();

  const authorNames = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name || "Equipo"]));

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Diagnóstico diario — {business.name}
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        Un registro por día de cómo va este número: qué pasó, qué dudas surgieron y qué sigue.
      </p>

      <DiagnosticForm businessId={business.id} />

      <h3 className="mb-3 font-semibold text-slate-900">Historial</h3>
      <DiagnosticList entries={entries ?? []} authorNames={authorNames} />
    </div>
  );
}
