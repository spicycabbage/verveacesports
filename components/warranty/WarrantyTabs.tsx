"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { interpolate } from "@/lib/i18n/dictionary";
import type { WarrantyPolicy } from "@/lib/content/warranty";

type ProductOption = { value: string; label: string };

export function WarrantyTabs({
  policy,
  products,
  supportEmail,
  defaultTab = "policy",
}: {
  policy: WarrantyPolicy;
  products: ProductOption[];
  supportEmail: string;
  defaultTab?: "policy" | "register";
}) {
  const dict = useDictionary();
  const w = dict.legal.warranty;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {dict.legal.home}
        </Link>
        {" / "}
        <span>{w.title}</span>
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{w.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {interpolate(dict.legal.lastUpdated, { date: policy.updated })}
      </p>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{policy.intro}</p>

      <Tabs defaultValue={defaultTab} className="mt-10">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="policy">{w.tabPolicy}</TabsTrigger>
          <TabsTrigger value="register">{w.tabRegister}</TabsTrigger>
        </TabsList>

        <TabsContent value="policy" className="mt-8">
          <div className="space-y-8">
            {policy.sections.map((s) => (
              <section key={s.title}>
                <h2 className="text-lg font-semibold">{s.title}</h2>
                <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {s.body.map((p) => (
                    <p key={p.slice(0, 48)}>{p}</p>
                  ))}
                  {s.bullets && s.bullets.length > 0 ? (
                    <ul className="list-disc space-y-1.5 pl-5">
                      {s.bullets.map((b) => (
                        <li key={b.slice(0, 48)}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
          <p className="mt-12 text-sm text-muted-foreground">
            {dict.legal.questionsEmail}{" "}
            <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">
              {supportEmail}
            </a>
            .
          </p>
        </TabsContent>

        <TabsContent value="register" className="mt-8">
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{w.registerIntro}</p>
          <WarrantyRegistrationForm products={products} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WarrantyRegistrationForm({ products }: { products: ProductOption[] }) {
  const dict = useDictionary();
  const w = dict.legal.warranty;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [productSlug, setProductSlug] = useState<string | null>(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!productSlug) {
      toast.error(w.errorProduct);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/warranty/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          orderNumber,
          productSlug,
          serialNumber: serialNumber || undefined,
          purchaseDate: purchaseDate || undefined,
          notes: notes || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? w.errorGeneric);
        return;
      }
      setDone(true);
      toast.success(w.toastSuccess);
    } catch {
      toast.error(w.errorConn);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-border bg-card/40 px-4 py-6 text-sm leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">{w.successTitle}</p>
        <p className="mt-2">{w.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="warranty-name">{w.fullName}</Label>
          <Input
            id="warranty-name"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={120}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="warranty-email">{w.email}</Label>
          <Input
            id="warranty-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={320}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="warranty-order">{w.orderNumber}</Label>
          <Input
            id="warranty-order"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            maxLength={64}
            placeholder={w.orderNumberPlaceholder}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="warranty-product">{w.product}</Label>
          <Select value={productSlug ?? undefined} onValueChange={(v) => setProductSlug(v ?? null)}>
            <SelectTrigger id="warranty-product" className="w-full">
              <SelectValue placeholder={w.productPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="warranty-serial">
            {w.serialNumber}{" "}
            <span className="font-normal text-muted-foreground">({w.optional})</span>
          </Label>
          <Input
            id="warranty-serial"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            maxLength={120}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="warranty-date">
            {w.purchaseDate}{" "}
            <span className="font-normal text-muted-foreground">({w.optional})</span>
          </Label>
          <Input
            id="warranty-date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="warranty-notes">
          {w.notes} <span className="font-normal text-muted-foreground">({w.optional})</span>
        </Label>
        <Textarea
          id="warranty-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
          placeholder={w.notesPlaceholder}
        />
      </div>

      <Button type="submit" disabled={submitting} className="min-w-40">
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {w.submitting}
          </>
        ) : (
          w.submit
        )}
      </Button>
    </form>
  );
}
