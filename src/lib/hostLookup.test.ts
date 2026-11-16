import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HOST_LOOKUP_TTL_MS,
  lookupPublicHost,
  resetHostLookupCache,
} from "./hostLookup";

afterEach(() => {
  resetHostLookupCache();
});

describe("lookupPublicHost", () => {
  it("caches an active host and a 404 for 60 seconds", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            host: "reservas.acme.es",
            slug: "acme",
            canonicalUrl: "https://reservas.acme.es",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response("", { status: 404 }));

    const first = await lookupPublicHost("reservas.acme.es", {
      fetchImpl,
      apiOrigin: "http://api.example",
      now: 1_000,
    });
    const cached = await lookupPublicHost("reservas.acme.es", {
      fetchImpl,
      apiOrigin: "http://api.example",
      now: 1_000 + HOST_LOOKUP_TTL_MS - 1,
    });

    expect(first).toEqual({
      host: "reservas.acme.es",
      slug: "acme",
      canonicalUrl: "https://reservas.acme.es",
    });
    expect(cached).toEqual(first);
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    await lookupPublicHost("unknown.example", {
      fetchImpl,
      apiOrigin: "http://api.example",
      now: 1_000,
    });
    await lookupPublicHost("unknown.example", {
      fetchImpl,
      apiOrigin: "http://api.example",
      now: 1_000 + HOST_LOOKUP_TTL_MS - 1,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not serve another slug when the lookup is empty", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("", { status: 404 }));
    await expect(
      lookupPublicHost("ghost.example", {
        fetchImpl,
        apiOrigin: "http://api.example",
      }),
    ).resolves.toBeNull();
  });
});
