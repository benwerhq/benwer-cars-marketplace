import type { BookingMode, SiteStatus } from "@/enums";
import type { SiteContent } from "./siteContent";

export interface WebsiteSettings {
  status: SiteStatus;
  bookingMode: BookingMode;
  minLeadHours: number;
  requestWindowHours: number;
  headline: Record<string, string>;
  intro: Record<string, string>;
  showPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
  revision: number;
  hasUnpublishedChanges: boolean;
  canPublish: boolean;
  content: SiteContent;
  canEdit: boolean;
}

export interface WebsiteSettingsPatch {
  revision: number;
  bookingMode: BookingMode;
  minLeadHours: number;
  requestWindowHours: number;
  headline: Record<string, string>;
  intro: Record<string, string>;
  showPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
  layout: "classic";
  appearance: Record<string, unknown>;
}
