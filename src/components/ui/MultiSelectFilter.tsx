"use client";

import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface MultiSelectFilterOption<T extends string> {
  value: T;
  label: string;
}

interface MultiSelectFilterProps<T extends string> {
  label: string;
  options: MultiSelectFilterOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  className?: string;
}

export function MultiSelectFilter<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: Readonly<MultiSelectFilterProps<T>>) {
  const t = useTranslations("cars.filters");
  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);
  const summary =
    selectedLabels.length === 0
      ? t("all")
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : t("selectedCount", { count: selectedLabels.length });
  const active = value.length > 0;

  function toggle(optionValue: T) {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={`${label}: ${summary}`}
          className={cn(
            "inline-flex min-h-11 max-w-full cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors md:min-h-9",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            active
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-surface text-foreground hover:border-border-strong hover:bg-surface-hover",
            className,
          )}
        >
          <span className="text-muted-foreground">{label}:</span>
          <span className="max-w-40 truncate font-medium">{summary}</span>
          <ChevronDown
            size={14}
            className="shrink-0 text-muted-foreground"
            aria-hidden
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          collisionPadding={16}
          className="z-50 max-h-80 min-w-[max(var(--radix-popover-trigger-width),12rem)] overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 text-foreground shadow-xl"
        >
          <div role="group" aria-label={label}>
            {options.map((option) => {
              const selected = value.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  onClick={() => toggle(option.value)}
                  className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 text-left text-sm hover:bg-surface-hover focus:bg-surface-hover focus:outline-none md:min-h-9"
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border-strong",
                    )}
                  >
                    {selected ? <Check size={12} aria-hidden /> : null}
                  </span>
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
          {active ? (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-1 w-full cursor-pointer rounded-xl border-t border-border px-2.5 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            >
              {t("clear")}
            </button>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
