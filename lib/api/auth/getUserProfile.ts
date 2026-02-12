// lib/api/auth/getUserProfile.ts
import { api } from "@/lib/api/client";

export type UserRole = "admin" | "user" | string;

export type UserProfile = {
  email: string;
  username: string;
  id: number;
  is_active: boolean;
  created_at: string;
  role: UserRole;
};

export async function getUserProfile(): Promise<UserProfile> {
  return api<UserProfile>("/auth/users/get-user-profile", { method: "GET", auth: true });
}
