"use client";

import type { ReactNode } from "react";
import * as Select from "@radix-ui/react-select";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const EMPTY_VALUE = "__empty__";

export interface SelectMenuOption {
  value: string;
  label: string;
  description?: string | null;
  icon?: ReactNode;
}

interface SelectMenuProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectMenuOption[];
  children: ReactNode;
  ariaLabel?: string;
  triggerClassName?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  disabled?: boolean;
}

function toRadix(value: string): string {
  return value === "" ? EMPTY_VALUE : value;
}

function fromRadix(value: string): string {
  return value === EMPTY_VALUE ? "" : value;
}

export function SelectMenu({
  id,
  value,
  onValueChange,
  options,
  children,
  ariaLabel,
  triggerClassName,
  contentClassName,
  align = "start",
  disabled = false,
}: SelectMenuProps) {
  return (
    <Select.Root
      value={toRadix(value)}
      onValueChange={(next) => onValueChange(fromRadix(next))}
      disabled={disabled}
    >
      <Select.Trigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          "cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName,
        )}
      >
        {children}
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          align={align}
          sideOffset={8}
          collisionPadding={16}
          className={cn(
            "z-50 max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-xl",
            contentClassName,
          )}
        >
          <Select.Viewport className="flex flex-col gap-0.5">
            {options.map((option) => (
              <Select.Item
                key={option.value || EMPTY_VALUE}
                value={toRadix(option.value)}
                className={cn(
                  "group relative flex cursor-pointer select-none items-center gap-3 rounded-xl py-2.5 pr-10 pl-3 text-sm text-foreground outline-none",
                  "data-[highlighted]:bg-surface-hover data-[state=checked]:bg-primary/10",
                )}
              >
                {option.icon ? (
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground group-data-[state=checked]:bg-primary/15 group-data-[state=checked]:text-primary">
                    {option.icon}
                  </span>
                ) : null}
                <span className="flex min-w-0 flex-col">
                  <Select.ItemText>
                    <span className="font-medium">{option.label}</span>
                  </Select.ItemText>
                  {option.description ? (
                    <span className="truncate text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  ) : null}
                </span>
                <Select.ItemIndicator className="absolute right-3 inline-flex text-primary">
                  <Check size={16} strokeWidth={2.5} aria-hidden />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
