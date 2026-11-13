import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/Button";
import { env } from "@/env";
import { cn } from "@/lib/utils";
import { SiteSectionHeading } from "./SiteSectionHeading";

const DEFAULT_PLANS_URL = "https://cars.benwer.es";
const BAR_HEIGHTS = [40, 55, 48, 70, 88, 64, 76, 95];
const PEAK_BARS = new Set([4, 7]);

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
  const kpis = [
    { value: tFeatures("preview.utilisationValue"), label: tFeatures("preview.utilisation") },
    { value: tFeatures("preview.pickupsValue"), label: tFeatures("preview.pickups") },
    { value: tFeatures("preview.revenueValue"), label: tFeatures("preview.revenue") },
  ];

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
          <div
            aria-hidden
            className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_50px_-30px_color-mix(in_oklab,var(--foreground)_40%,transparent)] lg:mt-auto"
          >
            <div className="flex gap-1.5 border-b border-border px-3 py-2.5">
              <span className="h-2 w-2 rounded-full bg-border-strong" />
              <span className="h-2 w-2 rounded-full bg-border-strong" />
              <span className="h-2 w-2 rounded-full bg-border-strong" />
            </div>
            <div className="grid sm:grid-cols-[7rem_1fr]">
              <div className="hidden flex-col gap-2 border-r border-border p-3 sm:flex">
                <span className="h-2 rounded-full bg-primary/15" />
                <span className="h-2 rounded-full bg-surface-muted" />
                <span className="h-2 rounded-full bg-surface-muted" />
                <span className="h-2 rounded-full bg-surface-muted" />
              </div>
              <div className="flex min-w-0 flex-col gap-3 p-3">
                <div className="grid grid-cols-3 gap-2">
                  {kpis.map(({ value, label }) => (
                    <div key={label} className="min-w-0 rounded-lg border border-border p-2">
                      <span className="block text-base font-bold text-foreground tabular-nums sm:text-lg">
                        {value}
                      </span>
                      <span className="block text-[11px] leading-tight text-muted-foreground">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex h-20 items-end gap-1.5 px-1">
                  {BAR_HEIGHTS.map((height, index) => (
                    <span
                      key={index}
                      style={{ height: `${height}%` }}
                      className={cn(
                        "flex-1 rounded-t",
                        PEAK_BARS.has(index) ? "bg-primary" : "bg-primary/25",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </li>
        <li className={cn(TILE, "min-h-52 bg-surface")}>
          <TileCopy
            title={tFeatures("mobile.title")}
            body={tFeatures("mobile.body")}
            className="pr-32"
          />
          <div
            aria-hidden
            className="absolute right-6 -bottom-10 flex h-48 w-28 flex-col gap-1.5 rounded-[1.5rem] border-[6px] border-foreground bg-surface px-2 pt-4"
          >
            <span className="h-5 rounded-md bg-success-soft" />
            <span className="h-5 rounded-md bg-surface-muted" />
            <span className="h-5 rounded-md bg-success-soft" />
            <span className="h-5 rounded-md bg-surface-muted" />
          </div>
        </li>
        <li className={cn(TILE, "min-h-52 bg-surface pb-28 sm:pb-7")}>
          <TileCopy
            title={tFeatures("storefront.title")}
            body={tFeatures("storefront.body")}
            className="sm:max-w-[55%]"
          />
          <div
            aria-hidden
            className="absolute -right-4 -bottom-6 w-56 rounded-xl border border-border bg-surface shadow-[0_20px_40px_-24px_color-mix(in_oklab,var(--foreground)_40%,transparent)]"
          >
            <div className="truncate border-b border-border px-3 py-1.5 text-[10px] text-muted-foreground">
              {tFeatures("preview.domain")}
            </div>
            <div className="m-2 h-14 rounded-lg bg-gradient-to-br from-primary to-promo" />
            <div className="mx-2 mb-3 flex gap-1.5">
              <span className="h-8 flex-1 rounded-md bg-surface-muted" />
              <span className="h-8 flex-1 rounded-md bg-surface-muted" />
              <span className="h-8 flex-1 rounded-md bg-surface-muted" />
            </div>
          </div>
        </li>
      </ul>
    </section>
  );
}
