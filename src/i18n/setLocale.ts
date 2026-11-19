"use server";

import { cookies } from "next/headers";
import { StorageKeys } from "@/enums";
import { isAppLocale } from "@/i18n/routing";

export async function setLocaleCookie(locale: string) {
  if (!isAppLocale(locale)) {
    return;
  }

  const store = await cookies();
  store.set(StorageKeys.LOCALE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
