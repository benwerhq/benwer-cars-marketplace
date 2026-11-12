import { ArrowUpRight, LayoutDashboard, Smartphone, Store } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/Button";
import { env } from "@/env";
import { cn } from "@/lib/utils";
import { SiteSectionHeading } from "./SiteSectionHeading";

const DEFAULT_PLANS_URL = "https://cars.benwer.es";

export async function PartnersInvite() {
  const t = await getTranslations("partners");
  const tFeatures = await getTranslations("whatYouGet");
  const plansHref = env.NEXT_PUBLIC_MARKETING_URL || DEFAULT_PLANS_URL;
  const demoHref = env.NEXT_PUBLIC_ADMIN_DEMO_URL;
  const features = [
    {
      icon: LayoutDashboard,
      title: tFeatures("admin.title"),
      body: tFeatures("admin.body"),
    },
    {
      icon: Smartphone,
      title: tFeatures("mobile.title"),
      body: tFeatures("mobile.body"),
    },
    {
      icon: Store,
      title: tFeatures("storefront.title"),
      body: tFeatures("storefront.body"),
    },
  ];

  return (
    <section
      id="partners"
      aria-labelledby="partners-heading"
      className="flex scroll-mt-24 flex-col gap-8 rounded-2xl border border-border bg-surface p-6 md:p-10"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SiteSectionHeading
          id="partners-heading"
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
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
      </div>
      <ul className="grid gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="flex flex-col rounded-2xl border border-border bg-background p-5"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon size={20} aria-hidden />
            </span>
            <p className="mt-4 text-base font-semibold text-foreground">
              {title}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
