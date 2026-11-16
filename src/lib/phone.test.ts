import { describe, expect, it } from "vitest";
import {
  PHONE_INVALID_CODE,
  countryMatchesQuery,
  cursorAfterDigits,
  dialCode,
  digitsBeforeCursor,
  formatNationalNumber,
  parsePhoneValue,
  phoneCountryOf,
  phoneCountryOptions,
  phoneInvalidErrorCode,
  phoneValidity,
  phoneValidityOfStored,
  storedPhone,
  toE164,
} from "./phone";

describe("parsePhoneValue", () => {
  it("uses Spain when the value is empty", () => {
    expect(parsePhoneValue("  ")).toEqual({
      country: "ES",
      national: "",
      e164: "",
    });
  });

  it("parses an E.164 number into its country and national format", () => {
    expect(parsePhoneValue("+34600111222")).toEqual({
      country: "ES",
      national: "600 11 12 22",
      e164: "+34600111222",
    });
    expect(parsePhoneValue("+442079460958")).toEqual({
      country: "GB",
      national: "020 7946 0958",
      e164: "+442079460958",
    });
  });

  it("parses a national number with the default country", () => {
    expect(parsePhoneValue("600 111 222")).toEqual({
      country: "ES",
      national: "600 11 12 22",
      e164: "+34600111222",
    });
  });

  it("parses a national number with an explicit company country", () => {
    expect(parsePhoneValue("912 345 678", "PT")).toEqual({
      country: "PT",
      national: "912 345 678",
      e164: "+351912345678",
    });
  });

  it("keeps an incomplete number without inventing an E.164 value", () => {
    expect(parsePhoneValue("699")).toEqual({
      country: "ES",
      national: "699",
      e164: "",
    });
  });

  it("drops text that contains no digits", () => {
    expect(parsePhoneValue("call me")).toEqual({
      country: "ES",
      national: "",
      e164: "",
    });
  });
});

describe("storedPhone and validity", () => {
  it("returns E.164 only for a valid number", () => {
    expect(storedPhone("600123456")).toBe("+34600123456");
    expect(storedPhone("+34600123456")).toBe("+34600123456");
    expect(storedPhone("699")).toBe("");
    expect(storedPhone(null)).toBe("");
  });

  it("formats national digits as the user types", () => {
    expect(formatNationalNumber("ES", "60011")).toBe("600 11");
    expect(formatNationalNumber("ES", "")).toBe("");
    expect(toE164("ES", "600 11 12 22")).toBe("+34600111222");
    expect(toE164("ES", "600")).toBe("");
  });

  it("classifies empty, valid and invalid numbers", () => {
    expect(phoneValidity("ES", "")).toBe("empty");
    expect(phoneValidity("ES", "600 11 12 22")).toBe("valid");
    expect(phoneValidity("ES", "699")).toBe("invalid");
    expect(phoneValidityOfStored("")).toBe("empty");
    expect(phoneValidityOfStored(null)).toBe("empty");
    expect(phoneValidityOfStored(undefined)).toBe("empty");
    expect(phoneValidityOfStored("600111222")).toBe("valid");
    expect(phoneValidityOfStored("12")).toBe("invalid");
  });
});

describe("country metadata", () => {
  it("falls back to Spain for an unknown company country", () => {
    expect(phoneCountryOf("PT")).toBe("PT");
    expect(phoneCountryOf("pt")).toBe("PT");
    expect(phoneCountryOf("Spain")).toBe("ES");
    expect(phoneCountryOf(null)).toBe("ES");
  });

  it("builds a dial code without a network request", () => {
    expect(dialCode("ES")).toBe("+34");
    expect(dialCode("PT")).toBe("+351");
  });

  it("lists countries in the active language and filters them", () => {
    const options = phoneCountryOptions("en-GB");
    const spain = options.find((option) => option.country === "ES");
    const names = options.map((option) => option.name);

    expect(spain).toMatchObject({ name: "Spain", dialCode: "+34" });
    expect(names).toEqual([...names].sort((left, right) => left.localeCompare(right, "en-GB")));
    expect(options.filter((option) => countryMatchesQuery(option, "port")).map((option) => option.country)).toContain("PT");
    expect(options.filter((option) => countryMatchesQuery(option, "+351")).map((option) => option.country)).toContain("PT");
    expect(options.filter((option) => countryMatchesQuery(option, "351")).map((option) => option.country)).toContain("PT");
    expect(countryMatchesQuery(spain!, "   ")).toBe(true);
  });

  it("uses the country code when a region name is unavailable", () => {
    const mutableIntl = Intl as { DisplayNames: typeof Intl.DisplayNames };
    const Original = mutableIntl.DisplayNames;
    mutableIntl.DisplayNames = class {
      of() {
        return undefined;
      }
    } as unknown as typeof Intl.DisplayNames;

    try {
      expect(phoneCountryOptions("en-GB").find((option) => option.country === "ES")?.name).toBe("ES");
    } finally {
      mutableIntl.DisplayNames = Original;
    }
  });

  it("maps a caret to the formatted national number", () => {
    expect(digitsBeforeCursor("600 11", 5)).toBe(4);
    expect(cursorAfterDigits("600 11 12 22", 4)).toBe(5);
    expect(cursorAfterDigits("600 11 12 22", 0)).toBe(0);
    expect(cursorAfterDigits("600", 9)).toBe(3);
  });
});

describe("phoneInvalidErrorCode", () => {
  it("recognises the API code on the problem and on a field error", () => {
    expect(phoneInvalidErrorCode(null)).toBe(false);
    expect(phoneInvalidErrorCode(new Error("nope"))).toBe(false);
    expect(phoneInvalidErrorCode({ code: PHONE_INVALID_CODE })).toBe(true);
    expect(
      phoneInvalidErrorCode({
        code: "customers.duplicate",
        fieldErrors: [{ field: "phone", code: PHONE_INVALID_CODE }],
      }),
    ).toBe(true);
    expect(phoneInvalidErrorCode({ fieldErrors: [{ code: "other" }] })).toBe(false);
    expect(phoneInvalidErrorCode({ fieldErrors: "nope" })).toBe(false);
  });
});

describe("parsePhoneValue without a calling country", () => {
  it("falls back to the default country for a non-geographic number", () => {
    const parsed = parsePhoneValue("+800 1234 5678", "ES");
    expect(parsed.country).toBe("ES");
    expect(parsed.e164).toBe("+80012345678");
  });

  it("keeps the typed digits for an invalid non-geographic number", () => {
    const parsed = parsePhoneValue("+800123", "ES");
    expect(parsed.e164).toBe("");
    expect(parsed.national.replace(/\D/g, "")).toBe("123");
  });
});
