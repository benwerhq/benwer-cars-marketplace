export interface PlatformHostOptions {
  extraHosts?: readonly string[];
}

export function normalizeRequestHost(hostHeader: string): string {
  return hostHeader.trim().toLowerCase().split(":")[0]?.replace(/\.$/, "") ?? "";
}

export function isLoopbackHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost")
  );
}

export function parseHostList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => normalizeRequestHost(entry))
    .filter(Boolean);
}

export function hostFromAppUrl(appUrl: string | undefined): string | null {
  if (!appUrl) {
    return null;
  }

  try {
    return normalizeRequestHost(new URL(appUrl).host);
  } catch {
    return null;
  }
}

export function platformExtraHosts(input: {
  appUrl?: string;
  platformHosts?: string;
}): string[] {
  const hosts = new Set(parseHostList(input.platformHosts));
  const appHost = hostFromAppUrl(input.appUrl);
  if (appHost) {
    hosts.add(appHost);
  }
  return [...hosts];
}

function extraHostSet(extraHosts?: readonly string[]): Set<string> {
  return new Set(
    (extraHosts ?? []).map((host) => host.trim().toLowerCase()).filter(Boolean),
  );
}

export function isMarketplaceFrontDoor(
  hostname: string,
  marketplaceDomain: string,
  options?: PlatformHostOptions,
): boolean {
  if (
    !hostname ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app")
  ) {
    return true;
  }

  if (extraHostSet(options?.extraHosts).has(hostname)) {
    return true;
  }

  const domain = marketplaceDomain.trim().toLowerCase();
  if (!domain) {
    return false;
  }

  return (
    hostname === domain ||
    hostname === `marketplace.${domain}` ||
    hostname === `www.${domain}`
  );
}

export function isPlatformHost(
  hostname: string,
  marketplaceDomain: string,
  options?: PlatformHostOptions,
): boolean {
  if (!hostname) {
    return true;
  }

  if (isLoopbackHost(hostname) || hostname.endsWith(".vercel.app")) {
    return true;
  }

  if (extraHostSet(options?.extraHosts).has(hostname)) {
    return true;
  }

  const domain = marketplaceDomain.trim().toLowerCase();
  if (!domain) {
    return false;
  }

  return hostname === domain || hostname.endsWith(`.${domain}`);
}

export function resolvePlatformTenantSlug(
  hostname: string,
  marketplaceDomain: string,
  options?: PlatformHostOptions,
): string | null {
  if (isMarketplaceFrontDoor(hostname, marketplaceDomain, options)) {
    return null;
  }

  const domain = marketplaceDomain.trim().toLowerCase();
  const escaped = domain.replace(/\./g, "\\.");
  const subdomainMatch = hostname.match(new RegExp(`^([^.]+)\\.${escaped}$`));
  return subdomainMatch?.[1] ?? null;
}

export function parseSiteFallbackPath(
  pathname: string,
): { slug: string; rest: string } | null {
  const match = pathname.match(/^\/s\/([^/]+)(.*)$/);
  const rawSlug = match?.[1];
  if (!rawSlug) {
    return null;
  }

  try {
    const slug = decodeURIComponent(rawSlug);
    if (!slug) {
      return null;
    }
    return { slug, rest: match[2] ?? "" };
  } catch {
    return null;
  }
}

export function companySubdomainOrigin(
  slug: string,
  marketplaceDomain: string,
  appUrl: string,
): string {
  const app = new URL(appUrl);
  const isLocalDomain =
    marketplaceDomain === "localhost" || marketplaceDomain.endsWith(".localhost");
  const protocol = isLocalDomain ? app.protocol.replace(":", "") : "https";
  const port = isLocalDomain && app.port ? `:${app.port}` : "";
  return `${protocol}://${slug}.${marketplaceDomain}${port}`;
}

export function usesCompanySubdomains(
  requestHost: string,
  marketplaceDomain: string,
): boolean {
  const domain = marketplaceDomain.trim().toLowerCase();
  if (!domain) {
    return false;
  }

  if (isLoopbackHost(requestHost) || requestHost.endsWith(".vercel.app")) {
    return domain === "localhost" || domain.endsWith(".localhost");
  }

  return true;
}
