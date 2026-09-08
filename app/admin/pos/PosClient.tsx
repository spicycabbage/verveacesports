"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { parsePosCustomerEmail } from "@/lib/pos/customer-email";
import { CreditCard, Minus, Plus, Trash2, Search, PackagePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils/format";
import { sizedImageUrl } from "@/lib/images/cdn";
import { CA_REGIONS, MAX_LINE_QTY } from "@/lib/constants";
import { savePosSettings } from "@/lib/actions/pos";
import type { AdminProduct } from "@/app/admin/products/load-inventory";
import { POS_CURRENCY, type PosSettings } from "@/lib/pos/settings";
import { SITES, siteAllowsCategory, type SiteId } from "@/lib/site/config";
import { cn } from "@/lib/utils";

type Reader = {
  id: string;
  label: string | null;
  status: string;
  deviceType: string;
  serialNumber: string | null;
};

type CartLine = {
  id: string;
  productId: string | null;
  variantId: string | null;
  custom: boolean;
  name: string;
  variantTitle: string;
  description: string | null;
  sku: string | null;
  image: string | null;
  qty: number;
  unitCad: number;
  available: number;
};

type Quote = {
  subtotal: number;
  tax: number;
  taxRate: number;
  taxLines?: { label: string; amount: number }[];
  discountTotal: number;
  discountCode?: string | null;
  total: number;
};

type PendingCharge = {
  orderId: string;
  readerId: string;
  paymentIntentId: string;
};

const READER_KEY = "verveace_pos_reader_CAD";
const SITE_KEY = "verveace_pos_site";

function isSiteId(value: string | null): value is SiteId {
  return value === "verveace" || value === "bleeq-ca";
}

// localStorage-backed site selection, read through useSyncExternalStore so the
// first client render already has the persisted value (server renders the default).
const SITE_EVENT = "verveace-pos-site";
function subscribeSite(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(SITE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(SITE_EVENT, cb);
  };
}
function readStoredSite(): SiteId {
  const stored = window.localStorage.getItem(SITE_KEY);
  return isSiteId(stored) ? stored : "verveace";
}
function usePersistedSiteId(): [SiteId, (next: SiteId) => void] {
  const siteId = useSyncExternalStore(subscribeSite, readStoredSite, () => "verveace" as SiteId);
  const setSiteId = useCallback((next: SiteId) => {
    window.localStorage.setItem(SITE_KEY, next);
    window.dispatchEvent(new Event(SITE_EVENT));
  }, []);
  return [siteId, setSiteId];
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = (await res.json().catch(() => null)) as T & { error?: string };
  if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
  return json;
}

function readerLabel(r: Reader) {
  return r.label && !r.label.includes("-") ? r.label : "Counter reader";
}

const DELETE_WIDTH = 84;

function SwipeToDelete({
  open,
  onOpenChange,
  onDelete,
  disabled,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const origin = useRef(0);
  const offsetRef = useRef(0);
  const captured = useRef(false);

  function setOff(next: number) {
    offsetRef.current = next;
    setOffset(next);
  }

  // Snap to the resting position when the parent opens/closes the row (e.g.
  // another row swiped open). Adjusted during render rather than in an effect;
  // the ref is synced in onPointerDown before it's read.
  const [syncedOpen, setSyncedOpen] = useState(open);
  if (open !== syncedOpen) {
    setSyncedOpen(open);
    if (!dragging) setOffset(open ? -DELETE_WIDTH : 0);
  }

  function isDesktop() {
    return window.matchMedia("(min-width: 1024px)").matches;
  }

  return (
    <div className="relative overflow-hidden lg:overflow-visible">
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        className="absolute inset-y-0 right-0 z-0 flex w-[84px] items-center justify-center bg-red-600 text-sm font-semibold text-white lg:hidden"
        disabled={disabled}
        onClick={() => {
          onDelete();
          onOpenChange(false);
        }}
      >
        Delete
      </button>
      <div
        className={cn(
          "relative z-10 bg-background [touch-action:pan-x] [transform:translate3d(var(--sx),0,0)] lg:bg-card lg:[transform:none]",
          !dragging && "transition-transform duration-200 ease-out",
        )}
        style={{ "--sx": `${offset}px` } as CSSProperties}
        onPointerDown={(e) => {
          if (disabled || isDesktop() || e.pointerType === "mouse") return;
          startX.current = e.clientX;
          offsetRef.current = offset;
          origin.current = offset;
          captured.current = false;
        }}
        onPointerMove={(e) => {
          if (disabled || isDesktop() || e.pointerType === "mouse") return;
          const dx = e.clientX - startX.current;
          if (!captured.current) {
            if (Math.abs(dx) < 10) return;
            captured.current = true;
            setDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          setOff(Math.min(0, Math.max(-DELETE_WIDTH, origin.current + dx)));
        }}
        onPointerUp={() => {
          if (!captured.current) {
            setDragging(false);
            return;
          }
          captured.current = false;
          setDragging(false);
          const nextOpen = offsetRef.current < -DELETE_WIDTH / 2;
          onOpenChange(nextOpen);
          setOff(nextOpen ? -DELETE_WIDTH : 0);
        }}
        onPointerCancel={() => {
          captured.current = false;
          setDragging(false);
          setOff(open ? -DELETE_WIDTH : 0);
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ProductPicker({
  filtered,
  q,
  setQ,
  locked,
  currency,
  onAdd,
  onAddCustom,
  flush = false,
}: {
  filtered: AdminProduct[];
  q: string;
  setQ: (value: string) => void;
  locked: boolean;
  currency: typeof POS_CURRENCY;
  onAdd: (product: AdminProduct, variantId: string) => void;
  onAddCustom: (item: { name: string; description: string; unitPrice: number }) => void;
  flush?: boolean;
}) {
  const [customName, setCustomName] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  function submitCustom() {
    const name = customName.trim();
    const unitPrice = Number(customPrice.replace(/[^0-9.]/g, ""));
    if (!name) return toast.error("Name the custom item");
    if (!Number.isFinite(unitPrice) || unitPrice < 0.01) return toast.error("Enter a price");
    onAddCustom({ name, description: customNote.trim(), unitPrice: Math.round(unitPrice * 100) / 100 });
    setCustomName("");
    setCustomNote("");
    setCustomPrice("");
  }
  return (
    <>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products"
          className="pl-8"
          disabled={locked}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [touch-action:pan-y]">
        {filtered.map((p, index) => {
          const variants = p.variants.filter((v) => v.isActive);
          const thumb = sizedImageUrl(p.image, 160);
          const single = variants.length === 1 ? variants[0] : null;
          return (
            <div
              key={p.id}
              className={
                flush
                  ? "flex min-w-0 gap-3 border-b py-2.5 last:border-b-0"
                  : "mt-2 flex min-w-0 gap-3 overflow-hidden rounded-lg border p-2 first:mt-0"
              }
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {thumb ? (
                  <img
                    src={thumb}
                    alt=""
                    width={56}
                    height={56}
                    loading={index < 6 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "low"}
                    decoding={index === 0 ? "sync" : "async"}
                    className="h-14 w-14 object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className={flush ? "text-sm font-medium break-words" : "truncate text-sm font-medium"}>
                  {p.name}
                </p>
                {single ? (
                  <Button
                    type="button"
                    size="sm"
                    className="mt-1"
                    disabled={locked || single.available <= 0}
                    onClick={() => onAdd(p, single.id)}
                  >
                    Add · {formatPrice(single.priceCad, currency)}
                    {single.available <= 0 ? " · out" : ""}
                  </Button>
                ) : (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {variants.map((v) => (
                      <Button
                        key={v.id}
                        type="button"
                        size="xs"
                        variant="outline"
                        disabled={locked || v.available <= 0}
                        onClick={() => onAdd(p, v.id)}
                      >
                        {v.title} · {formatPrice(v.priceCad, currency)}
                        {v.available <= 0 ? " · out" : ""}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No catalog match — add a custom item below.</p>
        )}
        <div className={flush ? "border-t pt-3 pb-2" : "mt-2 rounded-lg border p-3"}>
          <p className="text-sm font-semibold">Custom item</p>
          <p className="mb-2 text-xs text-muted-foreground">One-off — not added to inventory</p>
          <div className="grid gap-2">
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Name"
              disabled={locked}
              maxLength={80}
            />
            <Input
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Description (optional)"
              disabled={locked}
              maxLength={200}
            />
            <div className="flex gap-2">
              <Input
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="Price CAD"
                inputMode="decimal"
                disabled={locked}
              />
              <Button type="button" className="shrink-0" disabled={locked} onClick={submitCustom}>
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function PosClient({
  products,
  catalogError,
  settings,
}: {
  products: AdminProduct[];
  catalogError: string | null;
  settings: PosSettings | null;
}) {
  const router = useRouter();
  const [saving, startSave] = useTransition();
  const currency = POS_CURRENCY;

  const [siteId, setSiteId] = usePersistedSiteId();
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discountCode, setDiscountCode] = useState("");
  const [email, setEmail] = useState("");
  const [invoiceEmail, setInvoiceEmail] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [lastQuote, setQuote] = useState<Quote | null>(null);
  const [lastQuoteError, setQuoteError] = useState<string | null>(null);

  const [readers, setReaders] = useState<Reader[]>([]);
  const [readerId, setReaderId] = useState("");
  const [readersError, setReadersError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);

  const [taxRegion, setTaxRegion] = useState(settings?.taxRegion ?? "BC");
  const [storeName, setStoreName] = useState(settings?.name ?? "Store");
  const [stripeLocCad, setStripeLocCad] = useState(settings?.stripeLocationIdCad ?? "");
  const [pairingCode, setPairingCode] = useState("");

  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [swipeId, setSwipeId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingCharge | null>(null);
  const [phase, setPhase] = useState<"idle" | "charging" | "declined" | "success">("idle");
  const [paidOrderId, setPaidOrderId] = useState<string | null>(null);

  const site = SITES[siteId];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products
      .filter((p) => siteAllowsCategory(site, p.category))
      .filter((p) => {
        if (!needle) return true;
        if (p.name.toLowerCase().includes(needle)) return true;
        return p.variants.some(
          (v) =>
            (v.sku && v.sku.toLowerCase().includes(needle)) ||
            v.title.toLowerCase().includes(needle),
        );
      })
      .slice(0, 50);
  }, [products, q, site]);

  const loadReaders = useCallback(async () => {
    try {
      const data = await api<{ readers: Reader[]; testMode: boolean }>(
        "/api/admin/terminal/readers",
      );
      setReaders(data.readers);
      setTestMode(data.testMode);
      setReadersError(null);
      const stored = window.localStorage.getItem(READER_KEY);
      const preferred =
        data.readers.find((r) => r.id === stored && r.status === "online") ??
        data.readers.find((r) => r.status === "online") ??
        data.readers[0];
      if (preferred) setReaderId(preferred.id);
    } catch (err) {
      setReaders([]);
      setReadersError(err instanceof Error ? err.message : "Could not reach reader");
    }
  }, []);

  useEffect(() => {
    // Initial load is deferred a tick so the effect itself doesn't set state.
    const first = window.setTimeout(() => void loadReaders(), 0);
    const id = window.setInterval(() => void loadReaders(), 8000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [loadReaders]);

  useEffect(() => {
    // Empty cart: the derived `quote`/`quoteError` (after this effect) read as null.
    if (!cart.length) return;
    const t = window.setTimeout(() => {
      void (async () => {
        try {
          const data = await api<Quote>("/api/admin/terminal/quote", {
            method: "POST",
            body: JSON.stringify({
              ...cartPayload(),
              siteId,
              discountCode: discountCode.trim() || undefined,
            }),
          });
          setQuote(data);
          setQuoteError(null);
        } catch (err) {
          setQuoteError(err instanceof Error ? err.message : "Could not price cart");
        }
      })();
    }, 200);
    return () => window.clearTimeout(t);
  }, [cart, discountCode, siteId]);
  const quote = cart.length ? lastQuote : null;
  const quoteError = cart.length ? lastQuoteError : null;

  useEffect(() => {
    if (phase !== "charging" || !pending) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const st = await api<{
          orderStatus: string;
          readerAction: string | null;
          readerFailure: string | null;
        }>(`/api/admin/terminal/status?orderId=${pending.orderId}&readerId=${pending.readerId}`);
        if (cancelled) return;
        if (st.orderStatus === "paid" || st.orderStatus === "delivered" || st.orderStatus === "shipped") {
          setPhase("success");
          setPaidOrderId(pending.orderId);
          setCart([]);
          toast.success(invoiceEmail ? `Paid · invoice emailed to ${invoiceEmail}` : "Paid");
          return;
        }
        if (st.orderStatus === "cancelled") {
          setPhase("idle");
          setPending(null);
          toast.error("Cancelled");
          return;
        }
        if (st.readerAction === "failed" || st.readerFailure) {
          setPhase("declined");
          toast.error(st.readerFailure || "Card declined");
        }
      } catch {
        /* next poll */
      }
    };
    void tick();
    const id = window.setInterval(() => void tick(), 1500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [phase, pending, invoiceEmail]);

  function addVariant(product: AdminProduct, variantId: string) {
    const v = product.variants.find((x) => x.id === variantId);
    if (!v || !v.isActive) return;
    const existing = cart.find((l) => l.variantId === v.id);
    if (existing && existing.qty >= v.available) {
      toast.error("That's all we have");
      return;
    }
    setCart((prev) => {
      const line = prev.find((l) => l.variantId === v.id);
      if (line) {
        return prev.map((l) =>
          l.variantId === v.id ? { ...l, qty: Math.min(l.qty + 1, Math.max(1, v.available)) } : l,
        );
      }
      return [
        ...prev,
        {
          id: v.id,
          productId: product.id,
          variantId: v.id,
          custom: false,
          name: product.name,
          variantTitle: v.title,
          description: null,
          sku: v.sku,
          image: product.image,
          qty: 1,
          unitCad: v.priceCad,
          available: v.available,
        },
      ];
    });
    toast.success(v.title !== "Default" ? `Added ${product.name} · ${v.title}` : `Added ${product.name}`, {
      duration: 1600,
    });
  }

  function addCustom(item: { name: string; description: string; unitPrice: number }) {
    setCart((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        productId: null,
        variantId: null,
        custom: true,
        name: item.name,
        variantTitle: "Custom",
        description: item.description || null,
        sku: "POS-CUSTOM",
        image: null,
        qty: 1,
        unitCad: item.unitPrice,
        available: MAX_LINE_QTY,
      },
    ]);
    setPickerOpen(false);
    toast.success(`Added ${item.name}`, { duration: 1600 });
  }

  function setQty(lineId: string, qty: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.id === lineId ? { ...l, qty: Math.max(0, Math.min(qty, l.available)) } : l))
        .filter((l) => l.qty > 0),
    );
  }

  function cartPayload() {
    return {
      items: cart
        .filter((l) => !l.custom && l.productId && l.variantId)
        .map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty })),
      customItems: cart
        .filter((l) => l.custom)
        .map((l) => ({
          name: l.name,
          description: l.description || undefined,
          unitPrice: l.unitCad,
          qty: l.qty,
        })),
    };
  }

  async function charge() {
    if (!cart.length) return toast.error("Add an item first");
    if (!readerId) return toast.error("Reader not found");
    if (selectedReader?.status !== "online") return toast.error("Turn the terminal on");
    const sendTo = parsePosCustomerEmail(email);
    if (email.trim() && !sendTo) {
      toast.message("Email looks invalid — charging without invoice");
    }
    setInvoiceEmail(sendTo ?? null);
    setBusy(true);
    try {
      const data = await api<PendingCharge>("/api/admin/terminal/charge", {
        method: "POST",
        body: JSON.stringify({
          ...cartPayload(),
          siteId,
          readerId,
          discountCode: discountCode.trim() || undefined,
          email: sendTo,
          customerName: customerName.trim() || undefined,
        }),
      });
      window.localStorage.setItem(READER_KEY, readerId);
      setPending(data);
      setPhase("charging");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Charge failed");
    } finally {
      setBusy(false);
    }
  }

  async function retryCharge() {
    if (!pending) return;
    setBusy(true);
    try {
      await api("/api/admin/terminal/retry", {
        method: "POST",
        body: JSON.stringify({ orderId: pending.orderId, readerId: pending.readerId }),
      });
      setPhase("charging");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setBusy(false);
    }
  }

  async function cancelCharge() {
    if (!pending) return;
    setBusy(true);
    try {
      await api("/api/admin/terminal/cancel", {
        method: "POST",
        body: JSON.stringify({ orderId: pending.orderId, readerId: pending.readerId }),
      });
      setPending(null);
      setPhase("idle");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setBusy(false);
    }
  }

  async function simulateTap() {
    if (!pending) return;
    setBusy(true);
    try {
      await api("/api/admin/terminal/simulate", {
        method: "POST",
        body: JSON.stringify({ readerId: pending.readerId }),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Simulate failed");
    } finally {
      setBusy(false);
    }
  }

  function saveStore() {
    startSave(async () => {
      const res = await savePosSettings({
        name: storeName,
        taxRegion,
        line1: settings?.line1 ?? "",
        city: settings?.city ?? "",
        postalCode: settings?.postalCode ?? "",
        stripeLocationIdCad: stripeLocCad,
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Saved");
      router.refresh();
    });
  }

  async function registerReader() {
    if (!pairingCode.trim()) return;
    setBusy(true);
    try {
      const data = await api<{ reader: Reader }>("/api/admin/terminal/register", {
        method: "POST",
        body: JSON.stringify({ registrationCode: pairingCode.trim() }),
      });
      setPairingCode("");
      setReaderId(data.reader.id);
      window.localStorage.setItem(READER_KEY, data.reader.id);
      toast.success("Reader paired");
      await loadReaders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Pair failed");
    } finally {
      setBusy(false);
    }
  }

  function switchSite(next: SiteId) {
    if (next === siteId) return;
    if (locked) return;
    setSiteId(next);
    const nextSite = SITES[next];
    setCart((prev) =>
      prev.filter((l) => {
        if (l.custom) return true;
        const product = products.find((p) => p.id === l.productId);
        return product ? siteAllowsCategory(nextSite, product.category) : false;
      }),
    );
  }

  const selectedReader = readers.find((r) => r.id === readerId);
  const online = selectedReader?.status === "online";
  const locked = phase === "charging" || phase === "declined";
  const total = quote?.total ?? 0;
  const canCharge = Boolean(cart.length && readerId && online && !busy && phase === "idle");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="hidden text-2xl font-bold tracking-tight lg:block">Register</h1>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex shrink-0 rounded-lg border p-0.5">
            <Button
              type="button"
              size="sm"
              variant={siteId === "verveace" ? "default" : "ghost"}
              disabled={locked}
              onClick={() => switchSite("verveace")}
            >
              Verveace
            </Button>
            <Button
              type="button"
              size="sm"
              variant={siteId === "bleeq-ca" ? "default" : "ghost"}
              disabled={locked}
              onClick={() => switchSite("bleeq-ca")}
            >
              Bleeq
            </Button>
          </div>
          <span
            className={cn(
              "ml-auto inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold",
              online ? "bg-yellow-400 text-black" : "bg-red-600 text-white",
            )}
          >
            {online ? "Terminal ready" : "Terminal offline"}
          </span>
          <Badge variant="outline" className="hidden lg:inline-flex">
            CAD
          </Badge>
        </div>
      </div>

      {readersError && <p className="text-sm text-destructive">{readersError}</p>}
      {catalogError && <p className="text-sm text-destructive">{catalogError}</p>}

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="hidden lg:block">
          <CardContent className="flex max-h-[min(620px,calc(100dvh-12rem))] flex-col space-y-3 pt-4">
            <ProductPicker
              filtered={filtered}
              q={q}
              setQ={setQ}
              locked={locked}
              currency={currency}
              onAdd={addVariant}
              onAddCustom={addCustom}
            />
          </CardContent>
        </Card>

        <Card className="max-lg:gap-0 max-lg:overflow-visible max-lg:rounded-none max-lg:bg-transparent max-lg:py-0 max-lg:ring-0">
          <CardContent className="space-y-3 pt-4 max-lg:px-0 max-lg:pt-0">
            {phase === "idle" && (
              <Button
                type="button"
                size="lg"
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 lg:hidden"
                disabled={locked}
                onClick={() => setPickerOpen(true)}
              >
                <PackagePlus />
                Add items
              </Button>
            )}
            <p className="hidden text-sm font-semibold lg:block">Sale · {site.shortName}</p>
            {cart.length === 0 && (
              <p className="text-sm text-muted-foreground">Tap Add items to start a sale</p>
            )}
            {cart.map((l) => (
              <SwipeToDelete
                key={l.id}
                open={swipeId === l.id}
                onOpenChange={(next) => setSwipeId(next ? l.id : null)}
                disabled={locked}
                onDelete={() => setQty(l.id, 0)}
              >
                <div className="flex items-center gap-2 py-0.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium break-words">{l.name}</p>
                    {l.custom && l.description ? (
                      <p className="text-xs text-muted-foreground">{l.description}</p>
                    ) : l.variantTitle !== "Default" && l.variantTitle !== "Custom" ? (
                      <p className="text-xs text-muted-foreground">{l.variantTitle}</p>
                    ) : null}
                  </div>
                  <div
                    className="flex items-center gap-1"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="outline"
                      disabled={locked}
                      onClick={() => setQty(l.id, l.qty - 1)}
                    >
                      <Minus />
                    </Button>
                    <span className="w-6 text-center text-sm tabular-nums">{l.qty}</span>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="outline"
                      disabled={locked}
                      onClick={() => setQty(l.id, l.qty + 1)}
                    >
                      <Plus />
                    </Button>
                  </div>
                  <span className="w-16 text-right text-sm tabular-nums">
                    {formatPrice(l.unitCad * l.qty, currency)}
                  </span>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    className="hidden lg:inline-flex"
                    disabled={locked}
                    onClick={() => setQty(l.id, 0)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </SwipeToDelete>
            ))}

            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Customer email — send invoice"
              disabled={locked}
              autoComplete="off"
            />
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name (optional)"
              disabled={locked}
              autoComplete="off"
            />
            <Input
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Code, $5, or 10%"
              disabled={locked}
            />

            {quoteError && <p className="text-sm text-destructive">{quoteError}</p>}
            {quote && (
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(quote.subtotal, currency)}</dd>
                </div>
                {quote.discountTotal > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <dt>{quote.discountCode ? `Discount (${quote.discountCode})` : "Discount"}</dt>
                    <dd>−{formatPrice(quote.discountTotal, currency)}</dd>
                  </div>
                )}
                {(quote.taxLines?.length
                  ? quote.taxLines
                  : [{ label: "Tax", amount: quote.tax }]
                ).map((line) => (
                  <div key={line.label} className="flex justify-between text-muted-foreground">
                    <dt>{line.label}</dt>
                    <dd>{formatPrice(line.amount, currency)}</dd>
                  </div>
                ))}
                <div className="flex justify-between text-lg font-semibold">
                  <dt>Total</dt>
                  <dd>{formatPrice(quote.total, currency)}</dd>
                </div>
              </dl>
            )}

            {phase === "charging" && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm font-medium">
                Look at the terminal. Customer taps or inserts their card.
              </div>
            )}
            {phase === "declined" && (
              <p className="text-sm text-destructive">Card declined. Try again or cancel.</p>
            )}
            {phase === "success" && paidOrderId && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                Paid
                {invoiceEmail ? `. Invoice emailed to ${invoiceEmail}` : ""}.{" "}
                <Link href={`/admin/orders/${paidOrderId}/invoice`} className="underline">
                  Print receipt
                </Link>
              </div>
            )}

            {phase === "idle" && (
              <Button
                type="button"
                size="lg"
                className={cn(
                  "h-14 w-full bg-emerald-600 text-lg text-white hover:bg-emerald-700 [&_svg]:size-6",
                  cart.length === 0 && "max-lg:hidden",
                )}
                onClick={charge}
                disabled={!canCharge}
              >
                <CreditCard />
                {cart.length === 0
                  ? "Add an item"
                  : !online
                    ? "Turn the terminal on"
                    : `Charge ${formatPrice(total, currency)}`}
              </Button>
            )}
            {phase === "success" && (
              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={() => {
                  setPhase("idle");
                  setPending(null);
                  setPaidOrderId(null);
                  setEmail("");
                  setInvoiceEmail(null);
                  setCustomerName("");
                  setDiscountCode("");
                }}
              >
                New sale
              </Button>
            )}
            {phase === "declined" && (
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" onClick={retryCharge} disabled={busy}>
                  Try again
                </Button>
                <Button type="button" variant="destructive" onClick={cancelCharge} disabled={busy}>
                  Cancel
                </Button>
              </div>
            )}
            {phase === "charging" && (
              <div className="grid gap-2">
                <Button type="button" variant="destructive" onClick={cancelCharge} disabled={busy}>
                  Cancel charge
                </Button>
                {testMode && (
                  <Button type="button" variant="outline" onClick={simulateTap} disabled={busy}>
                    Simulate tap
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent
          layout="full"
          className="gap-3 overflow-hidden overscroll-none pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          initialFocus={false}
        >
          <DialogHeader>
            <DialogTitle>Add items</DialogTitle>
          </DialogHeader>
          {pickerOpen ? (
            <ProductPicker
              filtered={filtered}
              q={q}
              setQ={setQ}
              locked={locked}
              currency={currency}
              onAdd={addVariant}
              onAddCustom={addCustom}
              flush
            />
          ) : null}
          <Button
            type="button"
            size="lg"
            className="h-14 w-full bg-emerald-600 text-lg text-white hover:bg-emerald-700"
            onClick={() => setPickerOpen(false)}
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>

      <details className="hidden rounded-lg border px-3 py-2 text-sm lg:block">
        <summary className="cursor-pointer text-muted-foreground">Advanced (pairing / tax)</summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Tax province</Label>
            <Select value={taxRegion} onValueChange={(v) => v && setTaxRegion(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CA_REGIONS.map((r) => (
                  <SelectItem key={r.code} value={r.code}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Store name" />
            <Input
              value={stripeLocCad}
              onChange={(e) => setStripeLocCad(e.target.value)}
              placeholder="Stripe location id"
            />
            <Button type="button" variant="outline" onClick={saveStore} disabled={saving}>
              Save
            </Button>
          </div>
          <div className="grid gap-2">
            <Label>Pair a new reader</Label>
            <div className="flex gap-2">
              <Input
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value)}
                placeholder="Pairing code from device"
              />
              <Button type="button" variant="outline" onClick={registerReader} disabled={busy}>
                Pair
              </Button>
            </div>
            {readers.length > 1 && (
              <Select
                value={readerId}
                onValueChange={(v) => {
                  if (!v) return;
                  setReaderId(v);
                  window.localStorage.setItem(READER_KEY, v);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {readers.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {readerLabel(r)} · {r.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button type="button" variant="ghost" onClick={() => void loadReaders()}>
              Refresh terminal status
            </Button>
          </div>
        </div>
      </details>
    </div>
  );
}
