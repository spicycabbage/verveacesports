"use client";

import dynamic from "next/dynamic";
import { MessageCircle, X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { chatUi } from "@/lib/i18n/chat-ui";
import { useLocale } from "@/lib/i18n/I18nProvider";
import { readStoredLiveChat } from "@/lib/chat/live-agent";
import { useChatStore } from "@/lib/store/chat";
import { useCartStore } from "@/lib/store/cart";
import { useSite } from "@/lib/site/SiteProvider";
import { cn } from "@/lib/utils";

// The AI SDK (+ transport, textarea, scroll area) only downloads once a user
// actually opens chat; every storefront page mounts this widget.
const ChatPanel = dynamic(() => import("@/components/chat/ChatPanel"), { ssr: false });

export function ChatWidget() {
  const { isOpen, hasOpened, close, requestClose, toggle } = useChatStore();
  const cartOpen = useCartStore((s) => s.isOpen);
  const locale = useLocale();
  const site = useSite();
  const ui = chatUi(locale, site.supportEmail, site.id);

  useEffect(() => {
    if (cartOpen) close();
  }, [cartOpen, close]);

  useEffect(() => {
    if (readStoredLiveChat()) {
      useChatStore.setState({ hasOpened: true });
    }
  }, []);

  // Keep ChatPanel mounted while the cart drawer is open (it renders nothing
  // when closed) so the conversation isn't thrown away.
  return (
    <>
      {!cartOpen && (
        <Button
          type="button"
          size="lg"
          onClick={toggle}
          className={cn(
            "fixed bottom-5 z-[60] gap-2 shadow-xl",
            isOpen ? "right-5 sm:right-36" : "right-5 sm:right-36",
          )}
          aria-label={isOpen ? ui.close : ui.open}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="size-5" /> : <MessageCircle className="size-5" />}
          <span className="hidden sm:inline">{ui.title}</span>
        </Button>
      )}

      {hasOpened && (
        <ChatPanel open={isOpen && !cartOpen} ui={ui} locale={locale} onClose={requestClose} />
      )}
    </>
  );
}
