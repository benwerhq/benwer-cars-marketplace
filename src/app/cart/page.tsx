import { redirect } from "next/navigation";
import { NavRoutes } from "@/enums";

/** There is no cart on the marketplace or company sites; old /cart links go home. */
export default function MarketplaceCartRedirectPage() {
  redirect(NavRoutes.HOME);
}
