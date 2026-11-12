import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/Button";
import { env } from "@/env";
import { cn } from "@/lib/utils";


export async function PartnersInvite() {
  const t = await getTranslations("partners");
  const plansHref = env.NEXT_PUBLIC_MARKETING_URL;
  const demoHref = env.NEXT_PUBLIC_ADMIN_DEMO_URL;

  return (
    <section
      id="partners"
      className="rounded-2xl border border-border bg-surface px-4 py-6 text-foreground sm:px-8 sm:py-7"
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
        {t("eyebrow")}
      </p>
      <h2 className="mt-2 max-w-2xl text-2xl font-medium tracking-tight sm:text-3xl">
        {t("title")}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
        {t("description")}
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={plansHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("ctaAria")}
          className={cn(
            buttonVariants({ variant: "primary", size: "lg" }),
            "w-full sm:w-auto",
          )}
        >
          {t("cta")}
          <ArrowUpRight size={16} aria-hidden />
        </a>
        {demoHref ? (
          <a
            href={demoHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("demoAria")}
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "w-full sm:w-auto",
            )}
          >
            {t("demo")}
          </a>
        ) : null}
      </div>
    </section>
  );
}
