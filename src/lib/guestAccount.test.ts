import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/errors";
import {
  isGuestNotConfiguredError,
  isGuestNotLinkedError,
  parseGuestConfirmToken,
} from "./guestAccount";

describe("guest account errors", () => {
  it("detects the disabled Firebase configuration code", () => {
    expect(
      isGuestNotConfiguredError(new ApiError(503, "guest.not_configured")),
    ).toBe(true);
    expect(isGuestNotConfiguredError(new ApiError(404, "guest.not_linked"))).toBe(
      false,
    );
    expect(isGuestNotLinkedError(new ApiError(404, "guest.not_linked"))).toBe(
      true,
    );
  });
});

describe("parseGuestConfirmToken", () => {
  it("reads the confirm query token", () => {
    expect(parseGuestConfirmToken("abc")).toBe("abc");
    expect(parseGuestConfirmToken(["abc", "other"])).toBe("abc");
    expect(parseGuestConfirmToken("  ")).toBe("");
  });
});
