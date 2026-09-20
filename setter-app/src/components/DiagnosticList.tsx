import type { DailyDiagnostic } from "@/lib/types";

export default function DiagnosticList({
  entries,
  authorNames,
}: {
  entries: DailyDiagnostic[];
  authorNames: Record<string, string>;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-400">Todavía no hay diagnósticos registrados.</p>;
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{new Date(entry.entry_date).toLocaleDateString("es", { dateStyle: "long" })}</span>
            <span>{authorNames[entry.author_id] || "Equipo"}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{entry.summary}</p>
          {entry.issues && (
            <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <span className="font-medium">Dudas/problemas: </span>
              {entry.issues}
            </div>
          )}
          {entry.next_steps && (
            <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <span className="font-medium">Próximos pasos: </span>
              {entry.next_steps}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
