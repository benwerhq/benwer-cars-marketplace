/** The company's customer record linked to the signed-in guest. */
export interface GuestCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
}

export interface GuestAccount {
  email: string;
  linked: boolean;
  companySlug: string;
  emailVerified?: boolean;
  customer?: GuestCustomer | null;
}

export interface GuestLinkPayload {
  email?: string;
  bookingToken?: string;
}

export interface GuestLinkRequestResult {
  sent: boolean;
}
