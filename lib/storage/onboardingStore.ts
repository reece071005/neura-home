/**
 * In-memory store for onboarding data.
 * Nothing is sent to the backend until the final step.
 * Cleared after successful registration.
 */

export type OnboardingData = {
  // Account
  username: string;
  email: string;
  password: string;

  // Home Assistant
  haName: string;
  haUrl: string;
  haToken: string;
};

let data: Partial<OnboardingData> = {};

export function setOnboardingAccount(username: string, email: string, password: string) {
  data = { ...data, username, email, password };
}

export function setOnboardingHA(haName: string, haUrl: string) {
  data = { ...data, haName, haUrl };
}

export function setOnboardingToken(haToken: string) {
  data = { ...data, haToken };
}

export function getOnboardingData(): Partial<OnboardingData> {
  return data;
}

export function clearOnboardingData() {
  data = {};
}

// Discovered HA instances (from mDNS scan)
export type DiscoveredHA = {
  name: string;
  host: string;
  port: number;
  url: string;
};

let discoveredInstances: DiscoveredHA[] = [];

export function setDiscoveredInstances(instances: DiscoveredHA[]) {
  discoveredInstances = instances;
}

export function getDiscoveredInstances(): DiscoveredHA[] {
  return discoveredInstances;
}