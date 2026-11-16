import { describe, expect, it } from "vitest";
import { localizedText } from "./localizedCopy";

describe("localizedText", () => {
  it("prefers the full locale then language then English", () => {
    expect(
      localizedText(
        { "es-ES": "Hola", "en-GB": "Hello", "pt-PT": "Olá" },
        "es-ES",
      ),
    ).toBe("Hola");
    expect(localizedText({ es: "Hola", "en-GB": "Hello" }, "es-ES")).toBe(
      "Hola",
    );
    expect(localizedText({ "en-GB": "Hello" }, "pt-PT")).toBe("Hello");
  });
});
