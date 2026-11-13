"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Headset, MessageSquare, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { ContactTopic, NavRoutes, SearchParams } from "@/enums";
import { cn } from "@/lib/utils";

interface SupportFabProps {
  whatsappHref: string | null;
}

const menuItemClass =
  "flex items-center gap-3 px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none";

export function SupportFab({ whatsappHref }: SupportFabProps) {
  const t = useTranslations("support");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (pathname.startsWith(NavRoutes.BOOK)) {
    return null;
  }

  const close = () => setOpen(false);

  return (
    <div
      ref={rootRef}
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 size-14 sm:right-6 sm:bottom-6"
    >
      <div
        id="support-menu"
        role="menu"
        aria-label={t("fabLabel")}
        hidden={!open}
        className="absolute right-0 bottom-full mb-3 flex min-w-56 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
      >
        <Link
          role="menuitem"
          href={`${NavRoutes.CONTACT}?${SearchParams.TOPIC}=${ContactTopic.SUPPORT}`}
          onClick={close}
          className={menuItemClass}
        >
          <MessageSquare size={18} className="text-primary" aria-hidden />
          {t("messageAction")}
        </Link>
        {whatsappHref ? (
          <a
            role="menuitem"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className={cn(menuItemClass, "border-t border-border")}
          >
            <WhatsAppIcon size={18} className="text-primary" />
            {t("whatsappAction")}
          </a>
        ) : null}
      </div>

      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? t("fabCloseLabel") : t("fabLabel")}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="support-menu"
        className="inline-flex size-14 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {open ? <X size={22} aria-hidden /> : <Headset size={22} aria-hidden />}
      </button>
    </div>
  );
}
