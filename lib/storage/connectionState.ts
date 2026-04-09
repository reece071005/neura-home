import { create } from "zustand";

type ConnectionState = {
  reconnecting: boolean
  connectionLost: boolean
  setReconnecting: (v: boolean) => void
  setConnectionLost: (v: boolean) => void
}

export const useConnectionState = create<ConnectionState>((set) => ({
  reconnecting: false,
  connectionLost: false,

  setReconnecting: (v) => set({ reconnecting: v }),
  setConnectionLost: (v) => set({ connectionLost: v })
}));