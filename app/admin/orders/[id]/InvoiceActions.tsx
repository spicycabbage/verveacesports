"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Pencil, Printer } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveInvoiceContact } from "@/lib/actions/invoice";

export function InvoiceActions({
  orderId,
  email: initialEmail,
  customerName: initialName,
  printHref,
}: {
  orderId: string;
  email: string;
  customerName: string;
  printHref?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [email, setEmail] = useState(initialEmail);
  const [customerName, setCustomerName] = useState(initialName);

  function run(send: boolean) {
    start(async () => {
      const result = await saveInvoiceContact({
        orderId,
        email,
        customerName,
        send,
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(result.sent ? `Invoice emailed to ${email.trim()}` : "Saved");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
        Edit
      </Button>
      {printHref ? (
        <Link href={printHref} className={buttonVariants({ size: "sm" })}>
          <Printer className="h-4 w-4" />
          Print Invoice
        </Link>
      ) : (
        <Button type="button" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print Invoice
        </Button>
      )}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setEmail(initialEmail);
            setCustomerName(initialName);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit invoice</DialogTitle>
            <DialogDescription>
              Update the customer on this invoice, then email it if you want.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="invoice-name">Customer name</Label>
              <Input
                id="invoice-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                autoComplete="off"
                disabled={pending}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="invoice-email">Customer email</Label>
              <Input
                id="invoice-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                disabled={pending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => run(false)} disabled={pending}>
              Save
            </Button>
            <Button type="button" onClick={() => run(true)} disabled={pending}>
              <Mail className="h-4 w-4" />
              Email invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
