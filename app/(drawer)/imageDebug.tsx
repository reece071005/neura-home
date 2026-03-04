import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiBinary, BASE_URL } from "@/lib/api/clientBinary";
import { getToken } from "@/lib/storage/token";

/**
 * DROP THIS SCREEN ANYWHERE IN YOUR APP TEMPORARILY.
 * It will log exactly what's going wrong with image loading.
 * Remove once images are working.
 */
export default function ImageDebug() {
  const [log, setLog] = useState<string[]>([]);

  const add = (msg: string) => {
    console.log("[ImageDebug]", msg);
    setLog((prev) => [...prev, msg]);
  };

  useEffect(() => {
    (async () => {
        add("--- Notification response shape ---");
        try {
            const { api } = await import("@/lib/api/client");
            const notifs = await api<any[]>("/vision/get-all-notifications?limit=1", { auth: true });
            add(`Fields: ${Object.keys(notifs[0] ?? {}).join(", ")}`);
            add(`Sample: ${JSON.stringify(notifs[0])}`);
        } catch (e: any) {
            add(`Notif fetch error: ${e?.message}`);
        }
      // 1. Check BASE_URL
      add(`BASE_URL = ${BASE_URL}`);

      // 2. Check token exists
      const token = await getToken();
      add(`Token = ${token ? token.slice(0, 20) + "..." : "NULL / MISSING"}`);

      // 3. Try the exact filename from your DB
      const testFilename = "camera_demo_camera_hd_stream_direct_2026-03-04_08-14-54.jpg";
      const testUrl = `${BASE_URL}/notify/${testFilename}`;
      add(`Fetching: ${testUrl}`);

      // 4. Raw fetch WITH auth header
      try {
        const res = await fetch(testUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        add(`Status: ${res.status} ${res.statusText}`);
        add(`Content-Type: ${res.headers.get("content-type") ?? "none"}`);
        add(`Content-Length: ${res.headers.get("content-length") ?? "unknown"}`);

        if (!res.ok) {
          const body = await res.text();
          add(`Error body: ${body.slice(0, 200)}`);
          return;
        }

        const blob = await res.blob();
        add(`Blob size: ${blob.size} bytes, type: ${blob.type}`);

        if (blob.size === 0) {
          add("ERROR: Blob is empty — server returned no data");
          return;
        }

        // 5. Try FileReader
        const b64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(blob);
        });
        add(`Base64 prefix: ${b64.slice(0, 60)}`);
        add("SUCCESS: Image loaded correctly");
      } catch (e: any) {
        add(`FETCH ERROR: ${e?.message ?? String(e)}`);
      }

      // 6. Also try WITHOUT auth in case the endpoint is public
      add("--- Retrying WITHOUT auth header ---");
      try {
        const res2 = await fetch(testUrl);
        add(`No-auth status: ${res2.status}`);
      } catch (e: any) {
        add(`No-auth fetch error: ${e?.message}`);
      }

      // 7. Try apiBinary helper directly
      add("--- Testing apiBinary helper ---");
      try {
        const res3 = await apiBinary(`/notify/${testFilename}`, { auth: true });
        add(`apiBinary status: ${res3.status}`);
        const blob3 = await res3.blob();
        add(`apiBinary blob size: ${blob3.size}`);
      } catch (e: any) {
        add(`apiBinary ERROR: ${e?.message}`);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f0f0f" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: "#facc15", fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
          Image Debug Log
        </Text>
        {log.map((line, i) => (
          <Text
            key={i}
            style={{
              color: line.startsWith("ERROR") || line.startsWith("FETCH")
                ? "#f87171"
                : line.startsWith("SUCCESS")
                ? "#4ade80"
                : "#e5e7eb",
              fontFamily: "monospace",
              fontSize: 12,
              marginBottom: 6,
              lineHeight: 18,
            }}
          >
            {line}
          </Text>
        ))}
        {log.length === 0 && (
          <Text style={{ color: "#6b7280", fontSize: 12 }}>Running tests...</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}