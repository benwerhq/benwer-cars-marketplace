import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { NavRoutes, type SitePaymentMethod, type SiteSectionId } from "@/enums";
import { guestLinksFromHomeHref, ownerHrefFromHome } from "@/lib/site";
import { whatsappHref } from "@/lib/siteContent";
import { CookieSettingsLink } from "./CookieSettingsLink";
import { LocaleSwitcher } from "./LocaleSwitcher";

interface SiteFooterContact {
  phone: string | null;
  email: string | null;
  whatsapp: string;
}

interface SiteFooterProps {
  companyName: string;
  homeHref: string;
  description?: string | null;
  sections?: SiteSectionId[];
  contact?: SiteFooterContact;
  payments?: SitePaymentMethod[];
}

const linkClass =
  "w-fit text-sm text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const headingClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

export async function SiteFooter({
  companyName,
  homeHref,
  description,
  sections = [],
  contact,
  payments = [],
}: SiteFooterProps) {
  const year = new Date().getFullYear();
  const tFooter = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tSite = await getTranslations("site");
  const tSections = await getTranslations("siteSections");
  const home = homeHref.split("#")[0] ?? homeHref;
  const whatsapp = contact ? whatsappHref(contact.whatsapp) : null;
  const hasContact = Boolean(contact?.phone || contact?.email || whatsapp);

  return (
    <footer className="mt-auto w-full border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div className="flex max-w-sm flex-col gap-2">
            <p className="text-sm font-semibold text-foreground">{companyName}</p>
            <p className="text-sm text-muted-foreground">
              {description || tSite("footerTagline")}
            </p>
          </div>
          <nav aria-label={tFooter("explore")} className="flex flex-col gap-2">
            <p className={headingClass}>{tFooter("explore")}</p>
            <Link href={`${home}#fleet`} className={linkClass}>
              {tNav("cars")}
            </Link>
            {sections.map((id) => (
              <Link key={id} href={`${home}#${id}`} className={linkClass}>
                {tSections(`nav.${id}`)}
              </Link>
            ))}
          </nav>
          {hasContact && contact ? (
            <div className="flex flex-col gap-2">
              <p className={headingClass}>{tSections("footer.contact")}</p>
              {contact.phone ? (
                <a href={`tel:${contact.phone}`} className={linkClass}>
                  {contact.phone}
                </a>
              ) : null}
              {whatsapp ? (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {tSections("footer.whatsapp")}
                </a>
              ) : null}
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className={linkClass}>
                  {contact.email}
                </a>
              ) : null}
              <Link href={guestLinksFromHomeHref(homeHref).bookings} className={linkClass}>
                {tSections("footer.manageBooking")}
              </Link>
            </div>
          ) : null}
          <nav aria-label={tFooter("legal")} className="flex flex-col gap-2">
            <p className={headingClass}>{tFooter("legal")}</p>
            <Link href={NavRoutes.PRIVACY} className={linkClass}>
              {tNav("privacy")}
            </Link>
            <Link href={NavRoutes.TERMS} className={linkClass}>
              {tNav("terms")}
            </Link>
            <Link href={NavRoutes.COOKIES} className={linkClass}>
              {tNav("cookies")}
            </Link>
            <CookieSettingsLink className={`${linkClass} cursor-pointer text-left`} />
            <Link
              href={ownerHrefFromHome(homeHref)}
              className="w-fit text-xs text-muted-foreground hover:text-foreground"
            >
              {tSite("ownerSignIn")}
            </Link>
          </nav>
        </div>
        {payments.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-1 text-xs text-muted-foreground">{tSections("footer.weAccept")}</p>
            <ul className="flex flex-wrap gap-2">
              {payments.map((method) => (
                <li
                  key={method}
                  className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-foreground"
                >
                  {tSections(`payments.${method}`)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {tSections("footer.copyright", { year, name: companyName })} ·{" "}
            {tFooter("poweredBy")}
          </p>
          <LocaleSwitcher />
        </div>
      </div>
    </footer>
  );
}
