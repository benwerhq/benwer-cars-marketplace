import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/features/ContactForm";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { buttonVariants } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { ContactTopic, NavRoutes, SearchParams } from "@/enums";
import { buildPageMetadata } from "@/lib/seo";
import { whatsappSupportHref } from "@/lib/whatsappSupport";

interface ContactPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("contact");
  const tBrand = await getTranslations("brand");

  return buildPageMetadata({
    title: t("title"),
    description: t("lede"),
    path: "/contact",
    siteName: tBrand("name"),
    locale,
  });
}

async function ContactPage({ searchParams }: ContactPageProps) {
  const t = await getTranslations("contact");
  const tNav = await getTranslations("nav");
  const tSupport = await getTranslations("support");
  const isTenant = Boolean((await headers()).get("x-company-slug"));
  const topic =
    (await searchParams)[SearchParams.TOPIC] === ContactTopic.SUPPORT
      ? ContactTopic.SUPPORT
      : undefined;
  const whatsapp = isTenant
    ? null
    : whatsappSupportHref(tSupport("whatsappMessage"));

  return (
    <LegalLayout width="form">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            {t("lede")}
          </p>
          <p className="text-sm text-muted-foreground">{t("bookingHint")}</p>
        </header>
        <ContactForm topic={topic} />
        {whatsapp ? (
          <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold text-foreground">
                {t("whatsappTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("whatsappDescription")}
              </p>
            </div>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              <WhatsAppIcon size={18} className="text-primary" />
              {tSupport("whatsappAction")}
            </a>
          </section>
        ) : null}
        <nav
          className="flex flex-wrap gap-x-4 gap-y-2 text-sm"
          aria-label={tNav("footerAria")}
        >
          <Link
            href={NavRoutes.PRIVACY}
            className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {tNav("privacy")}
          </Link>
          <Link
            href={NavRoutes.TERMS}
            className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {tNav("terms")}
          </Link>
          <Link
            href={NavRoutes.COOKIES}
            className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {tNav("cookies")}
          </Link>
        </nav>
      </div>
    </LegalLayout>
  );
}

export default ContactPage;
