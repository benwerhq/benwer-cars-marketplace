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

export function isPlatformHost(
  hostname: string,
  marketplaceDomain: string,
): boolean {
  if (!hostname) {
    return true;
  }

  if (isLoopbackHost(hostname) || hostname.endsWith(".vercel.app")) {
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
): string | null {
  if (isLoopbackHost(hostname) || hostname.endsWith(".vercel.app")) {
    return null;
  }

  const domain = marketplaceDomain.trim().toLowerCase();
  const marketplaceHosts = [`marketplace.${domain}`, `www.${domain}`, domain];
  if (marketplaceHosts.includes(hostname)) {
    return null;
  }

  const escaped = domain.replace(/\./g, "\\.");
  const subdomainMatch = hostname.match(new RegExp(`^([^.]+)\\.${escaped}$`));
  return subdomainMatch?.[1] ?? null;
}
