import { env } from "@/env";

const WHATSAPP_PHONE_PATTERN = /^\d{8,15}$/;

export function normalizeWhatsAppNumber(raw: string | undefined): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  return WHATSAPP_PHONE_PATTERN.test(digits) ? digits : null;
}

export function buildWhatsAppUrl(phone: string, message = ""): string {
  const url = new URL(`https://wa.me/${phone}`);
  if (message.trim()) {
    url.searchParams.set("text", message.trim());
  }
  return url.toString();
}

export function whatsappSupportHref(
  message: string,
  rawNumber: string | undefined = env.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER,
): string | null {
  const phone = normalizeWhatsAppNumber(rawNumber);
  return phone ? buildWhatsAppUrl(phone, message) : null;
}
