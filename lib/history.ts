export type GenerationRecord = {
  id: string;
  prompt: string;
  createdAt: string;
  mode: "api" | "demo";
  videoUrl: string;
  thumbnailUrl?: string;
};

const KEY = "escena.generations.v1";
const MAX = 12;

export function loadHistory(): GenerationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GenerationRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(records: GenerationRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(records.slice(0, MAX)));
}

export function prependHistory(record: GenerationRecord): GenerationRecord[] {
  const next = [record, ...loadHistory().filter((r) => r.id !== record.id)].slice(0, MAX);
  saveHistory(next);
  return next;
}
