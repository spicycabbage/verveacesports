"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Mail, Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addShipmentTracking,
  createFulfillment,
  deleteShipmentTracking,
  resendShipmentEmail,
  updateFulfillmentTracking,
} from "@/lib/actions/fulfillment";
import {
  SHIPPING_CARRIERS,
  carrierIdFromCompany,
  carrierLabel,
  isShippingCarrierId,
  type ShippingCarrierId,
} from "@/lib/shipping/carriers";
import { TrackingLink } from "@/components/orders/TrackingLink";

type Item = { id: string; name: string; remaining: number };
type Shipment = {
  id: string;
  company: string | null;
  number: string | null;
  url: string | null;
};

type Mode = { kind: "view" } | { kind: "edit"; id: string } | { kind: "add" };

export function OrderFulfillPanel({
  orderId,
  remaining,
  items,
  shipments,
  hasEmail,
}: {
  orderId: string;
  remaining: number;
  items: Item[];
  shipments: Shipment[];
  hasEmail: boolean;
}) {
  const router = useRouter();
  const [saving, startSave] = useTransition();
  const [resending, startResend] = useTransition();
  const [mode, setMode] = useState<Mode>({ kind: "view" });
  const trackable = shipments.filter((s) => s.company !== "In-store pickup" && s.number);

  const pickupOnly =
    remaining <= 0 && shipments.length > 0 && shipments.every((s) => s.company === "In-store pickup");

  function afterSave() {
    setMode({ kind: "view" });
    router.refresh();
  }

  function resend() {
    startResend(async () => {
      const res = await resendShipmentEmail(orderId);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Tracking emailed to customer");
    });
  }

  function removeTracking(fulfillmentId: string) {
    startSave(async () => {
      const res = await deleteShipmentTracking(fulfillmentId);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Tracking removed");
      afterSave();
    });
  }

  if (pickupOnly) {
    return (
      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          In-store pickup — no tracking.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <h3 className="text-sm font-semibold">{remaining > 0 ? "Fulfill order" : "Tracking"}</h3>
        {remaining > 0 ? (
          <>
            <ul className="space-y-0.5 text-sm text-muted-foreground">
              {items
                .filter((i) => i.remaining > 0)
                .map((i) => (
                  <li key={i.id} className="flex justify-between gap-2">
                    <span className="truncate">{i.name}</span>
                    <span className="tabular-nums">×{i.remaining}</span>
                  </li>
                ))}
            </ul>
            <TrackingForm
              idPrefix="fulfill"
              pending={saving}
              submitLabel="Mark fulfilled & ship"
              onSubmit={(carrierId, trackingNumber) => {
                startSave(async () => {
                  const res = await createFulfillment({ orderId, carrierId, trackingNumber });
                  if ("error" in res) {
                    toast.error(res.error);
                    return;
                  }
                  toast.success(hasEmail ? "Fulfilled — tracking emailed" : "Fulfilled");
                  afterSave();
                });
              }}
            />
          </>
        ) : null}

        {trackable.map((s) =>
          mode.kind === "edit" && mode.id === s.id ? (
            <TrackingForm
              key={s.id}
              idPrefix={`edit-${s.id}`}
              pending={saving}
              initialCarrier={carrierIdFromCompany(s.company) ?? "canada-post"}
              initialNumber={s.number ?? ""}
              submitLabel="Save tracking"
              onCancel={() => setMode({ kind: "view" })}
              onSubmit={(carrierId, trackingNumber) => {
                startSave(async () => {
                  const res = await updateFulfillmentTracking({
                    fulfillmentId: s.id,
                    carrierId,
                    trackingNumber,
                  });
                  if ("error" in res) {
                    toast.error(res.error);
                    return;
                  }
                  toast.success("Tracking saved");
                  afterSave();
                });
              }}
            />
          ) : (
            <div key={s.id} className="flex items-start justify-between gap-2">
              {s.number ? (
                <TrackingLink company={s.company} trackingNumber={s.number} trackingUrl={s.url} />
              ) : (
                <span className="text-sm text-muted-foreground">No tracking number</span>
              )}
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={saving}
                  aria-label="Edit tracking"
                  onClick={() => setMode({ kind: "edit", id: s.id })}
                >
                  <Pencil />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={saving}
                  aria-label="Delete tracking"
                  onClick={() => removeTracking(s.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ),
        )}

        {remaining <= 0 && mode.kind === "add" ? (
          <TrackingForm
            idPrefix="add"
            pending={saving}
            submitLabel="Add tracking"
            onCancel={() => setMode({ kind: "view" })}
            onSubmit={(carrierId, trackingNumber) => {
              startSave(async () => {
                const res = await addShipmentTracking({ orderId, carrierId, trackingNumber });
                if ("error" in res) {
                  toast.error(res.error);
                  return;
                }
                toast.success("Tracking added");
                afterSave();
              });
            }}
          />
        ) : null}

        {mode.kind === "view" ? (
          <div className="flex flex-col gap-2">
            {remaining <= 0 ? (
              <Button
                type="button"
                className="w-full"
                disabled={saving}
                onClick={() => setMode({ kind: "add" })}
              >
                <Plus />
                Add Tracking Code
              </Button>
            ) : null}
            {hasEmail && trackable.some((s) => s.number) ? (
              <Button type="button" variant="outline" className="w-full" disabled={resending} onClick={resend}>
                <Mail />
                Resend tracking to customer
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TrackingForm({
  idPrefix,
  pending,
  submitLabel,
  initialCarrier = "canada-post",
  initialNumber = "",
  onSubmit,
  onCancel,
}: {
  idPrefix: string;
  pending: boolean;
  submitLabel: string;
  initialCarrier?: ShippingCarrierId;
  initialNumber?: string;
  onSubmit: (carrierId: ShippingCarrierId, trackingNumber: string) => void;
  onCancel?: () => void;
}) {
  const [carrierId, setCarrierId] = useState<ShippingCarrierId>(initialCarrier);
  const [number, setNumber] = useState(initialNumber);

  function save() {
    const trackingNumber = number.trim();
    if (!isShippingCarrierId(carrierId)) return toast.error("Pick a carrier");
    if (trackingNumber.length < 4) return toast.error("Enter a tracking number");
    onSubmit(carrierId, trackingNumber);
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-carrier`}>Carrier</Label>
        <Select
          value={carrierId}
          onValueChange={(value) => {
            if (value && isShippingCarrierId(value)) setCarrierId(value);
          }}
        >
          <SelectTrigger id={`${idPrefix}-carrier`} className="w-full">
            <SelectValue>{carrierLabel(carrierId)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SHIPPING_CARRIERS.map((carrier) => (
              <SelectItem key={carrier.id} value={carrier.id}>
                {carrier.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-tracking`}>Tracking #</Label>
        <Input
          id={`${idPrefix}-tracking`}
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder={carrierId === "canada-post" ? "123456789012" : "DRNFLY1234567"}
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={save} disabled={pending} className="flex-1">
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </div>
  );
}
