import { describe, expect, it } from "vitest";
import {
  buildWhatsAppUrl,
  normalizeWhatsAppNumber,
  whatsappSupportHref,
} from "./whatsappSupport";

describe("normalizeWhatsAppNumber", () => {
  it("returns null when unset or too short", () => {
    expect(normalizeWhatsAppNumber(undefined)).toBeNull();
    expect(normalizeWhatsAppNumber("")).toBeNull();
    expect(normalizeWhatsAppNumber("1234567")).toBeNull();
  });

  it("strips formatting from an international number", () => {
    expect(normalizeWhatsAppNumber("+34 623 640 669")).toBe("34623640669");
  });
});

describe("buildWhatsAppUrl", () => {
  it("prefills the message when given", () => {
    expect(buildWhatsAppUrl("34623640669", "Hello there")).toBe(
      "https://wa.me/34623640669?text=Hello+there",
    );
    expect(buildWhatsAppUrl("34623640669", "  ")).toBe(
      "https://wa.me/34623640669",
    );
  });
});

describe("whatsappSupportHref", () => {
  it("is null without a valid support number", () => {
    expect(whatsappSupportHref("Hi", "")).toBeNull();
  });

  it("links to the support number with the prefilled message", () => {
    expect(whatsappSupportHref("Hi", "+34 623 640 669")).toBe(
      "https://wa.me/34623640669?text=Hi",
    );
  });
});
