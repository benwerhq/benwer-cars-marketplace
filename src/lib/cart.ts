import { useSyncExternalStore } from "react";

/**
 * Phase A cart: one cart per company site, kept in localStorage on the
 * guest's device. Nothing is held on the server until checkout books it.
 */
export interface CartItem {
  id: string;
  vehicleId: string;
  from: string;
  to: string;
  branch?: string;
  returnBranch?: string;
  driverAge?: string;
  insurancePackageId?: string;
  addonIds?: string[];
  pickupTime?: string;
  returnTime?: string;
  addedAt: string;
}

export type NewCartItem = Omit<CartItem, "id" | "addedAt">;

export const CART_MAX_ITEMS = 10;
const CHANGE_EVENT = "benwer:cart-change";
const EMPTY: CartItem[] = [];

export function cartKey(slug: string): string {
  return `benwer:cart:${slug}`;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

function optionalString(value: unknown, pattern?: RegExp): string | undefined {
  if (typeof value !== "string" || !value || value.length > 200) {
    return undefined;
  }
  return !pattern || pattern.test(value) ? value : undefined;
}

export function sanitizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const items: CartItem[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") {
      continue;
    }
    const row = raw as Record<string, unknown>;
    const id = optionalString(row.id);
    const vehicleId = optionalString(row.vehicleId);
    const from = optionalString(row.from, ISO_DATE);
    const to = optionalString(row.to, ISO_DATE);
    if (!id || !vehicleId || !from || !to) {
      continue;
    }
    items.push({
      id,
      vehicleId,
      from,
      to,
      branch: optionalString(row.branch),
      returnBranch: optionalString(row.returnBranch),
      driverAge: optionalString(row.driverAge),
      insurancePackageId: optionalString(row.insurancePackageId),
      addonIds: Array.isArray(row.addonIds)
        ? row.addonIds.filter((item): item is string => typeof item === "string").slice(0, 20)
        : undefined,
      pickupTime: optionalString(row.pickupTime, TIME),
      returnTime: optionalString(row.returnTime, TIME),
      addedAt: optionalString(row.addedAt) ?? new Date(0).toISOString(),
    });
  }
  return items.slice(0, CART_MAX_ITEMS);
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

// useSyncExternalStore needs a stable snapshot: cache the parsed cart per raw
// string so unchanged storage returns the same array.
const snapshotCache = new Map<string, { raw: string | null; items: CartItem[] }>();

export function readCart(slug: string): CartItem[] {
  const key = cartKey(slug);
  let raw: string | null = null;
  try {
    raw = storage()?.getItem(key) ?? null;
  } catch {
    raw = null;
  }
  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) {
    return cached.items;
  }
  let items = EMPTY;
  try {
    items = raw ? sanitizeCart(JSON.parse(raw)) : EMPTY;
  } catch {
    items = EMPTY;
  }
  snapshotCache.set(key, { raw, items });
  return items;
}

export function writeCart(slug: string, items: CartItem[]): void {
  try {
    const next = items.slice(0, CART_MAX_ITEMS);
    if (next.length === 0) {
      storage()?.removeItem(cartKey(slug));
    } else {
      storage()?.setItem(cartKey(slug), JSON.stringify(next));
    }
  } catch {
    /* storage blocked or full */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/**
 * Adds a car, replacing an existing line for the same car and dates.
 * Returns false when the cart is full.
 */
export function addToCart(slug: string, item: NewCartItem): boolean {
  const items = readCart(slug);
  const same = items.find(
    (row) => row.vehicleId === item.vehicleId && row.from === item.from && row.to === item.to,
  );
  if (same) {
    writeCart(
      slug,
      items.map((row) => (row.id === same.id ? { ...row, ...item } : row)),
    );
    return true;
  }
  if (items.length >= CART_MAX_ITEMS) {
    return false;
  }
  writeCart(slug, [...items, { ...item, id: newId(), addedAt: new Date().toISOString() }]);
  return true;
}

export function updateCartItem(
  slug: string,
  id: string,
  patch: Partial<NewCartItem>,
): void {
  writeCart(
    slug,
    readCart(slug).map((row) => (row.id === id ? { ...row, ...patch } : row)),
  );
}

export function removeFromCart(slug: string, ids: string | string[]): void {
  const drop = new Set(Array.isArray(ids) ? ids : [ids]);
  writeCart(
    slug,
    readCart(slug).filter((row) => !drop.has(row.id)),
  );
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The live cart for a company site; empty during server render. */
export function useCart(slug: string): CartItem[] {
  return useSyncExternalStore(
    subscribe,
    () => readCart(slug),
    () => EMPTY,
  );
}
