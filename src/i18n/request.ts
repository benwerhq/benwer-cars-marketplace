import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { StorageKeys } from "@/enums";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(StorageKeys.LOCALE)?.value;
  let locale = cookieLocale ?? (await requestLocale);

  if (
    !locale ||
    !routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
    locale = routing.defaultLocale;
  }

  const [common, marketplace] = await Promise.all([
    import(`../../messages/${locale}/common.json`),
    import(`../../messages/${locale}/marketplace.json`),
  ]);

  return {
    locale,
    messages: {
      ...common.default,
      ...marketplace.default,
    },
  };
});
