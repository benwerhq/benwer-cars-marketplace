const HEX = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: string): boolean {
  return HEX.test(value);
}

export function relativeLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const channel = (start: number) => {
    const scaled = Number.parseInt(value.slice(start, start + 2), 16) / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

export function isLightHex(hex: string): boolean {
  return isHexColor(hex) && relativeLuminance(hex) >= 0.179;
}

export function cssVarColor(style: object | null | undefined, name: string): string | null {
  if (!style) {
    return null;
  }
  const value = (style as Record<string, unknown>)[name];
  return typeof value === "string" && isHexColor(value) ? value : null;
}

export function contrastWithWhite(hex: string): number {
  if (!isHexColor(hex)) {
    return 0;
  }
  return 1.05 / (relativeLuminance(hex) + 0.05);
}
