import type { PublicChannel, ReservationStatus } from "@/enums";
import type { Company } from "./company";
import type { PriceBreakdown } from "./pricing";
import type { Vehicle } from "./vehicle";

export interface CreateGuestReservationPayload {
  vehicleId: string;
  startDate: string;
  endDate: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  insurancePackageId?: string;
  channel?: PublicChannel;
  acceptTerms?: boolean;
}

export interface GuestReservation {
  id: string;
  token: string;
  status: ReservationStatus;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  priceBreakdown: PriceBreakdown | null;
  currency: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  companySlug: string;
  createdAt: string;
  requestExpiresAt: string | null;
  cancelReason: string | null;
  vehicle?: Vehicle | null;
  company?: Company | null;
}
