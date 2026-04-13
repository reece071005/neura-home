//rooms.ts
import { api } from "@/lib/api/client";

export type RoomDto = {
  id: number;
  user_id: number;
  username: string;
  name: string;
  entity_ids: string[];
  created_at: string;
  updated_at: string;
};

export async function getRooms(): Promise<RoomDto[]> {
  return api<RoomDto[]>("/rooms", { method: "GET", auth: true });
}

export async function getRoom(roomId: number): Promise<RoomDto> {
  return api<RoomDto>(`/rooms/${roomId}`, { method: "GET", auth: true });
}

export async function createRoom(
  name: string,
  entity_ids: string[]
): Promise<RoomDto> {
  return api<RoomDto>("/rooms", {
    method: "POST",
    auth: true,
    body: { name, entity_ids } as any,
  });
}

export async function updateRoom(
  roomId: number,
  name: string,
  entity_ids: string[]
): Promise<RoomDto> {
  return api<RoomDto>(`/rooms/${roomId}`, {
    method: "PATCH",
    auth: true,
    body: { name, entity_ids } as any,
  });
}

export async function deleteRoom(roomId: number): Promise<void> {
  return api<void>(`/rooms/${roomId}`, { method: "DELETE", auth: true });
}