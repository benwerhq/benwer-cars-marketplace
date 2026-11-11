import { z } from "zod";

export interface BookingSchemaMessages {
  nameMin: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
  endAfterStart: string;
  terms?: string;
}

const PHONE_PATTERN = /^[+]?[\d\s()-]{6,}$/;

export function createBookingSchema(messages: BookingSchemaMessages) {
  return z
    .object({
      guestName: z.string().trim().min(2, messages.nameMin),
      guestEmail: z.email(messages.email),
      guestPhone: z
        .string()
        .trim()
        .min(7, messages.phone)
        .regex(PHONE_PATTERN, messages.phone),
      startDate: z.string().min(1, messages.startDate),
      endDate: z.string().min(1, messages.endDate),
      termsAccepted: z.boolean(),
    })
    .refine((data) => data.endDate > data.startDate, {
      message: messages.endAfterStart,
      path: ["endDate"],
    })
    .refine((data) => !messages.terms || data.termsAccepted, {
      message: messages.terms,
      path: ["termsAccepted"],
    });
}

export type BookingFormValues = z.infer<ReturnType<typeof createBookingSchema>>;
