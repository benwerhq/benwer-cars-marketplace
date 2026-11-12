import { describe, expect, it } from "vitest";
import { joinLegalCopy, readLegalSections, splitLegalCopy, splitLegalText } from "./legal";

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
