"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle, signInWithGoogleIdToken } from "@/lib/actions/auth";
import { toast } from "sonner";

const GSI_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";

type GsiButtonConfig = {
  type: "standard";
  theme: "outline" | "filled_black";
  size: "large";
  text: "continue_with";
  width: number;
  logo_alignment: "left";
};

type GsiId = {
  initialize: (config: {
    client_id: string;
    callback: (res: { credential?: string }) => void;
    ux_mode: "popup";
    context: "signin";
    auto_select: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, config: GsiButtonConfig) => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GsiId } };
  }
}

let gsiLoad: Promise<GsiId> | null = null;

function loadGsi(): Promise<GsiId> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("no window"));
  }
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  if (gsiLoad) return gsiLoad;
  gsiLoad = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    const finish = () => {
      const api = window.google?.accounts?.id;
      if (api) resolve(api);
      else reject(new Error("Google script loaded without accounts.id"));
    };
    if (existing) {
      if (window.google?.accounts?.id) finish();
      else existing.addEventListener("load", finish, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.onload = finish;
    script.onerror = () => reject(new Error("Failed to load Google sign-in"));
    document.head.appendChild(script);
  });
  return gsiLoad;
}

export function GoogleSignInButton({
  nextPath = "/account",
  label,
}: {
  nextPath?: string;
  label: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let gsiApi: GsiId | null = null;
    let lastWidth = 0;

    const paint = (gsi: GsiId) => {
      const el = hostRef.current;
      if (cancelled || !el) return;
      const width = Math.round(Math.min(400, Math.max(200, el.clientWidth)));
      if (width === lastWidth) return;
      lastWidth = width;
      el.replaceChildren();
      gsi.renderButton(el, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        width,
        logo_alignment: "left",
      });
    };

    void loadGsi()
      .then((gsi) => {
        if (cancelled || !hostRef.current) return;
        gsiApi = gsi;
        gsi.initialize({
          client_id: CLIENT_ID,
          ux_mode: "popup",
          context: "signin",
          auto_select: false,
          callback: (res) => {
            const credential = res.credential?.trim();
            if (!credential) {
              toast.error("Google sign-in was cancelled");
              return;
            }
            setPending(true);
            void signInWithGoogleIdToken(credential, nextPath)
              .then((result) => {
                if ("error" in result && result.error) {
                  toast.error(result.error);
                  setPending(false);
                  return;
                }
                if ("redirectTo" in result && result.redirectTo) {
                  window.location.assign(result.redirectTo);
                }
              })
              .catch(() => {
                toast.error("Google sign-in failed");
                setPending(false);
              });
          },
        });
        paint(gsi);
      })
      .catch((err) => {
        console.error(err);
      });

    const ro = new ResizeObserver(() => {
      if (gsiApi) paint(gsiApi);
    });
    ro.observe(host);

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [nextPath]);

  if (!CLIENT_ID) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={() => {
          setPending(true);
          void signInWithGoogle(nextPath).finally(() => setPending(false));
        }}
      >
        <GoogleIcon />
        {label}
      </Button>
    );
  }

  return (
    <div className="relative w-full min-w-0 max-w-full overflow-hidden">
      <div
        ref={hostRef}
        className="flex min-h-10 w-full min-w-0 max-w-full justify-center overflow-hidden [&>div]:!w-full [&>div]:max-w-full [&_iframe]:max-w-full"
      />
      {pending ? (
        <div className="absolute inset-0 rounded-md bg-background/60" aria-hidden />
      ) : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3a12 12 0 1 1-3.4-13l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.7 1.2 7.8 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2A12 12 0 0 1 12.7 28l-6.6 5.1A20 20 0 0 0 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.3 5.2C42.4 35.2 44 30.1 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
