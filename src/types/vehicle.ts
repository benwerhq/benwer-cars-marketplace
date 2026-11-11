import type {
  FuelType,
  PublicChannel,
  TransmissionType,
  VehicleStatus,
  VehicleType,
} from "@/enums";
import type { Company } from "./company";

export interface Vehicle {
  id: string;
  companySlug: string;
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  transmission: TransmissionType;
  fuel: FuelType;
  seats: number;
  pricePerDay: number;
  currency: string;
  status: VehicleStatus;
  isPublic: boolean;
  photos: string[];
  description: string | null;
  color: string | null;
  deposit: number | null;
  category: string | null;
  mileage: number | null;
  branchId: string | null;
}

export interface VehicleFilters {
  type?: VehicleType;
  seats?: number;
  transmission?: TransmissionType;
  from?: string;
  to?: string;
  q?: string;
  sort?: string;
  cursor?: string;
  limit?: number;
  companySlug?: string;
  companySlugs?: string[];
  branchId?: string;
  channel?: PublicChannel;
}

export interface MarketplaceSearchFilters extends VehicleFilters {
  location?: string;
}

export interface MarketplaceVehicle extends Vehicle {
  company: Company;
}
