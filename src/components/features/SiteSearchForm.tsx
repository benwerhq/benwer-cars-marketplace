"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { DateRangePopover } from "./DateRangePopover";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { siteSearchPath, withSiteQuery } from "@/lib/site";
import type { SiteBranch } from "@/types/site";

interface SiteSearchFormProps {
  slug: string;
  branches: SiteBranch[];
  defaultFrom?: string;
  defaultTo?: string;
  defaultBranch?: string;
  preview?: string;
  disabled?: boolean;
}

export function SiteSearchForm({
  slug,
  branches,
  defaultFrom = "",
  defaultTo = "",
  defaultBranch = "",
  preview,
  disabled = false,
}: SiteSearchFormProps) {
  const t = useTranslations("site");
  const router = useRouter();
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [branch, setBranch] = useState(defaultBranch);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (disabled) {
      return;
    }

    router.push(
      withSiteQuery(siteSearchPath(slug), {
        from: from || undefined,
        to: to || undefined,
        branch: branch || undefined,
        preview,
      }),
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
          <select
            id="site-branch"
            value={branch}
            onChange={(event) => setBranch(event.target.value)}
            className="flex h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{t("anyBranch")}</option>
            {branches.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      <Button type="submit" size="lg" className="h-11" disabled={disabled}>
        {t("search")}
      </Button>
    </form>
  );
}
