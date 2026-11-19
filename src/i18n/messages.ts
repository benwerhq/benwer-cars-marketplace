import type enCommon from "../../messages/en-GB/common.json";
import type enMarketplace from "../../messages/en-GB/marketplace.json";
import type { AppLocale } from "./routing";

export type AppMessages = typeof enCommon & typeof enMarketplace;

export async function loadLocaleMessages(locale: AppLocale): Promise<AppMessages> {
  const [common, marketplace] = (await Promise.all([
    import(`../../messages/${locale}/common.json`),
    import(`../../messages/${locale}/marketplace.json`),
  ])) as [{ default: typeof enCommon }, { default: typeof enMarketplace }];

  return {
    ...common.default,
    ...marketplace.default,
  };
}
