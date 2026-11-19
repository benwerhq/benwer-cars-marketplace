import { redirect } from "next/navigation";
import { NavRoutes } from "@/enums";

/** The main marketplace has no cart. Company sites keep /cart on their own host. */
export default function MarketplaceCartRedirectPage() {
  redirect(NavRoutes.HOME);
}
