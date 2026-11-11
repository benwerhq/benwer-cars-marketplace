import type { BookingMode, SiteLayout, SiteStatus } from "@/enums";

export interface WebsiteSettings {
  layout: SiteLayout;
  status: SiteStatus;
  bookingMode: BookingMode;
  minLeadHours: number;
  requestWindowHours: number;
  headline: Record<string, string>;
  intro: Record<string, string>;
  showPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
  primaryColor: string;
  domain: string;
  canEdit: boolean;
}

export type WebsiteSettingsPatch = Partial<
  Omit<WebsiteSettings, "canEdit">
>;
