import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { CompanyMark } from "@/components/features/CompanyMark";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";
import { phoneTelHref } from "@/lib/phone";

interface CompanyBannerProps {
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  location?: string | null;
  websiteHref?: string | null;
  websiteLabel?: string;
  email?: string | null;
  phone?: string | null;
  contactLabel?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function CompanyBanner({
  name,
  logoUrl,
  description,
  location,
  websiteHref,
  websiteLabel,
  email,
  phone,
  contactLabel,
  backHref,
  backLabel,
  className,
}: CompanyBannerProps) {
  const company: Pick<Company, "name" | "branding"> = {
    name,
    branding: { primaryColor: "", logoUrl: logoUrl ?? null },
  };
  const contactHref = email ? `mailto:${email}` : phone ? phoneTelHref(phone) : null;

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent-soft",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 py-12 md:px-6 md:py-14 lg:px-8">
        {backHref && backLabel ? (
          <Link
            href={backHref}
            className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft size={16} aria-hidden />
            {backLabel}
          </Link>
        ) : null}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <CompanyMark company={company} size="lg" />
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {name}
              </h1>
              {description ? (
                <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
                  {description}
                </p>
              ) : null}
              {location ? (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin size={16} aria-hidden />
                  {location}
                </p>
              ) : null}
            </div>
          </div>
          {websiteHref || contactHref ? (
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              {websiteHref && websiteLabel ? (
                <a
                  href={websiteHref}
                  className={cn(
                    buttonVariants({ variant: "primary" }),
                    "w-full sm:w-auto",
                  )}
                >
                  {websiteLabel}
                  <ArrowUpRight size={16} aria-hidden />
                </a>
              ) : null}
              {contactHref && contactLabel ? (
                <a
                  href={contactHref}
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "w-full sm:w-auto",
                  )}
                >
                  {email ? (
                    <Mail size={16} aria-hidden />
                  ) : (
                    <Phone size={16} aria-hidden />
                  )}
                  {contactLabel}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
