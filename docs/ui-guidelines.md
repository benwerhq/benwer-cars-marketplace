# UI Guidelines

The design system for Benwer Cars Marketplace. Goal: a consumer experience that feels
like **Airbnb, Vercel, and Linear** — clean, premium, visual-first, with clear booking
flows and generous whitespace.

Contrast with the admin web (dense, operational, Stripe-like). The marketplace is
**consumer-facing**: larger images, discoverable filters, prominent CTAs, and a
friction-free booking flow.

Same **token system and Tailwind conventions** as the admin web. Different layout
density and component repertoire.

---

## 1. Design principles

1. **Visual-first, not operational.** Cars are products — show photos prominently.
   Whitespace and image hierarchy dominate over table density.
2. **One clear action per page.** Each page has one primary CTA: view details, or
   book now, or confirm. Never compete for attention.
3. **Search and filter upfront.** Date pickers and filters are always accessible —
   customers think in terms of "I need a car on these dates".
4. **Brand-adaptable.** Tenant subdomains replace the primary colour via CSS
   variables. All components must work correctly with any reasonable accent colour.
5. **Every state is designed** — loading, empty, error, success are part of the
   feature, not afterthoughts.
6. **Accessible by default** — keyboard, focus, contrast, WCAG AA.
7. **Mobile-first.** Customers book on their phone. Breakpoints: `sm → md → lg`.

---

## 2. Theming & tokens

Identical token system to the admin web. Semantic CSS-variable tokens bound to
Tailwind v4 utilities. Light/dark via `.dark` class. Per-tenant `--primary` override
via inline `style` on `<html>`.

