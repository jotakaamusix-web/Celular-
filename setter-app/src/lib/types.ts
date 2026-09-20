export type Role = "owner" | "setter";

export type Profile = {
  id: string;
  full_name: string;
  role: Role;
  created_at: string;
};

export type Business = {
  id: string;
  slug: string;
  name: string;
  phone_number: string;
  color_primary: string;
  color_secondary: string;
  color_accent: string;
  font_heading: string;
  font_body: string;
  created_at: string;
};

export type InfoSection = "protocolo" | "servicios" | "precios" | "negociacion" | "otros";

export type BusinessInfo = {
  id: string;
  business_id: string;
  section: InfoSection;
  title: string;
  content: string;
  updated_at: string;
  updated_by: string | null;
};

export type ChatMessage = {
  id: string;
  business_id: string;
  author_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type DailyDiagnostic = {
  id: string;
  business_id: string;
  author_id: string;
  entry_date: string;
  summary: string;
  issues: string;
  next_steps: string;
  created_at: string;
};

export const SECTION_LABELS: Record<InfoSection, string> = {
  protocolo: "Protocolo a cumplir",
  servicios: "Servicios",
  precios: "Precios",
  negociacion: "Cómo negociar",
  otros: "Otros datos",
};
