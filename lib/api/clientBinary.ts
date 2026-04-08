import { getToken } from "@/lib/storage/token";
import { getHubBaseUrl } from "@/lib/storage/hubStore";

type BinaryRequestOptions = {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  auth?: boolean;
};

export async function apiBinary(path: string, opts: BinaryRequestOptions = {}) {
  const { method = "GET", headers = {}, auth = false } = opts;

  const finalHeaders: Record<string, string> = { ...(headers ?? {}) };

  if (auth) {
    const token = await getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const hub = await getHubBaseUrl();

  if (!hub) {
    throw new Error("Neura Hub not configured");
  }

  const url = `${hub}${path}`;

  const res = await fetch(url, { method, headers: finalHeaders });

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    throw new Error(raw || `Request failed (${res.status})`);
  }

  return res;
}
