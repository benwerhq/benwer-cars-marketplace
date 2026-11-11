import type { BookingMode, SiteLayout, SiteStatus } from "@/enums";
import type { Company } from "./company";

export interface SiteBranch {
  id: string;
  name: string;
  address: string | null;
}

export interface PublicSite {
  slug: string;
  status: SiteStatus;
  bookingMode: BookingMode;
  minLeadHours: number;
  requestWindowHours: number;
  headline: Record<string, string>;
  intro: Record<string, string>;
  showPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
  isPreview: boolean;
  canonicalUrl: string | null;
  layout: SiteLayout;
  company: Company;
  branches: SiteBranch[];
}

export interface SiteQuery {
  preview?: string;
}
