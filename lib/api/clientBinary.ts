import { getToken } from "@/lib/storage/token";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.239:8000";

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

  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { method, headers: finalHeaders });

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    throw new Error(raw || `Request failed (${res.status})`);
  }

  return res; // caller decides res.blob(), res.arrayBuffer(), etc.
}

export { BASE_URL };
