export const LIVE_CHAT_COUNT_EVENT = "verveace-live-chat-count";

export function emitLiveChatCount(count: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(LIVE_CHAT_COUNT_EVENT, { detail: { count } }));
}
