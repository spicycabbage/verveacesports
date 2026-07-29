"use client";

import Link from "next/link";
import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function PaymentForm({
  disabled,
  createPaymentIntent,
  onSuccess,
}: {
  disabled?: boolean;
  createPaymentIntent: () => Promise<{ clientSecret: string; orderId: string }>;
  onSuccess: (orderId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const dict = useDictionary();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || disabled) return;

    setSubmitting(true);
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        toast.error(submitError.message ?? "Check your payment details");
        return;
      }

      const { clientSecret, orderId } = await createPaymentIntent();

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?order=${orderId}`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message ?? "Payment failed");
        return;
      }
      if (paymentIntent?.status === "succeeded") {
        // Navigate immediately — mark-paid runs in parallel so the UI isn't blocked
        // on Stripe fee sync / extra round-trips.
        void fetch("/api/stripe/confirm-order", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ orderId }),
          keepalive: true,
        }).catch(() => null);
        onSuccess(orderId);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
          wallets: { applePay: "auto", googlePay: "auto" },
        }}
      />
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || submitting || disabled}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : dict.checkout.payForOrder}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        By completing payment you agree to our{" "}
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        . Secured by Stripe.
      </p>
    </form>
  );
}
