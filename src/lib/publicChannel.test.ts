import { describe, expect, it } from "vitest";
import { PublicChannel } from "@/enums";
import { channelQuery, previewQueryValue } from "./publicChannel";

describe("channelQuery", () => {
  it("omits channel when unset so the API defaults to marketplace", () => {
    expect(channelQuery()).toEqual({});
  });

  it("sends website for company sites", () => {
    expect(channelQuery(PublicChannel.WEBSITE)).toEqual({
      channel: PublicChannel.WEBSITE,
    });
  });
});

describe("previewQueryValue", () => {
  it("only forwards tokens between 16 and 256 characters", () => {
    expect(previewQueryValue("short")).toBeUndefined();
    expect(previewQueryValue("abcdefghijklmnop")).toBe("abcdefghijklmnop");
    expect(previewQueryValue(` ${"a".repeat(16)} `)).toBe("a".repeat(16));
    expect(previewQueryValue("a".repeat(257))).toBeUndefined();
  });
});
