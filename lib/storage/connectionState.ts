import { create } from "zustand";

type ConnectionState = {
  reconnecting: boolean;
  setReconnecting: (v: boolean) => void;
};

export const useConnectionState = create<ConnectionState>((set) => ({
  reconnecting: false,
  setReconnecting: (v) => set({ reconnecting: v }),
}));