// aiGetSummary.ts
import { api } from "@/lib/api/client";

export type ModelSummary = {
  trained: boolean;
  metrics: Record<string, any> | null;
  feature_columns?: string[];
  domain?: string;
  horizon_minutes?: number;
  freq?: string;
};

export type ModelSummaryResponse = {
  ok: boolean;
  room: string;
  models: Record<string, ModelSummary>;
};

export async function getModelSummary(room: string) {
  const url = `/ai/model-summary?room=${encodeURIComponent(room)}`;

  const res = await api<ModelSummaryResponse>(url, {
    method: "GET",
    auth: true,
  });

  return res;
}