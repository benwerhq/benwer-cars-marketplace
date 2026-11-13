import { ColorScheme, StorageKeys } from "@/enums";

export const COLOR_SCHEME_CHANGE_EVENT = "benwer:color-scheme";

const DARK_QUERY = "(prefers-color-scheme: dark)";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function parseColorScheme(value: string | null | undefined): ColorScheme | null {
  return Object.values(ColorScheme).includes(value as ColorScheme)
    ? (value as ColorScheme)
    : null;
}

export function serverDarkClass(scheme: ColorScheme | null): string {
  return scheme === ColorScheme.DARK ? "dark" : "";
}

export function systemColorSchemeScript(scheme: ColorScheme | null): string | null {
  if (scheme) {
    return null;
  }
  return `try{if(window.matchMedia(${JSON.stringify(DARK_QUERY)}).matches)document.documentElement.classList.add("dark")}catch(e){}`;
}

function prefersDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

export function subscribeToSystemScheme(onChange: () => void): () => void {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function readColorSchemeCookie(): ColorScheme | null {
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${StorageKeys.COLOR_SCHEME}=`));
  return parseColorScheme(match?.split("=")[1]);
}

export function writeColorSchemeCookie(scheme: ColorScheme): void {
  document.cookie = `${StorageKeys.COLOR_SCHEME}=${scheme}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

export function resolveColorScheme(choice: ColorScheme | null): ColorScheme {
  if (choice) {
    return choice;
  }
  return prefersDark() ? ColorScheme.DARK : ColorScheme.LIGHT;
}

export function applyColorScheme(scheme: ColorScheme): void {
  document.documentElement.classList.toggle("dark", scheme === ColorScheme.DARK);
}
