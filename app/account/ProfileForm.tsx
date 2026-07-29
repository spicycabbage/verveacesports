"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/profile";
import { COUNTRIES } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { useDictionary } from "@/lib/i18n/I18nProvider";

type Props = {
  email: string;
  firstName: string;
  lastName: string;
  country: "US" | "CA";
  referralCode: string;
};

export function ProfileForm({
  email,
  firstName,
  lastName,
  country,
  referralCode,
}: Props) {
  const dict = useDictionary();
  const [pending, start] = useTransition();
  const [fn, setFn] = useState(firstName);
  const [ln, setLn] = useState(lastName);
  const [c, setC] = useState<"US" | "CA">(country);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updateProfile({
            first_name: fn,
            last_name: ln,
            country: c,
          });
          if (res?.error) toast.error(res.error);
          else toast.success(dict.account.profileUpdated);
        });
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div className="space-y-1.5">
        <Label htmlFor="email">{dict.account.email}</Label>
        <Input id="email" value={email} disabled />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="referral">{dict.account.yourReferralCode}</Label>
        <Input id="referral" value={referralCode} disabled className="font-mono uppercase" />
      </div>
      <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2 sm:gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">{dict.account.firstName}</Label>
          <Input id="first_name" value={fn} onChange={(e) => setFn(e.target.value)} required maxLength={80} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">{dict.account.lastName}</Label>
          <Input id="last_name" value={ln} onChange={(e) => setLn(e.target.value)} required maxLength={80} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="country">{dict.account.country}</Label>
        <Select value={c} onValueChange={(v) => v && setC(v as "US" | "CA")}>
          <SelectTrigger id="country">
            <SelectValue>{COUNTRIES[c].name}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(COUNTRIES) as Array<"US" | "CA">).map((code) => (
              <SelectItem key={code} value={code}>
                {COUNTRIES[code].name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : dict.account.saveChanges}
        </Button>
      </div>
    </form>
  );
}
