import { clearToken } from "@/lib/storage/token";
import { router } from "expo-router";

export async function logout() {
  await clearToken();
  router.replace("/"); // or your hub/login route
}
