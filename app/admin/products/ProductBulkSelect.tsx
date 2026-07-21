"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteProducts } from "@/lib/actions/catalog";

type ProductRef = { id: string; name: string };

type SelectionContextValue = {
  selected: Set<string>;
  toggle: (productId: string) => void;
  isSelected: (productId: string) => boolean;
  selectAll: () => void;
  clear: () => void;
  allSelected: boolean;
  someSelected: boolean;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

function useProductSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("ProductSelectionProvider required");
  return ctx;
}

export function ProductSelectionProvider({
  products,
  children,
}: {
  products: ProductRef[];
  children: ReactNode;
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const productIds = useMemo(() => products.map((p) => p.id), [products]);

  const toggle = useCallback((productId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const isSelected = useCallback((productId: string) => selected.has(productId), [selected]);

  const selectAll = useCallback(() => {
    setSelected((prev) => {
      if (prev.size === productIds.length) return new Set();
      return new Set(productIds);
    });
  }, [productIds]);

  const clear = useCallback(() => setSelected(new Set()), []);

  const allSelected = productIds.length > 0 && selected.size === productIds.length;
  const someSelected = selected.size > 0;

  const value = useMemo(
    () => ({
      selected,
      toggle,
      isSelected,
      selectAll,
      clear,
      allSelected,
      someSelected,
    }),
    [selected, toggle, isSelected, selectAll, clear, allSelected, someSelected],
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function ProductSelectCheckbox({ productId }: { productId: string }) {
  const { isSelected, toggle } = useProductSelection();
  const checked = isSelected(productId);

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={() => toggle(productId)}
      aria-label="Select product"
      className="mt-1"
    />
  );
}

export function ProductBulkDeleteBar({ products }: { products: ProductRef[] }) {
  const router = useRouter();
  const { selected, selectAll, clear, allSelected, someSelected } = useProductSelection();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const selectedProducts = products.filter((p) => selected.has(p.id));

  function confirmBulkDelete() {
    const ids = selectedProducts.map((p) => p.id);
    start(async () => {
      const res = await deleteProducts({ productIds: ids });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }

      setOpen(false);
      clear();

      if (res.failed.length === 0) {
        toast.success(
          `Deleted ${res.deletedCount} product${res.deletedCount === 1 ? "" : "s"}`,
        );
      } else if (res.deletedCount > 0) {
        toast.warning(
          `Deleted ${res.deletedCount}. ${res.failed.length} could not be deleted (order history or linked records).`,
        );
      } else {
        toast.error(res.failed[0]?.error ?? "Could not delete selected products");
      }

      router.refresh();
    });
  }

  if (products.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onCheckedChange={selectAll}
            aria-label="Select all products on this page"
          />
          Select all on page
        </label>
        {someSelected && (
          <>
            <span className="text-sm text-muted-foreground">
              {selected.size} selected
            </span>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => setOpen(true)}
              disabled={pending}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete selected
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={clear} disabled={pending}>
              Clear
            </Button>
          </>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Delete {selectedProducts.length} product
              {selectedProducts.length === 1 ? "" : "s"}?
            </DialogTitle>
            <DialogDescription>
              This permanently removes the selected products, variants, and inventory. Products
              with order history will be skipped.
            </DialogDescription>
          </DialogHeader>
          <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
            {selectedProducts.map((p) => (
              <li key={p.id} className="truncate text-muted-foreground">
                {p.name}
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmBulkDelete} disabled={pending}>
              {pending ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
