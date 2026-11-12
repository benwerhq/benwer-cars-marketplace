import type {
  PaymentChannel,
  PaymentStatus,
  PublicChannel,
  ReservationStatus,
} from "@/enums";
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
  addonIds?: string[];
  returnBranchId?: string;
  channel?: PublicChannel;
  acceptTerms?: boolean;
  /** "HH:mm"; needs the guest booking fields API change. */
  pickupTime?: string;
  returnTime?: string;
  flightNumber?: string;
  notes?: string;
  /** YYYY-MM-DD */
  dateOfBirth?: string;
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
  paymentStatus: PaymentStatus;
  paymentChannel: PaymentChannel | null;
  paidAmount: number;
  advanceDue: number;
  advanceAuthorized: boolean;
  paymentExpiresAt: string | null;
  onlinePaymentRequired: boolean;
  /** Insurance chosen at booking; its total is included in totalPrice. */
  insurance?: { name: Record<string, string> | null; code: string; total: number } | null;
  vehicle?: Vehicle | null;
  company?: Company | null;
}
