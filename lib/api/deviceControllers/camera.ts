import { apiBinary, BASE_URL } from "@/lib/api/clientBinary";
import { api } from "@/lib/api/client";
import {listDevices} from "@/lib/api/devices";

function arrayBufferToBase64(buffer: ArrayBuffer) {
  // React Native: convert bytes -> base64 without Node Buffer
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  // global btoa exists in RN
  return btoa(binary);
}

export async function getCameraSnapshotDataUri(camera_entity: string) {
  const path = `/homecontrollers/camera-snapshot?camera_entity=${encodeURIComponent(camera_entity)}`;

  const res = await apiBinary(path, {
    method: "GET",
    auth: true,
    headers: { Accept: "image/jpeg" },
  });

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buf = await res.arrayBuffer();
  const b64 = arrayBufferToBase64(buf);

  // return a renderable <Image uri>
  return `data:${contentType};base64,${b64}`;
}

/**
 * If later you make the backend accept token in query param,
 * you can use this instead and skip base64:
 */
export async function getCameraSnapshotUrl(camera_entity: string) {
  return `${BASE_URL}/homecontrollers/camera-snapshot?camera_entity=${encodeURIComponent(camera_entity)}`;
}

export type AvailableCamera = {
  id: string;
  name: string;
  area?: string | null;
  source?: string | null;
};

export async function getAvailableCameras(): Promise<AvailableCamera[]> {
  const devices = await listDevices();
  return devices
    .filter((d) => d.kind === "camera")
    .map((d) => ({
      id: d.entity_id,
      name: d.name,
      area: d.area ?? null,
      source: null, // not provided by this endpoint
    }));
}

export async function getTrackedCameras(): Promise<string[]> {
  const res = await api<{ entity_ids: string[] }>("/vision/cameras", {
    method: "GET",
    auth: true,
  });
  return res.entity_ids;
}

export async function addTrackedCamera(entity_id: string): Promise<void> {
  await api<string>("/vision/cameras", {
    method: "POST",
    auth: true,
    body: { entity_id },
  });
}

export async function removeTrackedCamera(entity_id: string): Promise<void> {
  await api<string>(`/vision/cameras/${encodeURIComponent(entity_id)}`, {
    method: "DELETE",
    auth: true,
  });
}