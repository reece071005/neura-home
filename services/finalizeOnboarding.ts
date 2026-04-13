import {
  getOnboardingData,
  clearOnboardingData,
} from "@/lib/storage/onboardingStore";

import { register } from "@/lib/api/auth";
import { saveHomeAssistantConfig } from "@/lib/api/hub/homeAssistant";

export type FinalizeOnboardingResult = {
  userId: number;
  username: string;
  email: string;
  role: "admin" | "user";
  haUrl?: string;
};

function normalizeHaUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

export async function finalizeOnboarding(): Promise<FinalizeOnboardingResult> {
  const d = getOnboardingData();

  // Account required
  if (!d.email || !d.username || !d.password) {
    throw new Error("Missing account details. Please go back and complete account setup.");
  }

  // HA required
  if (!d.haUrl || !d.haToken) {
    throw new Error("Missing Home Assistant details. Please go back and complete setup.");
  }

  const haUrl = normalizeHaUrl(d.haUrl);
  const haToken = d.haToken.trim();

  //Register user
  const user = await register(d.email, d.username, d.password);

  //Save HA config (
  await saveHomeAssistantConfig({
    url: haUrl,
    secret: haToken,
  });

  //Clear onboarding data
  clearOnboardingData();

  return {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    haUrl,
  };
}

