import { describe, expect, it } from "vitest";
import { CART_MAX_ITEMS, cartKey, sanitizeCart } from "./cart";

describe("cartKey", () => {
  it("keeps one cart per company site", () => {
    expect(cartKey("coches")).toBe("benwer:cart:coches");
  });
});

describe("sanitizeCart", () => {
  const item = {
    id: "i1",
    vehicleId: "v1",
    from: "2026-11-25",
    to: "2026-11-28",
    addedAt: "2026-11-12T10:00:00.000Z",
  };

  it("keeps valid items and drops broken ones", () => {
    expect(
      sanitizeCart([item, { id: "x" }, "nope", { ...item, id: "i2", from: "25/11" }]),
    ).toEqual([
      {
        ...item,
        branch: undefined,
        returnBranch: undefined,
        driverAge: undefined,
        insurancePackageId: undefined,
        addonIds: undefined,
        pickupTime: undefined,
        returnTime: undefined,
      },
    ]);
  });

  it("rejects bad times and caps the cart size", () => {
    expect(sanitizeCart([{ ...item, pickupTime: "9am" }])[0]?.pickupTime).toBeUndefined();
    const many = Array.from({ length: CART_MAX_ITEMS + 3 }, (_, index) => ({
      ...item,
      id: `i${index}`,
    }));
    expect(sanitizeCart(many)).toHaveLength(CART_MAX_ITEMS);
  });

  it("returns an empty cart for anything that isn't a list", () => {
    expect(sanitizeCart({})).toEqual([]);
  });
});
