export interface GuestAccount {
  email: string;
  linked: boolean;
  companySlug: string;
}

export interface GuestLinkPayload {
  email?: string;
  bookingToken?: string;
}

export interface GuestLinkRequestResult {
  sent: boolean;
}
