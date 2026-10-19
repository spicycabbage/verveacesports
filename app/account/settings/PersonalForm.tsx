"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions/profile";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { isValidOrderPhone } from "@/lib/utils/phone";

export function PersonalForm(props: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}) {
  const dict = useDictionary();
  const [pending, start] = useTransition();
  const [firstName, setFirstName] = useState(props.firstName);
  const [lastName, setLastName] = useState(props.lastName);
  const [phone, setPhone] = useState(props.phone);
  const phoneInvalid = phone.trim() !== "" && !isValidOrderPhone(phone);

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updateProfile({ first_name: firstName, last_name: lastName, phone });
          if (res.error) toast.error(res.error);
          else toast.success(dict.account.profileUpdated);
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="settings-first">{dict.account.firstName}</Label>
        <Input
          id="settings-first"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          maxLength={80}
          autoComplete="given-name"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="settings-last">{dict.account.lastName}</Label>
        <Input
          id="settings-last"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          maxLength={80}
          autoComplete="family-name"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="settings-email">{dict.account.email}</Label>
        <Input id="settings-email" value={props.email} disabled />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="settings-phone">{dict.account.phone}</Label>
        <Input
          id="settings-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={32}
          aria-invalid={phoneInvalid || undefined}
        />
        {phoneInvalid && <p className="text-xs text-destructive">{dict.checkout.phoneInvalid}</p>}
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending || phoneInvalid}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : dict.account.saveChanges}
        </Button>
      </div>
    </form>
  );
}
