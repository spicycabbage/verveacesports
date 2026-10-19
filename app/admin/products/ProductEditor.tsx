"use client";

import { forwardRef, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
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
import { sizedImageUrl } from "@/lib/images/cdn";
import { uploadProductImage } from "@/lib/actions/upload-image";
import { LOCALE_LIST, type Locale } from "@/lib/i18n/locale";
import { getCatalogCopy } from "@/lib/i18n/catalog-copy";
import {
  compactProductTranslations,
  parseProductTranslations,
  type ProductTranslations,
} from "@/lib/i18n/product-translations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GripVertical, Trash2, Upload } from "lucide-react";

type TranslationLocale = Exclude<Locale, "en">;

const TRANSLATION_LOCALES = LOCALE_LIST.filter(
  (l): l is (typeof LOCALE_LIST)[number] & { code: TranslationLocale } => l.code !== "en",
);

function seedTranslations(slug: string, raw: unknown): ProductTranslations {
  const parsed = parseProductTranslations(raw);
  for (const loc of TRANSLATION_LOCALES) {
    if (parsed[loc.code]?.name || parsed[loc.code]?.description) continue;
    const copy = getCatalogCopy(slug, loc.code);
    if (copy) parsed[loc.code] = { name: copy.name, description: copy.description };
  }
  return parsed;
}

type ProductDraft = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: Category;
  images: string[];
  isActive: boolean;
  translations?: unknown;
};

export type ProductEditorDraft = {
  name: string;
  description: string;
  category: Category;
  isActive: boolean;
  images: string[];
  translations: ProductTranslations;
};

export type ProductEditorHandle = {
  getDraft: () => ProductEditorDraft;
};

export const ProductEditor = forwardRef<
  ProductEditorHandle,
  { product: ProductDraft; children?: ReactNode }
>(function ProductEditor({ product, children }, ref) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [translations, setTranslations] = useState<ProductTranslations>(() =>
    seedTranslations(product.slug, product.translations),
  );
  const [category, setCategory] = useState<Category>(product.category);
  const [isActive, setIsActive] = useState(product.isActive);
  const [images, setImages] = useState<string[]>(product.images);

  useImperativeHandle(
    ref,
    () => ({
      getDraft() {
        return {
          name: name.trim(),
          description,
          category,
          isActive,
          images,
          translations: compactProductTranslations(translations),
        };
      },
    }),
    [name, description, category, isActive, images, translations],
  );

  function patchTranslation(
    locale: TranslationLocale,
    patch: { name?: string; description?: string },
  ) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], ...patch },
    }));
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
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardContent className="space-y-4 py-4">
          <Tabs defaultValue="en">
            <TabsList variant="line" className="flex h-auto w-full flex-wrap justify-start gap-1">
              {LOCALE_LIST.map((loc) => (
                <TabsTrigger key={loc.code} value={loc.code} className="flex-none px-2">
                  {loc.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="en" className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-y"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                English is the storefront fallback. Other tabs override name/description per language.
              </p>
            </TabsContent>
            {TRANSLATION_LOCALES.map((loc) => (
              <TabsContent key={loc.code} value={loc.code} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor={`name-${loc.code}`}>Name ({loc.label})</Label>
                  <Input
                    id={`name-${loc.code}`}
                    value={translations[loc.code]?.name ?? ""}
                    onChange={(e) => patchTranslation(loc.code, { name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`description-${loc.code}`}>Description ({loc.label})</Label>
                  <Textarea
                    id={`description-${loc.code}`}
                    rows={6}
                    value={translations[loc.code]?.description ?? ""}
                    onChange={(e) =>
                      patchTranslation(loc.code, { description: e.target.value })
                    }
                    className="resize-y"
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>

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

          {children}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-3 py-4">
            <h2 className="text-sm font-semibold">Images</h2>
            <p className="text-xs text-muted-foreground">
              First image is the main photo. (JPEG, PNG, WebP, or GIF, max 5&nbsp;MB)
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

            <ul className="space-y-2">
              {images.map((src, i) => (
                <li
                  key={src + i}
                  className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-2 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
                        disabled={i === 0}
                        onClick={() => moveImage(i, -1)}
                        aria-label="Move up"
                      >
                        <GripVertical className="h-4 w-4 rotate-180" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
                        disabled={i === images.length - 1}
                        onClick={() => moveImage(i, 1)}
                        aria-label="Move down"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="relative h-32 w-full overflow-hidden rounded-md bg-muted sm:h-44 sm:w-44 sm:shrink-0">
                      <Image
                        src={sizedImageUrl(src, 352)}
                        alt=""
                        fill
                        sizes="176px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <span className="min-w-0 flex-1 break-all text-xs text-muted-foreground sm:truncate">
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
},
);
