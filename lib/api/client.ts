import { getToken } from "@/lib/storage/token";
import {string} from "postcss-selector-parser";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:8000";

//Defining type request options. All the fields are optional.
type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; //API request type
    headers?: Record<string, string>; //
    body?: any; //
    auth?: boolean; //Takes token for authenitcate users.
    form?: boolean; //
}

//API request function.
export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    //Default values
    const {
        method = "GET",
        headers = {},
        body,
        auth = false,
        form = false,
    } = opts;

    const finalHeaders: Record<string, string> = {...(headers ?? {})};

    //Gets token using token.ts module (if user is authenticated).
    if (auth) {
        const token = await getToken();
        if (token) finalHeaders.Authorization = `Bearer ${token}`;
    }

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

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: finalHeaders,
        body: finalBody,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.log("API ERROR", {
        url: `${BASE_URL}${path}`,
        status: res.status,
        detail: data?.detail,
        raw: JSON.stringify(data, null, 2),
      });

      throw new Error(
        typeof data?.detail === "string"
          ? data.detail
          : `Request failed (${res.status})`
      );
    }

    return data as T;
}
