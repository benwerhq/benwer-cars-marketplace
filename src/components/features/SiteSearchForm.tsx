"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronDown, MapPin, Search, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { DateRangePopover } from "./DateRangePopover";
import { DriverAgeSelect } from "./DriverAgeSelect";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/SelectMenu";
import { Switch } from "@/components/ui/Switch";
import { SearchParams } from "@/enums";
import { parseDriverAge, sitePathFromHome, withSiteQuery } from "@/lib/site";
import type { SiteBranch } from "@/types/site";

interface SiteSearchFormProps {
  homeHref: string;
  branches: SiteBranch[];
  defaultFrom?: string;
  defaultTo?: string;
  defaultBranch?: string;
  preview?: string;
  edit?: boolean;
  disabled?: boolean;
  variant?: "default" | "hero";
  allowDifferentReturn?: boolean;
  defaultReturnBranch?: string;
}

export function SiteSearchForm({
  homeHref,
  branches,
  defaultFrom = "",
  defaultTo = "",
  defaultBranch = "",
  preview,
  edit = false,
  disabled = false,
  variant = "default",
  allowDifferentReturn = false,
  defaultReturnBranch = "",
}: SiteSearchFormProps) {
  const t = useTranslations("site");
  const router = useRouter();
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [branch, setBranch] = useState(defaultBranch);
  const [differentReturn, setDifferentReturn] = useState(Boolean(defaultReturnBranch));
  const [returnBranch, setReturnBranch] = useState(defaultReturnBranch);
  const searchParams = useSearchParams();
  const [driverAge, setDriverAge] = useState(() =>
    parseDriverAge(searchParams.get(SearchParams.DRIVER_AGE)),
  );

  function branchOptions(anyLabel: string): SelectMenuOption[] {
    return [
      { value: "", label: anyLabel, icon: <Store size={18} aria-hidden /> },
      ...branches.map((item) => ({
        value: item.id,
        label: item.name,
        description: item.address,
        icon: <MapPin size={18} aria-hidden />,
      })),
    ];
  }

  function branchLabel(id: string, anyLabel: string): string {
    return branches.find((item) => item.id === id)?.name ?? anyLabel;
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (disabled) {
      return;
    }

    router.push(
      withSiteQuery(sitePathFromHome(homeHref, "/search"), {
        from: from || undefined,
        to: to || undefined,
        branch: branch || undefined,
        returnBranch:
          allowDifferentReturn && differentReturn && returnBranch ? returnBranch : undefined,
        driverAge,
        preview,
        edit,
      }),
    );
  }

  if (variant === "hero") {
    const showReturnToggle = allowDifferentReturn && branches.length > 1;
    const locationSelect = (
      id: string,
      label: string,
      value: string,
      onChange: (next: string) => void,
      anyLabel: string,
    ) => (
      <SelectMenu
        id={id}
        value={value}
        onValueChange={onChange}
        options={branchOptions(anyLabel)}
        ariaLabel={label}
        triggerClassName="group flex min-w-0 items-center gap-3 rounded-2xl px-4 py-2.5 transition-colors hover:bg-surface-hover data-[state=open]:bg-surface-hover md:flex-1"
        contentClassName="w-[min(100vw-2rem,22rem)]"
      >
        <MapPin size={22} strokeWidth={1.5} className="shrink-0 text-subtle-foreground" aria-hidden />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="truncate text-base font-semibold text-foreground">
            {branchLabel(value, anyLabel)}
          </span>
        </span>
        <ChevronDown
          size={18}
          className="shrink-0 text-subtle-foreground transition-transform group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </SelectMenu>
    );

    return (
      <form
        onSubmit={onSubmit}
        className="flex flex-col rounded-[2rem] border border-border bg-surface shadow-xl"
        aria-label={t("searchAria")}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border px-5 py-2.5 md:px-6">
          {showReturnToggle ? (
            <label
              htmlFor="site-different-return"
              className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Switch
                id="site-different-return"
                checked={differentReturn}
                onCheckedChange={setDifferentReturn}
              />
              {t("differentReturn")}
            </label>
          ) : (
            <span aria-hidden />
          )}
          <DriverAgeSelect
            id="site-driver-age"
            value={driverAge}
            onChange={setDriverAge}
          />
        </div>
        <div className="flex flex-col gap-1 p-3 md:flex-row md:items-center md:gap-1 md:p-2.5 md:pl-3">
          {branches.length > 0 ? (
            <>
              {locationSelect("site-branch-hero", t("branch"), branch, setBranch, t("anyBranch"))}
              <span aria-hidden className="hidden w-px self-stretch bg-border md:my-2 md:block" />
            </>
          ) : null}
          {showReturnToggle && differentReturn ? (
            <>
              {locationSelect(
                "site-return-hero",
                t("returnBranch"),
                returnBranch,
                setReturnBranch,
                t("returnSame"),
              )}
              <span aria-hidden className="hidden w-px self-stretch bg-border md:my-2 md:block" />
            </>
          ) : null}
          <div className="min-w-0 md:flex-[1.6]">
            <DateRangePopover
              from={from}
              to={to}
              onChange={(next) => {
                setFrom(next.from);
                setTo(next.to);
              }}
            />
          </div>
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:ml-2 md:h-16 md:w-16 md:px-0"
          >
            <Search size={22} strokeWidth={2.25} aria-hidden />
            <span className="md:sr-only">{t("search")}</span>
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm md:flex-row md:items-end"
      aria-label={t("searchAria")}
    >
      <div className="min-w-0 flex-1">
        <DateRangePopover
          from={from}
          to={to}
          onChange={(next) => {
            setFrom(next.from);
            setTo(next.to);
          }}
        />
      </div>
      {branches.length > 0 ? (
        <Field label={t("branch")} htmlFor="site-branch" className="md:w-56">
          <SelectMenu
            id="site-branch"
            value={branch}
            onValueChange={setBranch}
            options={branchOptions(t("anyBranch"))}
            triggerClassName="group flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border-strong bg-surface px-3 text-sm text-foreground"
            contentClassName="w-[min(100vw-2rem,22rem)]"
          >
            <span className="truncate">{branchLabel(branch, t("anyBranch"))}</span>
            <ChevronDown
              size={16}
              className="shrink-0 text-subtle-foreground transition-transform group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </SelectMenu>
        </Field>
      ) : null}
      <Button type="submit" size="lg" className="h-11" disabled={disabled}>
        {t("search")}
      </Button>
    </form>
  );
}
