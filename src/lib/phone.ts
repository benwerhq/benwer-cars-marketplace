import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isSupportedCountry,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

export const DEFAULT_PHONE_COUNTRY: CountryCode = "ES";

export const PHONE_INVALID_CODE = "validation.phone_invalid";

export type PhoneValidity = "empty" | "valid" | "invalid";

export type PhoneParts = {
  country: CountryCode;
  national: string;
  e164: string;
};

export type PhoneCountryOption = {
  country: CountryCode;
  name: string;
  dialCode: string;
};

export function nationalDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function phoneCountryOf(code: string | null | undefined): CountryCode {
  const normalized = code?.trim().toUpperCase() ?? "";
  if (isSupportedCountry(normalized)) return normalized;
  return DEFAULT_PHONE_COUNTRY;
}

export function dialCode(country: CountryCode): string {
  return `+${getCountryCallingCode(country)}`;
}

export function formatNationalNumber(
  country: CountryCode,
  value: string,
): string {
  const digits = nationalDigits(value);
  if (!digits) return "";
  return new AsYouType(country).input(digits);
}

export function digitsBeforeCursor(value: string, cursor: number): number {
  return nationalDigits(value.slice(0, Math.max(0, cursor))).length;
}

export function cursorAfterDigits(formatted: string, digitCount: number): number {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < formatted.length; index += 1) {
    const char = formatted[index];
    if (char && /\d/.test(char)) {
      seen += 1;
      if (seen === digitCount) return index + 1;
    }
  }
  return formatted.length;
}

export function toE164(country: CountryCode, national: string): string {
  const digits = nationalDigits(national);
  if (!digits) return "";
  const parsed = parsePhoneNumberFromString(digits, country);
  if (!parsed?.isValid()) return "";
  return parsed.number;
}

export function parsePhoneValue(
  value: string | null | undefined,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY,
): PhoneParts {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return { country: defaultCountry, national: "", e164: "" };
  }

  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);
  if (!parsed) {
    return {
      country: defaultCountry,
      national: formatNationalNumber(defaultCountry, trimmed),
      e164: "",
    };
  }

  const country = parsed.country ?? defaultCountry;
  if (parsed.isValid()) {
    return {
      country,
      national: parsed.formatNational(),
      e164: parsed.number,
    };
  }

  return {
    country,
    national: formatNationalNumber(country, parsed.nationalNumber || trimmed),
    e164: "",
  };
}

export function storedPhone(
  value: string | null | undefined,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY,
): string {
  return parsePhoneValue(value, defaultCountry).e164;
}

export function phoneValidity(
  country: CountryCode,
  national: string,
): PhoneValidity {
  if (!nationalDigits(national)) return "empty";
  return toE164(country, national) ? "valid" : "invalid";
}

export function phoneValidityOfStored(
  value: string | null | undefined,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY,
): PhoneValidity {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "empty";
  return storedPhone(trimmed, defaultCountry) ? "valid" : "invalid";
}

export function phoneCountryOptions(locale: string): PhoneCountryOption[] {
  const names = new Intl.DisplayNames([locale], { type: "region" });
  return getCountries()
    .map((country) => ({
      country,
      name: names.of(country) ?? country,
      dialCode: dialCode(country),
    }))
    .sort((left, right) => left.name.localeCompare(right.name, locale));
}

export function countryMatchesQuery(
  option: PhoneCountryOption,
  query: string,
): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  const compact = trimmed.replace(/\s/g, "");
  const digits = trimmed.replace(/\D/g, "");
  return (
    option.name.toLowerCase().includes(trimmed) ||
    option.country.toLowerCase().includes(trimmed) ||
    option.dialCode.toLowerCase().includes(compact) ||
    (digits.length > 0 && option.dialCode.includes(digits))
  );
}

export function phoneInvalidErrorCode(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; fieldErrors?: unknown };
  if (candidate.code === PHONE_INVALID_CODE) return true;
  if (!Array.isArray(candidate.fieldErrors)) return false;
  return candidate.fieldErrors.some(
    (item) =>
      !!item &&
      typeof item === "object" &&
      "code" in item &&
      item.code === PHONE_INVALID_CODE,
  );
}
