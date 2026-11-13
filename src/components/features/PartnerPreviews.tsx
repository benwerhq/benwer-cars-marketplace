import {
  BatteryFull,
  CalendarDays,
  Car,
  CarFront,
  Check,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  ScanLine,
  Search,
  Signal,
  Wifi,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

const DAYS = 14;
const SHADOW =
  "shadow-[0_24px_50px_-28px_color-mix(in_oklab,var(--foreground)_45%,transparent)]";

type BookingSource = "direct" | "benwer";

interface FleetRow {
  car: "carA" | "carB" | "carC" | "carD" | "carE" | "carF";
  plate: string;
  bookings: { start: number; length: number; source: BookingSource }[];
}

const FLEET: FleetRow[] = [
  {
    car: "carA",
    plate: "4821 LKP",
    bookings: [
      { start: 1, length: 4, source: "direct" },
      { start: 6, length: 3, source: "benwer" },
      { start: 11, length: 4, source: "direct" },
    ],
  },
  {
    car: "carB",
    plate: "7390 MBD",
    bookings: [
      { start: 2, length: 5, source: "benwer" },
      { start: 9, length: 3, source: "direct" },
    ],
  },
  {
    car: "carC",
    plate: "1156 KTR",
    bookings: [
      { start: 1, length: 3, source: "direct" },
      { start: 5, length: 6, source: "direct" },
      { start: 12, length: 3, source: "benwer" },
    ],
  },
  {
    car: "carD",
    plate: "9043 LZF",
    bookings: [
      { start: 3, length: 4, source: "benwer" },
      { start: 8, length: 5, source: "direct" },
    ],
  },
  {
    car: "carE",
    plate: "3378 LHN",
    bookings: [
      { start: 1, length: 2, source: "direct" },
      { start: 4, length: 4, source: "direct" },
      { start: 9, length: 4, source: "benwer" },
    ],
  },
  {
    car: "carF",
    plate: "6612 MCV",
    bookings: [
      { start: 2, length: 3, source: "direct" },
      { start: 6, length: 5, source: "benwer" },
      { start: 12, length: 3, source: "direct" },
    ],
  },
];

function WindowDots() {
  return (
    <span className="flex gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
    </span>
  );
}

export async function AdminCalendarPreview() {
  const t = await getTranslations("whatYouGet.preview");
  const nav = [
    { icon: LayoutDashboard, label: t("navDashboard") },
    { icon: Car, label: t("navFleet") },
    { icon: CalendarDays, label: t("navCalendar"), active: true },
    { icon: ClipboardList, label: t("navReservations") },
  ];
  const kpis = [
    { value: t("utilisationValue"), label: t("utilisation") },
    { value: t("pickupsValue"), label: t("pickups") },
    { value: t("revenueValue"), label: t("revenue") },
  ];
  const sourceLabel = (source: BookingSource) =>
    source === "benwer" ? t("viaBenwer") : t("direct");

  return (
    <div
      aria-hidden
      className={cn("overflow-hidden rounded-2xl border border-border bg-surface", SHADOW)}
    >
      <div className="flex items-center gap-3 border-b border-border bg-surface-muted px-3 py-2">
        <WindowDots />
        <span className="mx-auto truncate rounded-md bg-surface px-3 py-0.5 text-[11px] text-muted-foreground">
          {t("adminDomain")}
        </span>
      </div>
      <div className="grid sm:grid-cols-[8.5rem_1fr]">
        <nav className="hidden flex-col gap-0.5 border-r border-border p-2 sm:flex">
          {nav.map(({ icon: Icon, label, active }) => (
            <span
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                active
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground",
              )}
            >
              <Icon size={14} />
              <span className="truncate">{label}</span>
            </span>
          ))}
        </nav>
        <div className="flex min-w-0 flex-col gap-3 p-3">
          <div className="grid grid-cols-3 gap-2">
            {kpis.map(({ value, label }) => (
              <div key={label} className="min-w-0 rounded-lg border border-border p-2">
                <span className="block text-base font-bold text-foreground tabular-nums">
                  {value}
                </span>
                <span className="block text-[11px] leading-tight text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-foreground">
              {t("calendarTitle")} · {t("calendarMonth")}
            </span>
            <span className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-primary" />
                {t("viaBenwer")}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-primary/20" />
                {t("direct")}
              </span>
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-[4.75rem_1fr] items-end gap-2">
              <span />
              <div className="grid grid-cols-14 text-center text-[9px] text-subtle-foreground tabular-nums">
                {Array.from({ length: DAYS }, (_, index) => (
                  <span key={index}>{index + 7}</span>
                ))}
              </div>
            </div>
            {FLEET.map(({ car, plate, bookings }) => (
              <div key={plate} className="grid grid-cols-[4.75rem_1fr] items-center gap-2">
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-semibold text-foreground">
                    {t(car)}
                  </span>
                  <span className="block font-mono text-[9px] text-subtle-foreground">
                    {plate}
                  </span>
                </span>
                <div className="grid h-6 grid-cols-14 gap-px rounded-md bg-surface-muted p-px">
                  {bookings.map(({ start, length, source }) => (
                    <span
                      key={start}
                      style={{ gridColumn: `${start} / span ${length}` }}
                      className={cn(
                        "flex min-w-0 items-center overflow-hidden rounded px-1 text-[9px] font-semibold whitespace-nowrap",
                        source === "benwer"
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/20 text-primary",
                      )}
                    >
                      <span className="hidden truncate sm:block">{sourceLabel(source)}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function StaffPhonePreview({ className }: { className?: string }) {
  const t = await getTranslations("whatYouGet.preview");
  const jobs = [
    { car: t("carB"), plate: "7390 MBD", time: "09:30", kind: t("pickUp"), done: true },
    { car: t("carD"), plate: "9043 LZF", time: "11:00", kind: t("return"), done: false },
    { car: t("carA"), plate: "4821 LKP", time: "13:15", kind: t("pickUp"), done: false },
  ];
  const tabs = [
    { icon: CalendarDays, label: t("tabToday"), active: true },
    { icon: ScanLine, label: t("tabScan") },
    { icon: Car, label: t("tabFleet") },
  ];

  return (
    <div
      aria-hidden
      className={cn(
        "w-52 rounded-[2rem] border border-border-strong bg-foreground p-1.5",
        SHADOW,
        className,
      )}
    >
      <div className="relative flex h-80 flex-col overflow-hidden rounded-[1.6rem] bg-background">
        <span className="absolute top-1.5 left-1/2 h-4 w-14 -translate-x-1/2 rounded-full bg-foreground" />
        <div className="flex items-center justify-between px-4 pt-2 text-[9px] font-semibold text-foreground">
          <span className="tabular-nums">9:41</span>
          <span className="flex items-center gap-0.5">
            <Signal size={9} />
            <Wifi size={9} />
            <BatteryFull size={11} />
          </span>
        </div>
        <div className="px-3 pt-4">
          <p className="text-sm font-bold text-foreground">{t("phoneTitle")}</p>
          <p className="text-[10px] text-muted-foreground">{t("phoneDate")}</p>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 px-2.5 pt-2.5">
          {jobs.map(({ car, plate, time, kind, done }) => (
            <div
              key={plate}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2"
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                  done ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
                )}
              >
                {done ? <Check size={13} strokeWidth={3} /> : <CarFront size={13} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-semibold text-foreground">
                  {car}
                </span>
                <span className="block truncate text-[9px] text-muted-foreground">
                  {done ? t("checkedOut") : `${kind} · ${plate}`}
                </span>
              </span>
              <span className="shrink-0 text-[10px] font-semibold text-foreground tabular-nums">
                {time}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 border-t border-border bg-surface px-2 pt-1.5 pb-3">
          {tabs.map(({ icon: Icon, label, active }) => (
            <span
              key={label}
              className={cn(
                "flex flex-col items-center gap-0.5 text-[8px]",
                active ? "font-semibold text-primary" : "text-subtle-foreground",
              )}
            >
              <Icon size={12} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function StorefrontPreview({ className }: { className?: string }) {
  const t = await getTranslations("whatYouGet.preview");
  const cars = [t("carA"), t("carC")];

  return (
    <div
      aria-hidden
      className={cn(
        "w-full max-w-80 overflow-hidden rounded-xl border border-border bg-surface",
        SHADOW,
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-surface-muted px-2.5 py-1.5">
        <WindowDots />
        <span className="truncate rounded bg-surface px-2 py-0.5 text-[10px] text-muted-foreground">
          {t("domain")}
        </span>
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-primary text-primary-foreground">
            <Car size={10} />
          </span>
          {t("storeName")}
        </span>
        <span className="flex gap-2 text-[10px] text-muted-foreground">
          <span>{t("storeNavCars")}</span>
          <span>{t("storeNavContact")}</span>
        </span>
      </div>
      <div className="mx-2 rounded-lg bg-gradient-to-br from-primary to-promo px-3 py-3">
        <p className="text-xs font-bold text-primary-foreground">{t("storeHeadline")}</p>
        <div className="mt-2 flex items-center gap-1.5 rounded-md bg-surface p-1 pl-2">
          <MapPin size={10} className="text-primary" />
          <span className="flex-1 truncate text-[10px] text-muted-foreground">
            {t("storeSearch")}
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground">
            <Search size={9} />
            {t("storeSearchCta")}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-2">
        {cars.map((car) => (
          <div key={car} className="rounded-lg border border-border p-1.5">
            <span className="flex h-10 items-center justify-center rounded-md bg-surface-muted text-subtle-foreground">
              <CarFront size={18} />
            </span>
            <span className="mt-1 block truncate text-[10px] font-semibold text-foreground">
              {car}
            </span>
            <span className="block text-[9px] font-semibold text-primary">
              {t("storePrice")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
