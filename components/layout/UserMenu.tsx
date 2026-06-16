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

type Props = {
  user: { email: string; fullName: string | null } | null;
  loyaltyPoints: number;
  isAdmin?: boolean;
};

export function UserMenu({ user, loyaltyPoints, isAdmin = false }: Props) {
  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <Link href="/login" className={buttonVariants({ size: "sm", variant: "ghost" })}>
          Sign in
        </Link>
        <Link
          href="/signup"
          className={buttonVariants({ size: "sm", className: "hidden sm:inline-flex" })}
        >
          Sign up
        </Link>
      </div>
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
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground sm:flex">
        <Sparkles className="h-3.5 w-3.5" />
        {formatPoints(loyaltyPoints)} pts
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={buttonVariants({
            variant: "ghost",
            size: "icon",
            className: "rounded-full",
          })}
          aria-label="Account menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex flex-col font-normal">
              <span className="text-sm font-medium text-foreground">
                {user.fullName ?? "Account"}
              </span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuLinkItem href="/account">
              <UserIcon className="h-4 w-4" /> Profile
            </DropdownMenuLinkItem>
            <DropdownMenuLinkItem href="/account/orders">Orders</DropdownMenuLinkItem>
            <DropdownMenuLinkItem href="/account/loyalty">Loyalty Points</DropdownMenuLinkItem>
            <DropdownMenuLinkItem href="/account/referrals">Referrals</DropdownMenuLinkItem>
            {isAdmin && (
              <DropdownMenuLinkItem href="/admin">
                <LayoutDashboard className="h-4 w-4" /> Admin
              </DropdownMenuLinkItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLinkItem href={SIGN_OUT_PATH}>
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuLinkItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
