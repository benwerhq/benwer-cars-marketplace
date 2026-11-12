import { describe, expect, it } from "vitest";
import { safeReturnTo, withReturnTo } from "./returnTo";

describe("safeReturnTo", () => {
  it("accepts same-site paths with their query", () => {
    expect(safeReturnTo("/book?carId=v1&from=2026-12-01")).toBe(
      "/book?carId=v1&from=2026-12-01",
    );
  });

  it("rejects anything that could leave the site", () => {
    expect(safeReturnTo("https://evil.example/")).toBeNull();
    expect(safeReturnTo("//evil.example/")).toBeNull();
    expect(safeReturnTo("/\\evil.example")).toBeNull();
    expect(safeReturnTo("javascript:alert(1)")).toBeNull();
    expect(safeReturnTo("/ok\nLocation: x")).toBeNull();
    expect(safeReturnTo("")).toBeNull();
  });
});

describe("withReturnTo", () => {
  it("adds next to the sign-in link", () => {
    expect(withReturnTo("/guest", "/book?carId=v1")).toBe(
      "/guest?next=%2Fbook%3FcarId%3Dv1",
    );
  });

  it("does not loop back to the guest pages", () => {
    expect(withReturnTo("/guest", "/guest/profile")).toBe("/guest");
  });
});
