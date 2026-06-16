"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateProductOptions, updateVariantDetails } from "@/lib/actions/catalog";
import { createVariant } from "@/lib/actions/inventory";
import type { ProductOption } from "@/lib/supabase/types";
import { Plus } from "lucide-react";
import Link from "next/link";

export type AdminVariantRow = {
  id: string;
  sku: string | null;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  priceUsd: number;
  priceCad: number;
  isActive: boolean;
  available: number;
};

type Props = {
  productId: string;
  productOptions: ProductOption[];
  variants: AdminVariantRow[];
  defaultPriceUsd: number;
  defaultPriceCad: number;
};

export function VariantManager({
  productId,
  productOptions,
  variants,
  defaultPriceUsd,
  defaultPriceCad,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [opt1Name, setOpt1Name] = useState(productOptions[0]?.name ?? "");
  const [opt2Name, setOpt2Name] = useState(productOptions[1]?.name ?? "");
  const [opt3Name, setOpt3Name] = useState(productOptions[2]?.name ?? "");

  const [newSku, setNewSku] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newOpt1, setNewOpt1] = useState("");
  const [newOpt2, setNewOpt2] = useState("");
  const [newOpt3, setNewOpt3] = useState("");
  const [newUsd, setNewUsd] = useState(String(defaultPriceUsd));
  const [newCad, setNewCad] = useState(String(defaultPriceCad));
  const [newStock, setNewStock] = useState("0");

  function saveOptionNames() {
    start(async () => {
      const res = await updateProductOptions({
        productId,
        option1Name: opt1Name || undefined,
        option2Name: opt2Name || undefined,
        option3Name: opt3Name || undefined,
      });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Option labels saved");
        router.refresh();
      }
    });
  }

  function saveVariant(v: AdminVariantRow, patch: Partial<AdminVariantRow>) {
    start(async () => {
      const res = await updateVariantDetails({
        variantId: v.id,
        productId,
        sku: patch.sku ?? v.sku ?? undefined,
        title: patch.title ?? v.title,
        option1: patch.option1 ?? v.option1 ?? undefined,
        option2: patch.option2 ?? v.option2 ?? undefined,
        option3: patch.option3 ?? v.option3 ?? undefined,
        priceUsd: patch.priceUsd ?? v.priceUsd,
        priceCad: patch.priceCad ?? v.priceCad,
        isActive: patch.isActive ?? v.isActive,
      });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Variant updated");
        router.refresh();
      }
    });
  }

  function addVariant() {
    if (!newTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    start(async () => {
      const res = await createVariant({
        productId,
        sku: newSku || undefined,
        title: newTitle.trim(),
        option1: newOpt1 || undefined,
        option2: newOpt2 || undefined,
        option3: newOpt3 || undefined,
        priceUsd: Number(newUsd),
        priceCad: Number(newCad),
        initialStock: Number(newStock) || 0,
      });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Variant created");
        setNewSku("");
        setNewTitle("");
        setNewOpt1("");
        setNewOpt2("");
        setNewOpt3("");
        setNewStock("0");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 py-4">
          <div>
            <h2 className="text-sm font-semibold">Variant options</h2>
            <p className="text-xs text-muted-foreground">
              Labels shown on the product page picker (e.g. Size, Color). Values come from each
              variant row below.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="opt1">Option 1 label</Label>
              <Input
                id="opt1"
                placeholder="Size"
                value={opt1Name}
                onChange={(e) => setOpt1Name(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="opt2">Option 2 label</Label>
              <Input
                id="opt2"
                placeholder="Color"
                value={opt2Name}
                onChange={(e) => setOpt2Name(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="opt3">Option 3 label</Label>
              <Input
                id="opt3"
                placeholder="Style"
                value={opt3Name}
                onChange={(e) => setOpt3Name(e.target.value)}
              />
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={saveOptionNames} disabled={pending}>
            Save option labels
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 py-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Variants ({variants.length})</h2>
            <Link
              href="/admin/products"
              className="text-xs text-primary underline-offset-2 hover:underline"
            >
              Adjust stock in Inventory →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>{opt1Name || "Opt 1"}</TableHead>
                  <TableHead>{opt2Name || "Opt 2"}</TableHead>
                  <TableHead>USD</TableHead>
                  <TableHead>CAD</TableHead>
                  <TableHead>Avail</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((v) => (
                  <VariantRow
                    key={v.id}
                    variant={v}
                    opt1Label={opt1Name}
                    opt2Label={opt2Name}
                    onSave={saveVariant}
                    disabled={pending}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 py-4">
          <h2 className="text-sm font-semibold">Add variant</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Title" value={newTitle} onChange={setNewTitle} placeholder="Default" />
            <Field label="SKU" value={newSku} onChange={setNewSku} placeholder="APEXRUNNERM" />
            <Field
              label={opt1Name || "Option 1"}
              value={newOpt1}
              onChange={setNewOpt1}
              placeholder="M"
            />
            <Field
              label={opt2Name || "Option 2"}
              value={newOpt2}
              onChange={setNewOpt2}
              placeholder="Black"
            />
            <Field label="USD" value={newUsd} onChange={setNewUsd} type="number" />
            <Field label="CAD" value={newCad} onChange={setNewCad} type="number" />
            <Field label="Initial stock" value={newStock} onChange={setNewStock} type="number" />
          </div>
          <Button onClick={addVariant} disabled={pending}>
            <Plus className="h-4 w-4" />
            Add variant
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={type === "number" ? "tabular-nums" : undefined}
      />
    </div>
  );
}

function VariantRow({
  variant: v,
  opt1Label,
  opt2Label,
  onSave,
  disabled,
}: {
  variant: AdminVariantRow;
  opt1Label: string;
  opt2Label: string;
  onSave: (v: AdminVariantRow, patch: Partial<AdminVariantRow>) => void;
  disabled: boolean;
}) {
  const [title, setTitle] = useState(v.title);
  const [sku, setSku] = useState(v.sku ?? "");
  const [opt1, setOpt1] = useState(v.option1 ?? "");
  const [opt2, setOpt2] = useState(v.option2 ?? "");
  const [usd, setUsd] = useState(String(v.priceUsd));
  const [cad, setCad] = useState(String(v.priceCad));
  const [active, setActive] = useState(v.isActive);

  const dirty =
    title !== v.title ||
    sku !== (v.sku ?? "") ||
    opt1 !== (v.option1 ?? "") ||
    opt2 !== (v.option2 ?? "") ||
    usd !== String(v.priceUsd) ||
    cad !== String(v.priceCad) ||
    active !== v.isActive;

  return (
    <TableRow>
      <TableCell>
        <Input className="h-8 min-w-[100px]" value={title} onChange={(e) => setTitle(e.target.value)} />
      </TableCell>
      <TableCell>
        <Input className="h-8 min-w-[90px] font-mono text-xs" value={sku} onChange={(e) => setSku(e.target.value)} />
      </TableCell>
      <TableCell>
        <Input className="h-8 w-20" value={opt1} onChange={(e) => setOpt1(e.target.value)} placeholder={opt1Label} />
      </TableCell>
      <TableCell>
        <Input className="h-8 w-20" value={opt2} onChange={(e) => setOpt2(e.target.value)} placeholder={opt2Label} />
      </TableCell>
      <TableCell>
        <Input className="h-8 w-20 tabular-nums" type="number" step="0.01" value={usd} onChange={(e) => setUsd(e.target.value)} />
      </TableCell>
      <TableCell>
        <Input className="h-8 w-20 tabular-nums" type="number" step="0.01" value={cad} onChange={(e) => setCad(e.target.value)} />
      </TableCell>
      <TableCell>
        <Badge variant={v.available <= 0 ? "destructive" : "outline"}>{v.available}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Checkbox checked={active} onCheckedChange={(c) => setActive(c === true)} />
          {dirty && (
            <Button
              size="xs"
              variant="secondary"
              disabled={disabled}
              onClick={() =>
                onSave(v, {
                  title,
                  sku,
                  option1: opt1,
                  option2: opt2,
                  priceUsd: Number(usd),
                  priceCad: Number(cad),
                  isActive: active,
                })
              }
            >
              Save
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
