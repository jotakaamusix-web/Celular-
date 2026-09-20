"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DiagnosticForm({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [summary, setSummary] = useState("");
  const [issues, setIssues] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;

    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Sesión expirada, vuelve a entrar.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("daily_diagnostics").insert({
      business_id: businessId,
      author_id: user.id,
      summary: summary.trim(),
      issues: issues.trim(),
      next_steps: nextSteps.trim(),
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSummary("");
    setIssues("");
    setNextSteps("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="font-semibold text-slate-900">Diagnóstico de hoy</h3>

      <label className="block text-sm font-medium text-slate-700">
        ¿Cómo fue el día / cómo va el número?
        <textarea
          required
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          placeholder="Resumen del día: leads, respuestas, cierres, ánimo general…"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Problemas o dudas que surgieron
        <textarea
          value={issues}
          onChange={(e) => setIssues(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          placeholder="Cualquier cosa que no supiste resolver o que quieras que el dueño sepa"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Próximos pasos
        <textarea
          value={nextSteps}
          onChange={(e) => setNextSteps(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          placeholder="Qué sigue pendiente para mañana"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {saving ? "Guardando…" : "Guardar diagnóstico"}
      </button>
    </form>
  );
}
