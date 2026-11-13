export interface AvailabilityRange {
  vehicleId: string;
  unavailableDates: string[];
  available?: boolean;
  from?: string;
  to?: string;
}

import type { PublicChannel } from "@/enums";

export interface AvailabilityQuery {
  from: string;
  to: string;
  vehicleId?: string;
  channel?: PublicChannel;
}
