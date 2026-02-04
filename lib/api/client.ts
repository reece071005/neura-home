import { getToken } from "@/lib/storage/token";

//Neura Hub URL
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:8000";

// Types
type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    headers?: Record<string, string>;
    body?: any;
    auth?: boolean; // Bearer token
    form?: boolean;
};

// Session-expiry handling
export class SessionExpiredError extends Error {
    constructor() {
        super("SESSION_EXPIRED");
        this.name = "SessionExpiredError";
    }
}


//Global handler that runs when the user session has expired.

let onSessionExpired: null | (() => void | Promise<void>) = null;

//Prevent multiple requests
let sessionExpiredFired = false;

export function setOnSessionExpired(handler: () => void | Promise<void>) {
    onSessionExpired = handler;
}

// API request function
export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const { method = "GET", headers = {}, body, auth = false, form = false } = opts;

    const finalHeaders: Record<string, string> = { ...(headers ?? {}) };

    // Attach token if required
    if (auth) {
        const token = await getToken();
        if (token) finalHeaders.Authorization = `Bearer ${token}`;
    }

    // Body encoding
    let finalBody: any = undefined;
    if (body !== undefined) {
        if (form) {
            finalHeaders["Content-Type"] = "application/x-www-form-urlencoded";
            finalBody = body instanceof URLSearchParams ? body.toString() : String(body);
        } else {
            finalHeaders["Content-Type"] = "application/json";
            finalBody = JSON.stringify(body);
        }
    }

    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
        method,
        headers: finalHeaders,
        body: finalBody,
    });

    // Safer parsing: works even if backend returns non-JSON
    const rawText = await res.text();
    let data: any = {};
    try {
        data = rawText ? JSON.parse(rawText) : {};
    } catch {
        data = { detail: rawText };
    }

    // If token is invalid / expired, trigger global logout + redirect
    if (res.status === 401 && auth) {
        const detail = String(data?.detail ?? "");
        const msg = detail.toLowerCase();

        const looksLikeExpired =
            msg.includes("could not validate credentials") ||
            msg.includes("not authenticated") ||
            msg.includes("unauthorized");

        if (looksLikeExpired) {
            if (!sessionExpiredFired) {
                sessionExpiredFired = true;
                try {
                    await onSessionExpired?.();
                } finally {
                    setTimeout(() => {
                        sessionExpiredFired = false;
                        }, 1500);
                }
            }
            throw new SessionExpiredError();
        }
    }

    if (!res.ok) {
        console.log("API ERROR", {
            url,
            status: res.status,
            detail: data?.detail,
            raw: rawText,
        });

        throw new Error(typeof data?.detail === "string" ? data.detail : `Request failed (${res.status})`);
    }

    return data as T;
}
