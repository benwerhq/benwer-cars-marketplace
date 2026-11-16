"use client";

import {
  countryMatchesQuery,
  cursorAfterDigits,
  dialCode,
  digitsBeforeCursor,
  formatNationalNumber,
  nationalDigits,
  parsePhoneValue,
  phoneCountryOptions,
  phoneValidity,
  toE164,
  DEFAULT_PHONE_COUNTRY,
  type PhoneValidity,
} from "@/lib/phone";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { cn } from "@/lib/utils";
import type { CountryCode } from "libphonenumber-js";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as Popover from "@radix-ui/react-popover";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

interface PhoneInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onValidityChange?: (validity: PhoneValidity) => void;
  defaultCountry?: CountryCode;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  placeholder?: string;
  autoComplete?: string;
}

export function PhoneInput({
  id,
  name,
  value,
  onChange,
  onValidityChange,
  defaultCountry = DEFAULT_PHONE_COUNTRY,
  disabled = false,
  required = false,
  error,
  className,
  placeholder,
  autoComplete = "tel-national",
}: PhoneInputProps) {
  const t = useTranslations();
  const locale = useLocale();
  const baseId = useId();
  const inputId = id ?? `${baseId}-number`;
  const listId = `${baseId}-countries`;
  const errorId = `${baseId}-error`;
  const searchRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const onValidityRef = useRef(onValidityChange);
  const emittedRef = useRef<string | null>(null);
  const cursorRef = useRef<number | null>(null);
  const [lastEmitted, setLastEmitted] = useState<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
    onValidityRef.current = onValidityChange;
  }, [onChange, onValidityChange]);

  const options = useMemo(() => phoneCountryOptions(locale), [locale]);
  const initial = parsePhoneValue(value, defaultCountry);
  const [country, setCountry] = useState(initial.country);
  const [national, setNational] = useState(initial.national);
  const [touched, setTouched] = useState(
    () => initial.national !== "" && initial.e164 === "",
  );
  const [trackedValue, setTrackedValue] = useState(value);
  const [trackedCountry, setTrackedCountry] = useState(defaultCountry);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);

  function remember(e164: string) {
    emittedRef.current = e164;
    setLastEmitted(e164);
  }

  if (trackedValue !== value) {
    const incoming = parsePhoneValue(value, defaultCountry);
    const echo =
      lastEmitted === value ||
      (incoming.e164 !== "" && lastEmitted === incoming.e164);
    setTrackedValue(value);
    if (!echo) {
      setCountry(incoming.country);
      setNational(incoming.national);
      if (!incoming.e164 && value.trim()) setTouched(true);
    }
  }

  if (trackedCountry !== defaultCountry) {
    setTrackedCountry(defaultCountry);
    if (!value.trim() && !nationalDigits(national)) {
      setCountry(defaultCountry);
    }
  }

  const filtered = useMemo(
    () => options.filter((option) => countryMatchesQuery(option, search)),
    [options, search],
  );
  const activeIndex = Math.min(active, Math.max(filtered.length - 1, 0));
  const activeOption = filtered[activeIndex];
  const selected = options.find((option) => option.country === country);
  const status = phoneValidity(country, national);
  const invalidText = t("phoneInput.invalid");
  const visibleError =
    error || (touched && status === "invalid" ? invalidText : undefined);

  function publish(nextCountry: CountryCode, nextNational: string) {
    const e164 = toE164(nextCountry, nextNational);
    remember(e164);
    onChangeRef.current(e164);
    onValidityRef.current?.(phoneValidity(nextCountry, nextNational));
  }

  useEffect(() => {
    const localStatus = phoneValidity(country, national);
    if (!value.trim() && localStatus === "invalid") {
      onValidityRef.current?.("invalid");
      return;
    }
    const incoming = parsePhoneValue(value, defaultCountry);
    onValidityRef.current?.(phoneValidity(incoming.country, incoming.national));
    if (
      !incoming.e164 ||
      incoming.e164 === value ||
      emittedRef.current === incoming.e164
    ) {
      return;
    }
    emittedRef.current = incoming.e164;
    setLastEmitted(incoming.e164);
    onChangeRef.current(incoming.e164);
  }, [country, defaultCountry, national, value]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    const cursor = cursorRef.current;
    if (!input || cursor === null || document.activeElement !== input) return;
    input.setSelectionRange(cursor, cursor);
    cursorRef.current = null;
  }, [national]);

  useLayoutEffect(() => {
    inputRef.current?.setCustomValidity(status === "invalid" ? invalidText : "");
  }, [status, invalidText]);

  function handleNationalChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    setTouched(true);
    if (raw.trim().startsWith("+")) {
      const parsed = parsePhoneValue(raw, country);
      cursorRef.current = parsed.national.length;
      setCountry(parsed.country);
      setNational(parsed.national);
      publish(parsed.country, parsed.national);
      return;
    }
    const formatted = formatNationalNumber(country, raw);
    cursorRef.current = cursorAfterDigits(
      formatted,
      digitsBeforeCursor(raw, event.target.selectionStart ?? raw.length),
    );
    setNational(formatted);
    publish(country, formatted);
  }

  function choose(next: CountryCode) {
    const formatted = formatNationalNumber(next, national);
    setCountry(next);
    setNational(formatted);
    setTouched(true);
    publish(next, formatted);
    setOpen(false);
    setSearch("");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setSearch("");
      return;
    }
    const index = options.findIndex((option) => option.country === country);
    setActive(index >= 0 ? index : 0);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(Math.min(activeIndex + 1, Math.max(filtered.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActive(Math.max(filtered.length - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (activeOption) choose(activeOption.country);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setSearch("");
    }
  }

  useEffect(() => {
    if (!open || !activeOption) return;
    document
      .getElementById(`${baseId}-option-${activeOption.country}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeOption, baseId, open]);

  const countryLabel = t("phoneInput.countryCodeValue", {
    country: selected?.name ?? country,
    dial: dialCode(country),
  });

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex min-w-0 items-stretch gap-2">
        <Popover.Root open={open} onOpenChange={handleOpenChange}>
          <Popover.Trigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-label={countryLabel}
              aria-expanded={open}
              aria-controls={listId}
              aria-haspopup="listbox"
              className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border-strong bg-background px-2.5 text-sm text-foreground hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CountryFlag country={country} name={selected?.name ?? country} />
              <span>{dialCode(country)}</span>
              <ChevronDown
                size={14}
                className="text-muted-foreground"
                aria-hidden
              />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={4}
              className="z-[80] w-72 rounded-md border border-border bg-surface p-2 text-foreground shadow-lg"
              onOpenAutoFocus={(event) => {
                event.preventDefault();
                searchRef.current?.focus();
              }}
            >
              <input
                ref={searchRef}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setActive(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={t("phoneInput.search")}
                aria-label={t("phoneInput.search")}
                aria-controls={listId}
                aria-activedescendant={
                  activeOption
                    ? `${baseId}-option-${activeOption.country}`
                    : undefined
                }
                autoComplete="off"
                className="mb-2 h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground placeholder:text-subtle-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div
                id={listId}
                role="listbox"
                aria-label={t("phoneInput.countries")}
                className="max-h-64 overflow-y-auto"
              >
                {filtered.length === 0 ? (
                  <p className="px-2 py-1.5 text-sm text-muted-foreground">
                    {t("phoneInput.noResults")}
                  </p>
                ) : (
                  filtered.map((option, index) => (
                    <button
                      key={option.country}
                      id={`${baseId}-option-${option.country}`}
                      type="button"
                      role="option"
                      aria-selected={option.country === country}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => choose(option.country)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                        index === activeIndex && "bg-surface-muted",
                      )}
                    >
                      <CountryFlag country={option.country} name={option.name} />
                      <span className="min-w-0 flex-1 truncate">
                        {option.name}
                      </span>
                      <span className="text-muted-foreground">
                        {option.dialCode}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete={autoComplete}
          disabled={disabled}
          aria-required={required || undefined}
          aria-invalid={visibleError ? true : undefined}
          aria-describedby={visibleError ? errorId : undefined}
          value={national}
          placeholder={placeholder ?? t("phoneInput.placeholder")}
          onChange={handleNationalChange}
          onBlur={() => setTouched(true)}
          onInvalid={(event) => {
            event.preventDefault();
            setTouched(true);
          }}
          className={cn(
            "h-11 min-w-0 flex-1 rounded-md border border-border-strong bg-surface px-3 text-sm text-foreground placeholder:text-subtle-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:focus-visible:ring-danger",
            className,
          )}
        />
      </div>
      {visibleError ? (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {visibleError}
        </p>
      ) : null}
    </div>
  );
}
