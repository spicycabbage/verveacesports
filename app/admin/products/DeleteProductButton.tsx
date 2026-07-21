"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/lib/actions/catalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  productId: string;
  productName: string;
  variant?: "card" | "compact";
};

export function DeleteProductButton({
  productId,
  productName,
  variant = "card",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function confirmDelete() {
    start(async () => {
      const res = await deleteProduct({ productId });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Product deleted");
      setOpen(false);
      if (variant === "card") {
        router.push("/admin/products");
      }
      router.refresh();
    });
  }

  const trigger =
    variant === "compact" ? (
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>
    ) : (
      <Button variant="destructive" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
        Delete product
      </Button>
    );

  return (
    <>
      {variant === "compact" ? (
        trigger
      ) : (
        <Card className="border-destructive/30">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <h2 className="text-sm font-semibold text-destructive">Delete product</h2>
              <p className="text-xs text-muted-foreground">
                Permanently remove this item from the catalog. Products with past orders can only be
                hidden, not deleted.
              </p>
            </div>
            {trigger}
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {productName}?</DialogTitle>
            <DialogDescription>
              This permanently removes the product, its variants, and inventory. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={pending}>
              {pending ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
