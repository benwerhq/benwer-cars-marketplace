import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/Button";
import { env } from "@/env";
import { cn } from "@/lib/utils";
import {
  AdminCalendarPreview,
  StaffPhonePreview,
  StorefrontPreview,
} from "./PartnerPreviews";
import { SiteSectionHeading } from "./SiteSectionHeading";

const DEFAULT_PLANS_URL = "https://cars.benwer.es";

const TILE = "relative overflow-hidden rounded-3xl border border-border p-6 md:p-7";

function TileCopy({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={cn("relative max-w-sm", className)}>
      <h3 className="text-lg font-semibold text-foreground md:text-xl">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:text-base">
        {body}
      </p>
    </div>
  );
}

export async function PartnersInvite() {
  const t = await getTranslations("partners");
  const tFeatures = await getTranslations("whatYouGet");
  const plansHref = env.NEXT_PUBLIC_MARKETING_URL || DEFAULT_PLANS_URL;
  const demoHref = env.NEXT_PUBLIC_ADMIN_DEMO_URL;

  return (
    <section
      id="partners"
      aria-labelledby="partners-heading"
      className="flex scroll-mt-24 flex-col gap-8"
    >
      <SiteSectionHeading
        id="partners-heading"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={plansHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("ctaAria")}
              className={cn(buttonVariants({ size: "lg" }), "rounded-full")}
            >
              {t("cta")}
              <ArrowUpRight size={18} aria-hidden />
            </a>
            {demoHref ? (
              <a
                href={demoHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("demoAria")}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "rounded-full",
                )}
              >
                {t("demo")}
              </a>
            ) : null}
          </div>
        }
      />
      <ul className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:grid-rows-2">
        <li
          className={cn(
            TILE,
            "flex flex-col bg-gradient-to-b from-surface-muted to-surface lg:row-span-2",
          )}
        >
          <TileCopy title={tFeatures("admin.title")} body={tFeatures("admin.body")} />
          <div className="mt-6 lg:mt-auto lg:pt-6">
            <AdminCalendarPreview />
          </div>
        </li>
        <li className={cn(TILE, "bg-surface sm:min-h-64")}>
          <TileCopy
            title={tFeatures("mobile.title")}
            body={tFeatures("mobile.body")}
            className="sm:max-w-[calc(100%-14.5rem)]"
          />
          <StaffPhonePreview className="relative mx-auto mt-6 -mb-36 sm:absolute sm:top-6 sm:right-8 sm:m-0" />
        </li>
        <li className={cn(TILE, "flex flex-col bg-surface")}>
          <TileCopy
            title={tFeatures("storefront.title")}
            body={tFeatures("storefront.body")}
          />
          <StorefrontPreview className="relative mx-auto mt-6 -mb-20 sm:mr-0 sm:-mb-24" />
        </li>
      </ul>
    </section>
  );
}
