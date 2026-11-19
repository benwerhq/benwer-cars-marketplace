import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import { LocaleFlag } from "./LocaleFlag";

describe("LocaleFlag", () => {
  it("renders a crisp inline SVG flag for every canonical EU locale", () => {
    const outputs = new Set<string>();

    for (const locale of routing.locales) {
      const html = renderToStaticMarkup(createElement(LocaleFlag, { locale }));
      expect(html).toContain('viewBox="0 0 24 18"');
      expect(html).toContain('aria-hidden="true"');
      expect(html).toMatch(/<(rect|path|polygon|circle)\b/);
      outputs.add(html);
    }

    expect(outputs.size).toBe(routing.locales.length);
  });

  it("merges custom className onto the svg element", () => {
    const html = renderToStaticMarkup(
      createElement(LocaleFlag, { locale: "en-GB", className: "custom-flag" }),
    );
    expect(html).toContain("custom-flag");
    expect(html).toContain("h-3.5 w-5");
  });
});
