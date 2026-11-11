"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { SitePaymentMethod } from "@/enums";
import { cn } from "@/lib/utils";
import type { SiteContactContent } from "@/types/siteContent";
import { EditorGroup, LocalizedField, TextField } from "./EditorPrimitives";

interface ContactFormProps {
  contact: SiteContactContent;
  locale: string;
  onChange: (contact: SiteContactContent) => void;
}

export function ContactForm({ contact, locale, onChange }: ContactFormProps) {
  const t = useTranslations("siteEditor.contact");
  const tPayments = useTranslations("siteSections.payments");

  return (
    <EditorGroup title={t("title")} description={t("description")}>
      <TextField
        id="contact-whatsapp"
        label={t("whatsapp")}
        type="tel"
        inputMode="tel"
        value={contact.whatsapp}
        placeholder="+34 600 12 34 56"
        hint={t("whatsappHint")}
        onChange={(whatsapp) => onChange({ ...contact, whatsapp })}
      />
      <LocalizedField
        id="contact-hours"
        label={t("hours")}
        value={contact.hours}
        locale={locale}
        maxLength={160}
        multiline
        placeholder={t("hoursPlaceholder")}
        onChange={(hours) => onChange({ ...contact, hours })}
      />
      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-medium text-foreground">{t("payments")}</legend>
        <p className="text-xs text-muted-foreground">{t("paymentsHint")}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {Object.values(SitePaymentMethod).map((method) => {
            const selected = contact.payments.includes(method);
            return (
              <button
                key={method}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  onChange({
                    ...contact,
                    payments: selected
                      ? contact.payments.filter((item) => item !== method)
                      : Object.values(SitePaymentMethod).filter(
                          (item) => item === method || contact.payments.includes(item),
                        ),
                  })
                }
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-border-strong",
                )}
              >
                {selected ? <Check size={12} aria-hidden /> : null}
                {tPayments(method)}
              </button>
            );
          })}
        </div>
      </fieldset>
    </EditorGroup>
  );
}
