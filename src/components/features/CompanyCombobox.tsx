"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Building2, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { CompanyLogo } from "./CompanyLogo";
import { SearchFieldSegment } from "./SearchFieldSegment";
import { Input } from "@/components/ui/Input";
import type { Company } from "@/types/company";
import { cn } from "@/lib/utils";

interface CompanyComboboxProps {
  value?: string;
  companies: Company[];
  onChange: (slug: string | undefined) => void;
}

export function CompanyCombobox({
  value,
  companies,
  onChange,
}: CompanyComboboxProps) {
  const t = useTranslations("cars");
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selected = companies.find((company) => company.slug === value) ?? null;
  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return companies;
    }

    return companies.filter((company) =>
      company.name.toLowerCase().includes(normalized),
    );
  }, [companies, query]);

  useEffect(() => {
    optionRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setQuery("");
      setHighlightedIndex(0);
    }
  }

  function selectCompany(slug: string | undefined) {
    onChange(slug);
    setOpen(false);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const optionCount = matches.length + 1;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.min(index + 1, optionCount - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (highlightedIndex === 0) {
        selectCompany(undefined);
        return;
      }
      const company = matches[highlightedIndex - 1];
      if (company) {
        selectCompany(company.slug);
      }
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <SearchFieldSegment
          icon={<Building2 size={16} aria-hidden />}
          label={t("filters.company")}
          value={selected?.name ?? t("allCompanies")}
          isActive={open}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={t("companyTrigger", {
            company: selected?.name ?? t("allCompanies"),
          })}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          collisionPadding={16}
          className={cn(
            "z-50 w-[var(--radix-popover-trigger-width)] min-w-[min(100vw-1.5rem,18rem)] rounded-xl border border-border bg-surface p-2 shadow-md outline-none",
            "max-md:w-[min(100vw-1.5rem,var(--radix-popover-trigger-width))]",
          )}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={t("companyPlaceholder")}
            aria-label={t("companyPlaceholder")}
            aria-autocomplete="list"
            aria-controls={listId}
            role="combobox"
            aria-expanded={open}
            className="mb-2"
          />
          <ul
            id={listId}
            role="listbox"
            aria-label={t("filters.company")}
            className="max-h-64 overflow-y-auto"
          >
            <li
              ref={(node) => {
                optionRefs.current[0] = node;
              }}
              role="option"
              aria-selected={!value}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-sm",
                highlightedIndex === 0 && "bg-surface-hover",
                !value ? "font-medium text-foreground" : "text-foreground",
              )}
              onMouseEnter={() => setHighlightedIndex(0)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectCompany(undefined)}
            >
              <span>{t("allCompanies")}</span>
              {!value ? (
                <Check
                  size={16}
                  className="shrink-0 text-primary"
                  aria-hidden
                />
              ) : null}
            </li>
            {matches.map((company, index) => {
              const optionIndex = index + 1;
              const isSelected = company.slug === value;
              const isHighlighted = optionIndex === highlightedIndex;

              return (
                <li
                  key={company.slug}
                  ref={(node) => {
                    optionRefs.current[optionIndex] = node;
                  }}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "flex cursor-pointer items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-sm",
                    isHighlighted && "bg-surface-hover",
                    isSelected && "font-medium text-foreground",
                    !isSelected && "text-foreground",
                  )}
                  onMouseEnter={() => setHighlightedIndex(optionIndex)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectCompany(company.slug)}
                >
                  <span className="flex min-w-0 flex-col items-start gap-2">
                    <CompanyLogo company={company} className="max-w-full" />
                    <span className="truncate">{company.name}</span>
                  </span>
                  {isSelected ? (
                    <Check
                      size={16}
                      className="shrink-0 text-primary"
                      aria-hidden
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
