import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** True for absolute http(s) links, e.g. a car page on a company's own domain. */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
