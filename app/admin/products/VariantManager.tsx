"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useTransition,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateProductOptions, updateVariantDetails } from "@/lib/actions/catalog";
import { createVariant, setInventoryOnHand } from "@/lib/actions/inventory";
import type { ProductOption } from "@/lib/supabase/types";
import { Plus } from "lucide-react";

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
  onHand: number;
  reserved: number;
  available: number;
};

type Props = {
  productId: string;
  locationId: string;
  productOptions: ProductOption[];
  variants: AdminVariantRow[];
  defaultPriceUsd: number;
  defaultPriceCad: number;
};

export type VariantManagerHandle = {
  saveAll: () => Promise<{ ok: true } | { error: string } | null>;
};

export const VariantManager = forwardRef<VariantManagerHandle, Props>(function VariantManager(
  { productId, locationId, productOptions, variants, defaultPriceUsd, defaultPriceCad },
  ref,
) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [opt1Name, setOpt1Name] = useState(productOptions[0]?.name ?? "");
  const [opt2Name, setOpt2Name] = useState(productOptions[1]?.name ?? "");
  const [opt3Name, setOpt3Name] = useState(productOptions[2]?.name ?? "");
  const rowRefs = useRef<Map<string, VariantRowHandle>>(new Map());

  const [newSku, setNewSku] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newOpt1, setNewOpt1] = useState("");
  const [newOpt2, setNewOpt2] = useState("");
  const [newOpt3, setNewOpt3] = useState("");
  const [newUsd, setNewUsd] = useState(String(defaultPriceUsd));
  const [newCad, setNewCad] = useState(String(defaultPriceCad));
  const [newStock, setNewStock] = useState("0");

  const optionLabelsDirty =
    opt1Name !== (productOptions[0]?.name ?? "") ||
    opt2Name !== (productOptions[1]?.name ?? "") ||
    opt3Name !== (productOptions[2]?.name ?? "");

  useImperativeHandle(
    ref,
    () => ({
      async saveAll() {
        if (optionLabelsDirty) {
          const res = await updateProductOptions({
            productId,
            option1Name: opt1Name || undefined,
            option2Name: opt2Name || undefined,
            option3Name: opt3Name || undefined,
          });
          if ("error" in res) return res;
        }

        let anyVariantChange = false;
        for (const v of variants) {
          const handle = rowRefs.current.get(v.id);
          if (!handle) continue;
          const res = await handle.saveIfDirty();
          if (res === null) continue;
          anyVariantChange = true;
          if ("error" in res) return res;
        }

        if (!optionLabelsDirty && !anyVariantChange) {
          return null;
        }
        return { ok: true };
      },
    }),
    [optionLabelsDirty, opt1Name, opt2Name, opt3Name, productId, variants],
  );

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
              Labels shown on the product page picker (e.g. Size, Color). Saved with{" "}
              <strong>Save product</strong> below.
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
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 py-4">
          <h2 className="text-sm font-semibold">Variants & inventory ({variants.length})</h2>
          <p className="text-xs text-muted-foreground">
            Edit rows below, then use <strong>Save product</strong> at the bottom.
          </p>
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
                  <TableHead>Stock</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((v) => (
                  <VariantRow
                    key={v.id}
                    productId={productId}
                    locationId={locationId}
                    variant={v}
                    opt1Label={opt1Name}
                    opt2Label={opt2Name}
                    rowRefs={rowRefs}
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
          <p className="text-xs text-muted-foreground">
            New variants are created immediately — they do not wait for Save product.
          </p>
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
});

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

export type VariantRowHandle = {
  saveIfDirty: () => Promise<{ ok: true } | { error: string } | null>;
};

function VariantRow({
  productId,
  locationId,
  variant: v,
  opt1Label,
  opt2Label,
  rowRefs,
}: {
  productId: string;
  locationId: string;
  variant: AdminVariantRow;
  opt1Label: string;
  opt2Label: string;
  rowRefs: RefObject<Map<string, VariantRowHandle>>;
}) {
  const [title, setTitle] = useState(v.title);
  const [sku, setSku] = useState(v.sku ?? "");
  const [opt1, setOpt1] = useState(v.option1 ?? "");
  const [opt2, setOpt2] = useState(v.option2 ?? "");
  const [usd, setUsd] = useState(String(v.priceUsd));
  const [cad, setCad] = useState(String(v.priceCad));
  const [active, setActive] = useState(v.isActive);
  const [qty, setQty] = useState("");

  const variantDirty =
    title !== v.title ||
    sku !== (v.sku ?? "") ||
    opt1 !== (v.option1 ?? "") ||
    opt2 !== (v.option2 ?? "") ||
    usd !== String(v.priceUsd) ||
    cad !== String(v.priceCad) ||
    active !== v.isActive;

  const handleRef = useRef<VariantRowHandle>({ saveIfDirty: async () => null });

  handleRef.current.saveIfDirty = async () => {
    const stockTarget = qty.trim() === "" ? null : Number.parseInt(qty, 10);
    const stockDirty =
      stockTarget !== null &&
      !Number.isNaN(stockTarget) &&
      stockTarget >= 0 &&
      stockTarget !== v.onHand;

    if (!variantDirty && !stockDirty) {
      return null;
    }

    if (stockTarget !== null && (Number.isNaN(stockTarget) || stockTarget < 0)) {
      return { error: "Enter a valid stock quantity (0 or higher)" };
    }

    const usdNum = Number(usd);
    const cadNum = Number(cad);
    if (Number.isNaN(usdNum) || usdNum < 0 || Number.isNaN(cadNum) || cadNum < 0) {
      return { error: "Enter valid variant prices (0 or higher)" };
    }

    if (variantDirty) {
      const res = await updateVariantDetails({
        variantId: v.id,
        productId,
        sku: sku || undefined,
        title,
        option1: opt1 || undefined,
        option2: opt2 || undefined,
        priceUsd: usdNum,
        priceCad: cadNum,
        isActive: active,
      });
      if ("error" in res) return res;
    }

    if (stockDirty && stockTarget !== null) {
      const res = await setInventoryOnHand({
        variantId: v.id,
        locationId,
        onHand: stockTarget,
      });
      if ("error" in res) return res;
    }

    return { ok: true };
  };

  rowRefs.current.set(v.id, handleRef.current);

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
        <div className="flex items-center gap-1.5">
          <span className="w-8 tabular-nums text-sm">{v.onHand}</span>
          <Input
            type="number"
            min={0}
            step={1}
            placeholder={String(v.onHand)}
            className="h-8 w-16 tabular-nums"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>
      </TableCell>
      <TableCell>
        <Checkbox checked={active} onCheckedChange={(c) => setActive(c === true)} />
      </TableCell>
    </TableRow>
  );
}
