export type PriceSource = "group" | "override" | "vehicle";

export type PriceWarningCode = "pricing.min_days" | "pricing.max_days";

export interface PriceSegment {
  startDate: string;
  endDate: string;
  days: number;
  seasonId: string | null;
  seasonName: Record<string, string> | null;
  dailyRate: number;
  weekend: boolean;
  subtotal: number;
}

export interface PriceWarning {
  code: PriceWarningCode;
  seasonId: string;
  limit: number;
}

export interface PriceBreakdown {
  source: PriceSource;
  totalDays: number;
  segments: PriceSegment[];
  vehicleSubtotal: number;
  averageDailyRate: number;
  warnings: PriceWarning[];
}

export interface PriceQuoteQuery {
  vehicleId: string;
  startDate: string;
  endDate: string;
}
