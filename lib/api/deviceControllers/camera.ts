import { apiBinary, BASE_URL } from "@/lib/api/clientBinary";

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
