import { create } from "zustand";

type ChatStore = {
  isOpen: boolean;
  /** Latches on first open so the lazily loaded panel stays mounted (keeps the conversation). */
  hasOpened: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  hasOpened: false,
  open: () => set({ isOpen: true, hasOpened: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen, hasOpened: true })),
}));
