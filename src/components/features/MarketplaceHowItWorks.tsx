import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  Check,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/Button";
import { NavRoutes } from "@/enums";
import { cn } from "@/lib/utils";
import { SiteSectionHeading } from "./SiteSectionHeading";

const PREVIEW_CARD =
  "mx-auto mt-6 w-full max-w-72 rounded-2xl border border-border bg-surface p-3 text-left shadow-[0_12px_30px_-16px_color-mix(in_oklab,var(--foreground)_30%,transparent)]";

function StepArrow() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -top-3 left-[calc(50%+2.75rem)] hidden h-10 w-[calc(100%-5.5rem+2.5rem)] text-primary md:block"
    >
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        <path
          d="M0 40 C 25 0, 75 0, 99 38"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <ChevronRight
        size={20}
        strokeWidth={2.5}
        className="absolute -right-1.5 -bottom-2 rotate-[55deg]"
      />
    </span>
  );
}

function PreviewCar({
  name,
  specs,
  price,
}: {
  name: string;
  specs: string;
  price: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-subtle-foreground">
        <CarFront size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {name}
        </span>
        <span className="block text-xs text-muted-foreground">
          {specs}
        </span>
      </span>
      <span className="shrink-0 text-sm font-bold text-primary">{price}</span>
    </div>
  );
}

export async function MarketplaceHowItWorks() {
  const t = await getTranslations("howItWorks");
  const field =
    "flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground";

  const steps: { key: string; preview: ReactNode }[] = [
    {
      key: "search",
      preview: (
        <div className="flex flex-col gap-1.5">
          <span className={field}>
            <MapPin size={14} className="text-primary" />
            {t("preview.place")}
          </span>
          <span className={field}>
            <CalendarDays size={14} className="text-primary" />
            {t("preview.dates")}
          </span>
        </div>
      ),
    },
    {
      key: "compare",
      preview: (
        <div className="flex flex-col gap-2 divide-y divide-border [&>*+*]:pt-2">
          <PreviewCar
            name={t("preview.carA")}
            specs={t("preview.carASpecs")}
            price={t("preview.carAPrice")}
          />
          <PreviewCar
            name={t("preview.carB")}
            specs={t("preview.carBSpecs")}
            price={t("preview.carBPrice")}
          />
        </div>
      ),
    },
    {
      key: "continue",
      preview: (
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
            <Check size={16} strokeWidth={3} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">
              {t("preview.confirmed")}
            </span>
            <span className="block text-xs text-muted-foreground">
              {t("preview.confirmedDetail")}
            </span>
          </span>
        </div>
      ),
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="flex scroll-mt-24 flex-col items-center gap-12"
    >
      <SiteSectionHeading
        id="how-it-works-heading"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("subtitle")}
        className="items-center text-center md:flex-col md:items-center"
      />
      <ol className="grid w-full gap-14 md:grid-cols-3 md:gap-10">
        {steps.map(({ key, preview }, index) => (
          <li key={key} className="relative flex flex-col items-center text-center">
            {index < steps.length - 1 ? <StepArrow /> : null}
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground ring-8 ring-primary/10">
              <span className="sr-only">{t("stepLabel", { number: index + 1 })}</span>
              <span aria-hidden>{index + 1}</span>
            </span>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              {t(`${key}Title`)}
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground md:text-base">
              {t(`${key}Body`)}
            </p>
            <div aria-hidden className={PREVIEW_CARD}>
              {preview}
            </div>
          </li>
        ))}
      </ol>
      <Link
        href={NavRoutes.CARS}
        className={cn(buttonVariants({ size: "lg" }), "rounded-full")}
      >
        {t("cta")}
        <ArrowRight size={18} aria-hidden />
      </Link>
    </section>
  );
}
