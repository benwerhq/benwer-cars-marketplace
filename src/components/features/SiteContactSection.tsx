"use client";

import { Mail, MessageCircle, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/Button";
import { SiteSectionId } from "@/enums";
import { localizedText } from "@/lib/localizedCopy";
import { whatsappHref } from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import type { SiteContactContent } from "@/types/siteContent";

interface SiteContactSectionProps {
  contact: SiteContactContent;
  companyName: string;
  phone: string | null;
  email: string | null;
}

export function SiteContactSection({
  contact,
  companyName,
  phone,
  email,
}: SiteContactSectionProps) {
  const t = useTranslations("siteSections.contact");
  const locale = useLocale();
  const headingId = `${SiteSectionId.CONTACT}-heading`;
  const whatsapp = whatsappHref(
    contact.whatsapp || phone || "",
    t("whatsappMessage", { name: companyName }),
  );
  const hours = localizedText(contact.hours, locale);

  return (
    <section
      id={SiteSectionId.CONTACT}
      aria-labelledby={headingId}
      className="flex scroll-mt-24 flex-col gap-6 rounded-2xl border border-border bg-surface p-6 md:flex-row md:items-center md:justify-between md:p-10"
    >
      <div className="max-w-xl">
        <h2 id={headingId} className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          {hours || t("description")}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "rounded-full")}
          >
            <MessageCircle size={18} aria-hidden />
            {t("whatsapp")}
          </a>
        ) : null}
        {phone ? (
          <a
            href={`tel:${phone}`}
            className={cn(
              buttonVariants({ variant: whatsapp ? "secondary" : "primary", size: "lg" }),
              "rounded-full",
            )}
          >
            <Phone size={18} aria-hidden />
            {phone}
          </a>
        ) : null}
        {email ? (
          <a
            href={`mailto:${email}`}
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "rounded-full")}
          >
            <Mail size={18} aria-hidden />
            {t("email")}
          </a>
        ) : null}
      </div>
    </section>
  );
}
