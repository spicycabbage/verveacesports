"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { updateAddress } from "@/lib/actions/profile";
import { COUNTRIES, regionsForCountry, type CountryCode } from "@/lib/constants";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export type SavedAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
};

export function AddressForm(props: { address: SavedAddress; country: CountryCode }) {
  const dict = useDictionary();
  const [pending, start] = useTransition();
  const [address, setAddress] = useState(props.address);
  const [country, setCountry] = useState<CountryCode>(props.country);
  const set = (field: keyof SavedAddress) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress((a) => ({ ...a, [field]: e.target.value }));

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updateAddress({ ...address, country });
          if (res.error) toast.error(res.error);
          else toast.success(dict.account.addressSaved);
        });
      }}
    >
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="settings-line1">{dict.account.addressLine1}</Label>
        <Input
          id="settings-line1"
          value={address.line1}
          onChange={set("line1")}
          required
          maxLength={200}
          autoComplete="address-line1"
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="settings-line2">{dict.account.addressLine2}</Label>
        <Input
          id="settings-line2"
          value={address.line2}
          onChange={set("line2")}
          maxLength={200}
          autoComplete="address-line2"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="settings-city">{dict.account.city}</Label>
        <Input
          id="settings-city"
          value={address.city}
          onChange={set("city")}
          required
          maxLength={100}
          autoComplete="address-level2"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="settings-state">{dict.account.stateProvince}</Label>
        <Select
          value={address.state || undefined}
          onValueChange={(v) => v && setAddress((a) => ({ ...a, state: v }))}
        >
          <SelectTrigger id="settings-state" className="w-full">
            <SelectValue placeholder={dict.account.stateProvince}>
              {regionsForCountry(country).find((r) => r.code === address.state)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {regionsForCountry(country).map((r) => (
              <SelectItem key={r.code} value={r.code}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="settings-postal">{dict.account.postalCode}</Label>
        <Input
          id="settings-postal"
          value={address.postal_code}
          onChange={set("postal_code")}
          required
          maxLength={16}
          autoComplete="postal-code"
          className="uppercase"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="settings-country">{dict.account.country}</Label>
        <Select
          value={country}
          onValueChange={(v) => {
            if (!v) return;
            setCountry(v as CountryCode);
            setAddress((a) => ({ ...a, state: "" }));
          }}
        >
          <SelectTrigger id="settings-country" className="w-full">
            <SelectValue>{COUNTRIES[country].name}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(COUNTRIES) as CountryCode[]).map((code) => (
              <SelectItem key={code} value={code}>
                {COUNTRIES[code].name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending || !address.state}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : dict.account.saveChanges}
        </Button>
      </div>
    </form>
  );
}
