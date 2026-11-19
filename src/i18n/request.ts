import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { StorageKeys } from "@/enums";
import { loadLocaleMessages } from "./messages";
import { resolveLocale } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(StorageKeys.LOCALE)?.value;
  const locale = resolveLocale(cookieLocale ?? (await requestLocale));
  const messages = await loadLocaleMessages(locale);

  return {
    locale,
    messages,
  };
});
