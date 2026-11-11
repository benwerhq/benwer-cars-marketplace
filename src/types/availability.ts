export interface AvailabilityRange {
  vehicleId: string;
  unavailableDates: string[];
}

import type { PublicChannel } from "@/enums";

export interface AvailabilityQuery {
  from: string;
  to: string;
  vehicleId?: string;
  channel?: PublicChannel;
}
