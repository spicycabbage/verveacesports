"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteAdminUser, deleteNewsletterLead } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  kind: "account" | "lead";
  id: string;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
};

export function DeleteUserButton({ kind, id, label, disabled, disabledReason }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function confirmDelete() {
    start(async () => {
      const res =
        kind === "account"
          ? await deleteAdminUser({ userId: id })
          : await deleteNewsletterLead({ subscriberId: id });
      if ("error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Deleted ${label}`);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={disabled}
        title={disabled ? disabledReason : `Delete ${label}`}
        onClick={() => setOpen(true)}
        aria-label={`Delete ${label}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {label}?</DialogTitle>
            <DialogDescription>
              {kind === "account"
                ? "Permanently removes their login and profile. Paid order history is kept, but unlinked from the account. This cannot be undone."
                : "Removes this newsletter / draw email from the local subscriber list. This cannot be undone."}
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
