import { z } from "zod";

export interface BookingSchemaMessages {
  nameMin: string;
  nameMax?: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
  endAfterStart: string;
  terms?: string;
}

const PHONE_PATTERN = /^[+]?[\d\s()-]{6,}$/;
const E164_PATTERN = /^\+[1-9]\d{1,14}$/;

export function createBookingSchema(
  messages: BookingSchemaMessages,
  options?: { website?: boolean },
) {
  const website = options?.website ?? false;

  return z
    .object({
      guestName: website
        ? z
            .string()
            .trim()
            .min(1, messages.nameMin)
            .max(120, messages.nameMax ?? messages.nameMin)
        : z.string().trim().min(2, messages.nameMin),
      guestEmail: z.email(messages.email),
      guestPhone: website
        ? z
            .string()
            .trim()
            .transform((value) => value.replace(/[\s()-]/g, ""))
            .pipe(z.string().regex(E164_PATTERN, messages.phone))
        : z
            .string()
            .trim()
            .min(7, messages.phone)
            .regex(PHONE_PATTERN, messages.phone),
      startDate: z.string().min(1, messages.startDate),
      endDate: z.string().min(1, messages.endDate),
      acceptTerms: z.boolean(),
    })
    .refine((data) => data.endDate > data.startDate, {
      message: messages.endAfterStart,
      path: ["endDate"],
    })
    .refine((data) => !messages.terms || data.acceptTerms, {
      message: messages.terms,
      path: ["acceptTerms"],
    });
}

export type BookingFormValues = z.infer<ReturnType<typeof createBookingSchema>>;
