"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/constants";
import { updateProductCatalog, uploadProductImage } from "@/lib/actions/catalog";
import { ExternalLink, GripVertical, Trash2, Upload } from "lucide-react";
import Link from "next/link";

type ProductDraft = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: Category;
  images: string[];
  priceUsd: number;
  priceCad: number;
  isActive: boolean;
};

export function ProductEditor({ product }: { product: ProductDraft }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [category, setCategory] = useState<Category>(product.category);
  const [isActive, setIsActive] = useState(product.isActive);
  const [priceUsd, setPriceUsd] = useState(String(product.priceUsd));
  const [priceCad, setPriceCad] = useState(String(product.priceCad));
  const [images, setImages] = useState<string[]>(product.images);
  const [newUrl, setNewUrl] = useState("");

  function save() {
    start(async () => {
      const res = await updateProductCatalog({
        productId: product.id,
        name: name.trim(),
        description,
        category,
        isActive,
        priceUsd: Number(priceUsd),
        priceCad: Number(priceCad),
        images,
      });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Product saved");
        router.refresh();
      }
    });
  }

  async function onUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.set("productId", product.id);
    fd.set("file", file);
    const res = await uploadProductImage(fd);
    setUploading(false);
    if ("error" in res) toast.error(res.error);
    else {
      setImages((prev) => [...prev, res.url]);
      toast.success("Image uploaded");
    }
  }

  function addUrl() {
    const url = newUrl.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast.error("URL must start with http:// or https://");
      return;
    }
    setImages((prev) => [...prev, url]);
    setNewUrl("");
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function moveImage(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardContent className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-y"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <Checkbox
                id="active"
                checked={isActive}
                onCheckedChange={(v) => setIsActive(v === true)}
              />
              <Label htmlFor="active" className="cursor-pointer font-normal">
                Visible on storefront
              </Label>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div>
              <h2 className="text-sm font-semibold">Regional pricing</h2>
              <p className="text-xs text-muted-foreground">
                Set separate storefront prices. Visitors in Canada see CAD; everyone else sees USD.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="usd">US price (USD)</Label>
                <Input
                  id="usd"
                  type="number"
                  min={0}
                  step="0.01"
                  className="tabular-nums"
                  value={priceUsd}
                  onChange={(e) => setPriceUsd(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cad">Canada price (CAD)</Label>
                <Input
                  id="cad"
                  type="number"
                  min={0}
                  step="0.01"
                  className="tabular-nums"
                  value={priceCad}
                  onChange={(e) => setPriceCad(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button onClick={save} disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
            <Button variant="outline" render={<Link href={`/products/${product.slug}`} target="_blank" />}>
              <ExternalLink className="h-4 w-4" />
              View on store
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-3 py-4">
            <h2 className="text-sm font-semibold">Images</h2>
            <p className="text-xs text-muted-foreground">
              First image is the main photo. Upload to Supabase or paste a URL (e.g. Unsplash).
            </p>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onUpload(f);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload image"}
            </Button>

            <div className="flex gap-2">
              <Input
                placeholder="https://…"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
              />
              <Button type="button" variant="outline" onClick={addUrl}>
                Add
              </Button>
            </div>

            <ul className="space-y-2">
              {images.map((src, i) => (
                <li
                  key={src + i}
                  className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2"
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      disabled={i === 0}
                      onClick={() => moveImage(i, -1)}
                      aria-label="Move up"
                    >
                      <GripVertical className="h-4 w-4 rotate-180" />
                    </button>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      disabled={i === images.length - 1}
                      onClick={() => moveImage(i, 1)}
                      aria-label="Move down"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image src={src} alt="" fill sizes="56px" className="object-cover" />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                    {i === 0 && (
                      <span className="mr-1 font-medium text-foreground">Main · </span>
                    )}
                    {src.replace(/^https?:\/\//, "")}
                  </span>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => removeImage(i)}
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
            {images.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-4">No images yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
