export interface InsurancePackageQuote {
  packageId: string;
  code: string;
  name: Record<string, string>;
  description: Record<string, string> | null;
  pricePerDay: number;
  total: number;
  excessAmount: number;
  depositAmount: number;
  isDefault: boolean;
}
