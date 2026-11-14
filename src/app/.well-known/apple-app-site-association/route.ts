import { appleAppSiteAssociationFromEnv } from "@/lib/guestApp";
import { wellKnownJson } from "@/lib/wellKnownResponse";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return wellKnownJson(request, appleAppSiteAssociationFromEnv);
}