See [admin web ui-guidelines §2](../../benwer-cars-admin-web/docs/ui-guidelines.md#2-theming--tokens)
for the full token table and `globals.css` wiring — the marketplace `globals.css`
is identical.

Never hardcode a color. Components never branch on theme in JS.

---

## 3. Foundations

**Typography.** Font: Inter. Same scale as admin web:

| Role               | Classes                                 |
| ------------------ | --------------------------------------- |
| Page title (h1)    | `text-3xl font-semibold tracking-tight` |
| Section title (h2) | `text-xl font-semibold`                 |
| Card title (h3)    | `text-base font-semibold`               |
| Body               | `text-sm`                               |
| Secondary / labels | `text-sm text-muted-foreground`         |
| Meta / captions    | `text-xs text-subtle-foreground`        |
| Price              | `text-lg font-semibold tabular-nums`    |

**Spacing.** More generous than admin: `gap-6` within a section, `gap-8`/`gap-12`
between sections. Page padding `px-4 md:px-6 lg:px-8`.

**Radius.** `rounded-lg` cards, `rounded-xl` car photo containers, `rounded-full`
badges/pills.

**Images.** Car photos are the hero element. Use `next/image` always — never raw
`<img>`. First visible car photo gets `priority`. Off-screen photos must not.

**Icons.** `lucide-react`, `size={16}`–`20`. Icon-only controls require `aria-label`.

**Motion.** 150–200ms ease-out. Animate opacity/transform only.
Respect `prefers-reduced-motion`.

---

## 4. Composing primitives (`cva` + `cn`)

Same approach as admin web: `cva` for variants, `cn` for class merge.
`cn()` lives in `src/lib/utils.ts`. `cva` from `class-variance-authority`.

---

## 5. App layout

### Shared look between marketplace and company sites

The marketplace is styled as if Benwer were one more company site. It reuses the
company-site building blocks with hardcoded Benwer content (no API data):
`SiteHeaderShell`, `SiteIntroBand`, `SiteSectionHeading`, `SiteIncludedSection`,
`SiteAppSection`, `SiteFaqSection`, `PageIntro`, and the `SiteFooter` link styles.
New marketplace sections should compose these rather than add a separate style.

### Marketplace layout (`marketplace.benwer.es`)

- **Sticky top header**: Benwer Cars logo + nav (Home, Companies) + locale switcher.
- Full-width page, max content width `max-w-7xl mx-auto`.
- **Footer**: company info, links, locale toggle.

### Tenant subdomain layout (`*.benwer.es`)

- **Sticky top header**: Company logo/name + nav (Home, Cars) + locale switcher.
  Header uses `bg-primary/5` tint to hint at the company brand.
- **CompanyBanner** (optional): full-width hero with company name and tagline.
- No global marketplace nav — this is the company's own storefront.

### Page template

```tsx
<main className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8 flex flex-col gap-8">
  <PageHeader title={…} />
  {/* filters / search bar */}
  {/* loading | empty | error | content */}
</main>
```

---

## 6. Component inventory

### Shared primitives (`src/components/ui`)

| Component                   | Notes                                                      |
| --------------------------- | ---------------------------------------------------------- |
| **Button** / **IconButton** | Variants: primary, secondary, ghost. Sizes: sm/md/lg/icon. |
| **Badge** / **StatusBadge** | Status pill. Same enum → token mapping as admin web.       |
| **Input**, **Field**        | `Field` wraps label + input + hint + error.                |
| **Skeleton**                | Token-driven shimmer. Match the final layout shape.        |
| **EmptyState**              | Icon + title + description + optional action.              |
| **ErrorState**              | Message + retry button.                                    |
| **Toast**                   | Sonner-based. Success/error feedback after booking.        |
| **Dialog**                  | Radix. Confirmations only.                                 |

### Layout (`src/components/layout`)

| Component             | Notes                                                     |
| --------------------- | --------------------------------------------------------- |
| **MarketplaceHeader** | Global marketplace header with Benwer Cars branding.      |
| **TenantHeader**      | Per-company header; reads company name/logo from context. |
| **Footer**            | Links, locale switcher.                                   |
| **CompanyBanner**     | Hero strip with company name, location, optional tagline. |

### Feature components (`src/components/features`)

| Component                | Notes                                                                         |
| ------------------------ | ----------------------------------------------------------------------------- |
| **CarCard**              | Car photo, brand/model/year, price/day, specs badges, "View details" CTA.     |
| **CarGrid**              | Responsive grid of `CarCard`s. Handles loading (skeleton grid), empty, error. |
| **VehicleFilterToolbar** | Above every car list, one wrapping row: search, category, fuel, transmission, seats, company (marketplace) — same set as admin `/cars`. Applies instantly, URL-synced. |
| **VehicleResultsBar** | Below the toolbar: result count on the left, sort on the right. |
| **CarPhotoGallery**      | Main photo + thumbnail strip. Lightbox on click.                              |
| **SpecsTable**           | Type, fuel, transmission, seats in a clean grid.                              |
| **AvailabilityCalendar** | Highlight unavailable dates; user selects a range.                            |
| **BookingForm**          | react-hook-form + zod; name, email, phone, dates, submit.                     |
| **BookingSummary**       | Read-only summary card shown beside the form.                                 |
| **ReservationStatus**    | Token-based status display; shows vehicle, dates, total, status badge.        |
| **CompanyCard**          | Company name, location, fleet size, "View fleet" CTA.                         |
| **CompanyGrid**          | Responsive grid of `CompanyCard`s.                                            |
| **CompaniesMap**         | Leaflet map of company pins for the current location/date filters.            |
| **CompanyDirectory**     | Companies page map + list (side-by-side on desktop, toggle on mobile).        |

---

## 7. The four states

Every page and major component renders all four. Same resolution order:

```tsx
if (isPending) return <CarGridSkeleton />;
if (isError)   return <ErrorState onRetry={refetch} message={t("errors.load")} />;
if (!data?.length) return <EmptyState … />;
return <CarGrid vehicles={data} />;
```

- **Loading** → skeletons that match the final layout (car card grid, not a spinner).
- **Empty** → friendly, actionable. "No cars match your filters — clear filters" vs
  "No cars available yet".
- **Error** → human message + retry. Never a blank screen.
- **Success** → the content.

---

## 8. Status colours

Same enum → semantic token mapping as admin web. Labels come from i18n.

| Reservation | Token     |
| ----------- | --------- |
| `draft`     | `muted`   |
| `confirmed` | `info`    |
| `active`    | `success` |
| `completed` | neutral   |
| `cancelled` | `danger`  |

---

## 9. Car cards (first-class)

`CarCard` is the primary unit of the marketplace.

- **Photo area**: `aspect-video` or `aspect-[4/3]`, `rounded-xl overflow-hidden`.
  `next/image` with `fill` and `object-cover`. Fallback: placeholder with car icon.
- **Content**: brand + model (`font-semibold`), year + type (`text-muted-foreground`),
  specs badges (seats, transmission, fuel) using `Badge`.
- **Price**: prominent `text-lg font-semibold tabular-nums` + `/ day` label.
- **CTA**: "View details" ghost button or whole-card link with an explicit visible CTA.
- **Hover**: subtle `shadow-md` lift or `scale-[1.01]` transform.

---

## 10. Booking flow

The booking form is a **full page** (not a sheet/modal) with a two-column layout on
desktop: form on the left, summary on the right.

- Single column on mobile; summary collapses to a sticky summary bar at the bottom.
- react-hook-form + zod. One schema validates both client-side and maps API errors.
- All fields validated on blur + submit.
- Submit button: disabled + spinner while in flight; never double-submit.
- API errors (e.g. `reservation.overlap`) surface inline near the relevant field.
- On success: redirect to `/booking/[token]` (the confirmation/status page).

---

## 11. SEO & metadata

Every page exports a `generateMetadata` function:

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vehicle = await vehiclesApi.getById(params.companySlug, params.id);
  return {
    title: `${vehicle.brand} ${vehicle.model} — ${company.name}`,
    description:
      vehicle.description ?? `Rent a ${vehicle.brand} ${vehicle.model}`,
    openGraph: {
      title: `${vehicle.brand} ${vehicle.model}`,
      images: vehicle.photos[0] ? [vehicle.photos[0]] : [],
    },
  };
}
```

Car detail pages include `JSON-LD` structured data (`Product` schema).

---

## 12. Accessibility checklist

- [ ] Reachable and operable by keyboard; logical tab order.
- [ ] Visible focus ring on every interactive element.
- [ ] Semantic elements; ARIA only to fill gaps.
- [ ] `aria-label` on icon-only controls; meaningful `alt` on car photos.
- [ ] Color is never the only signal (pair status color with text/icon).
- [ ] Contrast ≥ WCAG AA in light and dark.
- [ ] `cursor-pointer` on clickable elements.
- [ ] Respect `prefers-reduced-motion`.
