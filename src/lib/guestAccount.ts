import { ApiError } from "@/lib/errors";

export function isGuestNotConfiguredError(error: unknown): boolean {
  return error instanceof ApiError && error.code === "guest.not_configured";
}

export function isGuestNotLinkedError(error: unknown): boolean {
  return error instanceof ApiError && error.code === "guest.not_linked";
}

export function parseGuestConfirmToken(
  value: string | string[] | undefined,
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}
