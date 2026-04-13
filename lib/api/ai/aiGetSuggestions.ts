// aiGetSuggestions.ts
import { api } from "@/lib/api/client";

export type AISuggestion = {
  type: string;
  entity_id: string;
  action: Record<string, any>;
  confidence: number;
};

export type AISuggestionsResponse = {
  ok: boolean;
  room: string;
  preview: boolean;
  suggestions: AISuggestion[];
};

export async function getAISuggestions(room: string) {
  const res = await api<AISuggestionsResponse>(
    `/ai/arrival-preview?room=${encodeURIComponent(room)}`,
    {
      method: "GET",
      auth: true,
    }
  );

  return res;
}