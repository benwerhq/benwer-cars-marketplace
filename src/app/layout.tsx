import type { Metadata } from "next";
import { Bebas_Neue, Caveat, Inter, Lora, Poppins } from "next/font/google";
import { cookies, headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { Toaster } from "sonner";
import { QueryProvider } from "@/context/QueryProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { CookieBannerHost } from "@/components/features/CookieBannerHost";
import { StorageKeys } from "@/enums";
import { routing } from "@/i18n/routing";
import {
  parseColorScheme,
  serverDarkClass,
  systemColorSchemeScript,
} from "@/lib/colorScheme";
import { guestAppSmartBanner } from "@/lib/guestApp";
import { buildPageMetadata, getSiteUrl, websiteJsonLd } from "@/lib/seo";
import enCommon from "../../messages/en-GB/common.json";
import enMarketplace from "../../messages/en-GB/marketplace.json";
import esCommon from "../../messages/es-ES/common.json";
import esMarketplace from "../../messages/es-ES/marketplace.json";
import ptCommon from "../../messages/pt-PT/common.json";
import ptMarketplace from "../../messages/pt-PT/marketplace.json";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lora",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-bebas",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  variable: "--font-caveat",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const tMeta = await getTranslations("meta");
  const tBrand = await getTranslations("brand");
  const page = buildPageMetadata({
    title: tMeta("siteTitle"),
    description: tMeta("siteDescription"),
    path: "/",
    siteName: tBrand("name"),
    locale,
  });
  const itunes = (await headers()).get("x-company-slug") ? null : guestAppSmartBanner();

  return {
    ...(itunes ? { itunes } : {}),
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: `${tBrand("name")} — ${tMeta("siteTitle")}`,
      template: `%s — ${tBrand("name")}`,
    },
    description: tMeta("siteDescription"),
    alternates: page.alternates,
    openGraph: {
      ...page.openGraph,
      title: `${tBrand("name")} — ${tMeta("siteTitle")}`,
    },
    twitter: {
      ...page.twitter,
      title: `${tBrand("name")} — ${tMeta("siteTitle")}`,
    },
  };
}

function resolveLocale(
  value: string | undefined,
): (typeof routing.locales)[number] {
  if (value && routing.locales.includes(value as (typeof routing.locales)[number])) {
    return value as (typeof routing.locales)[number];
  }

  return routing.defaultLocale;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(StorageKeys.LOCALE)?.value);
  const colorScheme = parseColorScheme(cookieStore.get(StorageKeys.COLOR_SCHEME)?.value);
  const colorSchemeScript = systemColorSchemeScript(colorScheme);
  const messages =
    locale === "es-ES"
      ? { ...esCommon, ...esMarketplace }
      : locale === "pt-PT"
        ? { ...ptCommon, ...ptMarketplace }
        : { ...enCommon, ...enMarketplace };

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${lora.variable} ${poppins.variable} ${bebasNeue.variable} ${caveat.variable} ${serverDarkClass(colorScheme)}`}
      suppressHydrationWarning
    >
      {colorSchemeScript ? (
        <head>
          <script dangerouslySetInnerHTML={{ __html: colorSchemeScript }} />
        </head>
      ) : null}
      <body className="flex min-h-dvh flex-col bg-background text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <JsonLd
              data={websiteJsonLd({
                name: messages.brand.name,
                description: messages.meta.siteDescription,
              })}
            />
            {children}
            <CookieBannerHost />
            <Toaster richColors position="top-right" offset={{ top: 80 }} mobileOffset={{ top: 72 }} />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
