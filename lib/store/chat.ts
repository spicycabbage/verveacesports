import { create } from "zustand";

type ChatStore = {
  isOpen: boolean;
  /** Latches on first open so the lazily loaded panel stays mounted (keeps the conversation). */
  hasOpened: boolean;
  /** Profile-menu Live Agent: skip the AI welcome, queue a human. */
  liveOnly: boolean;
  /** Bumps when the profile menu asks to skip the AI and queue a live agent. */
  liveAgentRequestId: number;
  /** Bumps when the shopper hits X — show confirm, then archive. */
  closeRequestId: number;
  liveDismissId: number;
  open: () => void;
  close: () => void;
  requestClose: () => void;
  dismiss: () => void;
  toggle: () => void;
  openLiveAgent: () => void;
  /** Reopen an existing live thread without queueing a new request. */
  resumeLiveChat: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  hasOpened: false,
  liveOnly: false,
  liveAgentRequestId: 0,
  closeRequestId: 0,
  liveDismissId: 0,
  open: () => set({ isOpen: true, hasOpened: true, liveOnly: false }),
  close: () => set({ isOpen: false }),
  requestClose: () => set((s) => ({ closeRequestId: s.closeRequestId + 1 })),
  dismiss: () =>
    set((s) => ({
      isOpen: false,
      liveOnly: false,
      liveDismissId: s.liveDismissId + 1,
    })),
  toggle: () =>
    set((s) =>
      s.isOpen
        ? { closeRequestId: s.closeRequestId + 1 }
        : { isOpen: true, hasOpened: true, liveOnly: false },
    ),
  openLiveAgent: () =>
    set((s) => ({
      isOpen: true,
      hasOpened: true,
      liveOnly: true,
      liveAgentRequestId: s.liveAgentRequestId + 1,
    })),
  resumeLiveChat: () => set({ isOpen: true, hasOpened: true, liveOnly: true }),
}));
