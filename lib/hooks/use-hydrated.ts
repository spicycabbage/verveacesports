import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` during SSR and the hydration render, `true` afterwards — without the
 * `useEffect(() => setMounted(true))` cascade. Use to gate client-only state
 * (persisted cart, localStorage) that would otherwise mismatch the server HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
