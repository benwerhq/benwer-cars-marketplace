"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CalendarCheck, LogOut, PencilRuler, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { useGuestAuth } from "@/context/GuestAuthProvider";
import { useStaffAuth } from "@/context/StaffAuthProvider";
import { guestLinksFromHomeHref, publicHomeFromHome } from "@/lib/site";
import { currentReturnTo, withReturnTo } from "@/lib/returnTo";
import { OPEN_OWNER_EDITOR_EVENT, OWNER_EDITOR_HASH } from "@/lib/siteEdit";
import { cn } from "@/lib/utils";
import { HEADER_ICON_BUTTON, MENU_CONTENT, MENU_ITEM } from "./LocaleSwitcher";

export function SiteGuestLink({ homeHref }: { homeHref: string }) {
  const t = useTranslations("guest");
  const router = useRouter();
  const { user, ready, signOut } = useGuestAuth();
  const staff = useStaffAuth();
  const links = guestLinksFromHomeHref(homeHref);

  if (staff.ready && staff.user) {
    return null;
  }

  if (!ready || !user) {
    return (
      <Link
        href={links.signIn}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
            return;
          }
          event.preventDefault();
          router.push(withReturnTo(links.signIn, currentReturnTo()));
        }}
        className={cn(
          "inline-flex cursor-pointer items-center rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-foreground transition-colors",
          "hover:bg-surface-hover",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        {t("signInNav")}
      </Link>
    );
  }

  return (
    <DropdownMenu.Root modal={false}>
      <IconTooltip label={t("accountMenu")}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={t("accountMenu")}
            className={cn(HEADER_ICON_BUTTON, "text-foreground")}
          >
            <UserRound size={16} aria-hidden />
          </button>
        </DropdownMenu.Trigger>
      </IconTooltip>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} className={MENU_CONTENT}>
          {user.email ? (
            <DropdownMenu.Label className="truncate px-2.5 py-2 text-xs text-muted-foreground">
              {user.email}
            </DropdownMenu.Label>
          ) : null}
          <DropdownMenu.Item asChild className={MENU_ITEM}>
            <Link href={links.bookings}>
              <CalendarCheck size={15} aria-hidden />
              {t("myBookings")}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={MENU_ITEM}>
            <Link href={links.profile}>
              <UserRound size={15} aria-hidden />
              {t("profileNav")}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            className={MENU_ITEM}
            onSelect={() => {
              void signOut().then(() => router.push(homeHref));
            }}
          >
            <LogOut size={15} aria-hidden />
            {t("signOut")}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function initials(email: string | null): string {
  const name = (email ?? "").split("@")[0] ?? "";
  const parts = name.split(/[^a-zA-Z]+/).filter(Boolean);
  const letters =
    parts.length > 1 ? `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}` : (parts[0] ?? "").slice(0, 2);
  return letters.toUpperCase() || "?";
}

function openEditor(router: ReturnType<typeof useRouter>, homeHref: string) {
  const handled = !window.dispatchEvent(
    new Event(OPEN_OWNER_EDITOR_EVENT, { cancelable: true }),
  );
  if (!handled) {
    router.push(`${homeHref}#${OWNER_EDITOR_HASH}`);
  }
}

export function SiteOwnerMenu({ homeHref }: { homeHref: string }) {
  const t = useTranslations("owner");
  const router = useRouter();
  const staff = useStaffAuth();

  if (!staff.ready || !staff.user) {
    return null;
  }

  const email = staff.user.email;

  return (
    <DropdownMenu.Root modal={false}>
      <IconTooltip label={t("accountMenu")}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={t("accountMenu")}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground ring-2 ring-surface transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {initials(email)}
          </button>
        </DropdownMenu.Trigger>
      </IconTooltip>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} className={MENU_CONTENT}>
          <DropdownMenu.Label className="px-2.5 pt-2 text-xs font-medium text-foreground">
            {t("signedInAs")}
          </DropdownMenu.Label>
          {email ? (
            <DropdownMenu.Label className="truncate px-2.5 pb-2 text-xs text-muted-foreground">
              {email}
            </DropdownMenu.Label>
          ) : null}
          <DropdownMenu.Item className={MENU_ITEM} onSelect={() => openEditor(router, homeHref)}>
            <PencilRuler size={15} aria-hidden />
            {t("openEditor")}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            className={MENU_ITEM}
            onSelect={() => {
              void staff.signOut().then(() => router.replace(publicHomeFromHome(homeHref)));
            }}
          >
            <LogOut size={15} aria-hidden />
            {t("signOut")}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
