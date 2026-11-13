import { ColorScheme, StorageKeys } from "@/enums";

export const DEFAULT_COLOR_SCHEME = ColorScheme.LIGHT;

const DARK_QUERY = "(prefers-color-scheme: dark)";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function parseColorScheme(value: string | null | undefined): ColorScheme {
  return Object.values(ColorScheme).includes(value as ColorScheme)
    ? (value as ColorScheme)
    : DEFAULT_COLOR_SCHEME;
}

export function serverDarkClass(scheme: ColorScheme): string {
  return scheme === ColorScheme.DARK ? "dark" : "";
}

export function systemColorSchemeScript(scheme: ColorScheme): string | null {
  if (scheme !== ColorScheme.SYSTEM) {
    return null;
  }
  return `try{if(window.matchMedia(${JSON.stringify(DARK_QUERY)}).matches)document.documentElement.classList.add("dark")}catch(e){}`;
}

export function prefersDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

export function subscribeToSystemScheme(onChange: () => void): () => void {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function readColorSchemeCookie(): ColorScheme {
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${StorageKeys.COLOR_SCHEME}=`));
  return parseColorScheme(match?.split("=")[1]);
}

export function writeColorSchemeCookie(scheme: ColorScheme): void {
  document.cookie = `${StorageKeys.COLOR_SCHEME}=${scheme}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

export function applyColorScheme(scheme: ColorScheme): void {
  const dark =
    scheme === ColorScheme.DARK || (scheme === ColorScheme.SYSTEM && prefersDark());
  document.documentElement.classList.toggle("dark", dark);
}
