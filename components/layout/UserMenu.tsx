"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutDashboard, LogOut, Sparkles, User as UserIcon } from "lucide-react";
import { SIGN_OUT_PATH } from "@/lib/constants";
import { formatPoints } from "@/lib/utils/format";
import { useDictionary, useT } from "@/lib/i18n/I18nProvider";

type Props = {
  user: { email: string; fullName: string | null } | null;
  loyaltyPoints: number;
  isAdmin?: boolean;
};

export function UserMenu({ user, loyaltyPoints, isAdmin = false }: Props) {
  const dict = useDictionary();
  const t = useT();

  if (!user) {
    return (
      <Link
        href="/login"
        className={buttonVariants({
          size: "default",
          variant: "ghost",
          className: "min-w-11 justify-center text-base",
        })}
      >
        {dict.nav.signIn}
      </Link>
    );
  }

  const initials =
    (user.fullName ?? user.email)
      .split(/[\s@]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "U";

  return (
    <div className="flex min-w-11 items-center justify-end gap-2">
      <div className="hidden items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground sm:flex">
        <Sparkles className="h-3.5 w-3.5" />
        {t("nav.pts", { n: formatPoints(loyaltyPoints) })}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={buttonVariants({
            variant: "ghost",
            size: "icon",
            className: "rounded-full",
          })}
          aria-label={dict.nav.accountMenu}
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex flex-col font-normal">
              <span className="text-sm font-medium text-foreground">
                {user.fullName ?? dict.nav.account}
              </span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuLinkItem href="/account">
              <UserIcon className="h-4 w-4" /> {dict.nav.profile}
            </DropdownMenuLinkItem>
            <DropdownMenuLinkItem href="/account/orders">{dict.nav.orders}</DropdownMenuLinkItem>
            <DropdownMenuLinkItem href="/account/loyalty">
              {dict.nav.loyaltyPoints}
            </DropdownMenuLinkItem>
            <DropdownMenuLinkItem href="/account/referrals">
              {dict.nav.referrals}
            </DropdownMenuLinkItem>
            {isAdmin && (
              <DropdownMenuLinkItem href="/admin">
                <LayoutDashboard className="h-4 w-4" /> {dict.nav.admin}
              </DropdownMenuLinkItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLinkItem href={SIGN_OUT_PATH}>
              <LogOut className="h-4 w-4" />
              {dict.nav.signOut}
            </DropdownMenuLinkItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
