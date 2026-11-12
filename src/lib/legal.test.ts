import { describe, expect, it } from "vitest";
import {
  joinLegalCopy,
  parseLegalBlocks,
  readLegalSections,
  serializeLegalBlocks,
  splitLegalCopy,
  splitLegalText,
} from "./legal";

describe("readLegalSections", () => {
  it("keeps titled sections with body copy", () => {
    expect(
      readLegalSections([
        { title: "Who we are", body: "Benwer operates a marketplace." },
        { title: "", body: "skip" },
        { title: "Cookies", body: "Language cookie only." },
      ]),
    ).toEqual([
      { title: "Who we are", body: "Benwer operates a marketplace." },
      { title: "Cookies", body: "Language cookie only." },
    ]);
  });

  it("returns an empty list for invalid payloads", () => {
    expect(readLegalSections(null)).toEqual([]);
    expect(readLegalSections({ title: "Nope" })).toEqual([]);
    expect(readLegalSections(["plain"])).toEqual([]);
  });
});

describe("legal page titles", () => {
  it("reads a leading # line as the page title", () => {
    expect(splitLegalText("# Our privacy\n\nWe keep data safe.")).toEqual({
      title: "Our privacy",
      body: "We keep data safe.",
    });
    expect(splitLegalText("No title here")).toEqual({ title: "", body: "No title here" });
  });

  it("round-trips title and body per locale", () => {
    const copy = { "en-GB": "# Privacy\n\nBody", "es-ES": "Cuerpo" };
    const { title, body } = splitLegalCopy(copy);
    expect(title).toEqual({ "en-GB": "Privacy" });
    expect(joinLegalCopy(title, body)).toEqual(copy);
    expect(joinLegalCopy({ "en-GB": "Only title" }, {})).toEqual({ "en-GB": "# Only title" });
  });
});

describe("legal blocks", () => {
  const text = "We rent cars.\n\n## Who we are\nA Málaga company.\n\nFamily run.\n\n## Your data\nWe keep it safe.";

  it("splits ## subtitles into sections", () => {
    expect(parseLegalBlocks(text)).toEqual({
      intro: "We rent cars.",
      sections: [
        { title: "Who we are", body: "A Málaga company.\n\nFamily run." },
        { title: "Your data", body: "We keep it safe." },
      ],
    });
  });

  it("round-trips through serialize", () => {
    expect(serializeLegalBlocks(parseLegalBlocks(text))).toBe(text);
  });

  it("treats text without subtitles as the intro", () => {
    expect(parseLegalBlocks("Just text")).toEqual({ intro: "Just text", sections: [] });
  });
});
