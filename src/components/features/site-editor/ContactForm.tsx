"use client";

import { useTranslations } from "next-intl";
import type { SiteContactContent } from "@/types/siteContent";
import { EditorGroup, LocalizedField, TextField } from "./EditorPrimitives";

interface ContactFormProps {
  contact: SiteContactContent;
  locale: string;
  onChange: (contact: SiteContactContent) => void;
}

export function ContactForm({ contact, locale, onChange }: ContactFormProps) {
  const t = useTranslations("siteEditor.contact");

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
    </EditorGroup>
  );
}
