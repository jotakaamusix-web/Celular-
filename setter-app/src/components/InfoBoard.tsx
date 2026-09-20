"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { BusinessInfo, InfoSection } from "@/lib/types";
import { SECTION_LABELS } from "@/lib/types";

const SECTIONS: InfoSection[] = ["protocolo", "servicios", "precios", "negociacion", "otros"];

function AddEntryForm({
  businessId,
  section,
  onDone,
}: {
  businessId: string;
  section: InfoSection;
  onDone: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("business_info").insert({
      business_id: businessId,
      section,
      title: title.trim(),
      content: content.trim(),
      updated_by: user?.id,
    });

    setSaving(false);
    setTitle("");
    setContent("");
    onDone();
  }

  return (
    <form onSubmit={handleAdd} className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título (ej. Horario de atención)"
        className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Detalle / instrucción completa"
        rows={2}
        className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {saving ? "Agregando…" : "Agregar"}
      </button>
    </form>
  );
}

function EntryRow({ entry, isOwner, onChanged }: { entry: BusinessInfo; isOwner: boolean; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("business_info")
      .update({ title: title.trim(), content: content.trim(), updated_at: new Date().toISOString() })
      .eq("id", entry.id);
    setSaving(false);
    setEditing(false);
    onChanged();
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${entry.title}"?`)) return;
    const supabase = createClient();
    await supabase.from("business_info").delete().eq("id", entry.id);
    onChanged();
  }

  if (editing) {
    return (
      <li className="space-y-2 rounded-lg border border-slate-200 p-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white"
          >
            Guardar
          </button>
          <button onClick={() => setEditing(false)} className="text-xs text-slate-500">
            Cancelar
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
          <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-600">{entry.content}</p>
        </div>
        {isOwner && (
          <div className="flex shrink-0 gap-2 text-xs">
            <button onClick={() => setEditing(true)} className="text-slate-500 hover:text-slate-800">
              Editar
            </button>
            <button onClick={handleDelete} className="text-red-500 hover:text-red-700">
              Eliminar
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

export default function InfoBoard({
  businessId,
  entries,
  isOwner,
}: {
  businessId: string;
  entries: BusinessInfo[];
  isOwner: boolean;
}) {
  const router = useRouter();
  const [addingSection, setAddingSection] = useState<InfoSection | null>(null);

  function refresh() {
    setAddingSection(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {SECTIONS.map((section) => {
        const rows = entries.filter((e) => e.section === section);
        return (
          <div key={section} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{SECTION_LABELS[section]}</h3>
              {isOwner && (
                <button
                  onClick={() => setAddingSection(addingSection === section ? null : section)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  {addingSection === section ? "Cerrar" : "+ Agregar"}
                </button>
              )}
            </div>

            {rows.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">Sin información cargada todavía.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {rows.map((entry) => (
                  <EntryRow key={entry.id} entry={entry} isOwner={isOwner} onChanged={refresh} />
                ))}
              </ul>
            )}

            {isOwner && addingSection === section && (
              <AddEntryForm businessId={businessId} section={section} onDone={refresh} />
            )}
          </div>
        );
      })}
    </div>
  );
}
