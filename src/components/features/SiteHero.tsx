import { Mail, MapPin, Phone } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { CompanyMark } from "./CompanyMark";
import { SiteEditSection } from "@/components/layout/SiteEditSection";
import { SiteEditSection as SiteEditSectionId } from "@/enums";
import { localizedText } from "@/lib/localizedCopy";
import type { PublicSite } from "@/types/site";

interface SiteHeroProps {
  site: PublicSite;
  editMode?: boolean;
}

export async function SiteHero({ site, editMode = false }: SiteHeroProps) {
  const locale = await getLocale();
  const t = await getTranslations("site");
  const headline =
    localizedText(site.headline, locale) ||
    t("defaultHeadline", { name: site.company.name });
  const intro =
    localizedText(site.intro, locale) || site.company.description || "";
  const phone = site.showPhone ? site.company.phone : null;
  const email = site.showEmail ? site.company.email : null;
  const address = site.showAddress
    ? site.company.address || site.company.location
    : null;

  return (
    <section className="relative w-full overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent-soft">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 md:px-6 md:py-14 lg:px-8">
        <SiteEditSection section={SiteEditSectionId.HERO} enabled={editMode}>
          <div className="flex items-start gap-4 p-1">
            <CompanyMark
              company={site.company}
              size="lg"
              className="h-16 w-16 rounded-2xl"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary">
                {site.company.name}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                {headline}
              </h1>
              {intro ? (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {intro}
                </p>
              ) : null}
            </div>
          </div>
        </SiteEditSection>
        <SiteEditSection section={SiteEditSectionId.CONTACT} enabled={editMode}>
          {phone || email || address ? (
            <ul className="flex flex-col gap-2 p-1 text-sm text-foreground sm:flex-row sm:flex-wrap sm:gap-6">
              {phone ? (
                <li className="inline-flex items-center gap-2">
                  <Phone size={16} className="text-primary" aria-hidden />
                  <a href={`tel:${phone}`} className="hover:text-primary">
                    {phone}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li className="inline-flex items-center gap-2">
                  <Mail size={16} className="text-primary" aria-hidden />
                  <a href={`mailto:${email}`} className="hover:text-primary">
                    {email}
                  </a>
                </li>
              ) : null}
              {address ? (
                <li className="inline-flex items-center gap-2">
                  <MapPin size={16} className="text-primary" aria-hidden />
                  <span>{address}</span>
                </li>
              ) : null}
            </ul>
          ) : editMode ? (
            <p className="p-1 text-sm text-muted-foreground">{t("editContactEmpty")}</p>
          ) : null}
        </SiteEditSection>
      </div>
    </section>
  );
}
