"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, MapPin, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { SearchFieldSegment } from "./SearchFieldSegment";
import { Input } from "@/components/ui/Input";
import { filterBranchOptions, type BranchOption } from "@/lib/branchOptions";
import { cn } from "@/lib/utils";

interface BranchComboboxProps {
  label: string;
  value: string;
  options: BranchOption[];
  onChange: (branchId: string) => void;
  anyLabel?: string;
  anyHint?: string;
  loading?: boolean;
}

interface ListOption {
  id: string;
  title: string;
  detail: string;
}

export function BranchCombobox({
  label,
  value,
  options,
  onChange,
  anyLabel,
  anyHint,
  loading = false,
}: BranchComboboxProps) {
  const t = useTranslations("search");
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const listOptions = useMemo<ListOption[]>(() => {
    const branches = filterBranchOptions(options, query).map((option) => ({
      id: option.id,
      title: option.name,
      detail: [option.companyName, option.address].filter(Boolean).join(" · "),
    }));
    return anyLabel
      ? [{ id: "", title: anyLabel, detail: anyHint ?? "" }, ...branches]
      : branches;
  }, [options, query, anyLabel, anyHint]);

  const selected = options.find((option) => option.id === value);
  const selectedName = selected?.name ?? anyLabel ?? t("branchChoose");

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

  function select(id: string) {
    onChange(id);
    setOpen(false);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const last = Math.max(listOptions.length - 1, 0);
    const moves: Record<string, (index: number) => number> = {
      ArrowDown: (index) => Math.min(index + 1, last),
      ArrowUp: (index) => Math.max(index - 1, 0),
      Home: () => 0,
      End: () => last,
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      setHighlightedIndex(move);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const option = listOptions[highlightedIndex];
      if (option) {
        select(option.id);
      }
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <SearchFieldSegment
          icon={<MapPin size={16} aria-hidden />}
          label={label}
          value={selectedName}
          isActive={open}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={t("branchTrigger", { label, name: selectedName })}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          collisionPadding={16}
          className={cn(
            "z-50 w-[var(--radix-popover-trigger-width)] min-w-[min(100vw-1.5rem,20rem)] rounded-xl border border-border bg-surface p-2 shadow-md outline-none",
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
            placeholder={t("locationPlaceholder")}
            aria-label={t("locationPlaceholder")}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-activedescendant={
              listOptions[highlightedIndex]
                ? `${listId}-${highlightedIndex}`
                : undefined
            }
            role="combobox"
            aria-expanded={open}
            className="mb-2"
          />
          {loading ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              {t("branchLoading")}
            </p>
          ) : listOptions.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              {t("locationEmpty")}
            </p>
          ) : (
            <ul
              id={listId}
              role="listbox"
              aria-label={label}
              className="max-h-72 overflow-y-auto"
            >
              {listOptions.map((option, index) => {
                const isSelected = option.id === value;
                return (
                  <li
                    key={option.id || "any"}
                    id={`${listId}-${index}`}
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground",
                      index === highlightedIndex && "bg-surface-hover",
                    )}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => select(option.id)}
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
                      {option.id ? (
                        <MapPin size={16} aria-hidden />
                      ) : (
                        <Store size={16} aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate",
                          isSelected && "font-medium",
                        )}
                      >
                        {option.title}
                      </span>
                      {option.detail ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {option.detail}
                        </span>
                      ) : null}
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
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
