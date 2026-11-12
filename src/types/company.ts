export interface CompanyBranding {
  primaryColor: string;
  logoUrl: string | null;
}

export interface CompanyBranch {
  id: string;
  name: string;
  address: string;
}

export interface Company {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  location: string | null;
  locationSlug: string | null;
  latitude: number | null;
  longitude: number | null;
  vehicleCount: number | null;
  isPublic: boolean;
  websiteUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  branding: CompanyBranding;
  branches: CompanyBranch[];
  allowDifferentReturn: boolean;
}

export interface CompanyListFilters {
  location?: string;
  from?: string;
  to?: string;
  q?: string;
  cursor?: string;
  limit?: number;
}
