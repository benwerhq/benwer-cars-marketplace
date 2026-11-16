import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const LOCALSTACK_ORIGIN =
  process.env.LOCALSTACK_ORIGIN ?? "http://localhost:4566";

type RemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
};

function remotePatternFromOrigin(raw: string | undefined): RemotePattern[] {
  if (!raw) {
    return [];
  }

  try {
    const url = new URL(raw);
    return [
      {
        protocol: url.protocol === "http:" ? "http" : "https",
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname: "/**",
      },
    ];
  } catch {
    return [];
  }
}

function extraMediaRemotePattern(): RemotePattern[] {
  return remotePatternFromOrigin(process.env.NEXT_PUBLIC_MEDIA_ORIGIN);
}

function extraApiRemotePatterns(): RemotePattern[] {
  return [
    ...remotePatternFromOrigin(process.env.API_ORIGIN),
    ...remotePatternFromOrigin(process.env.NEXT_PUBLIC_API_URL),
  ];
}

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.benwer.es",
      },
      {
        protocol: "https",
        hostname: "**.benwer.es",
      },
      {
        protocol: "https",
        hostname: "staging.cars-api.benwer.es",
      },
      {
        protocol: "https",
        hostname: "cars-api.benwer.es",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4566",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "4566",
        pathname: "/**",
      },
      ...extraMediaRemotePattern(),
      ...extraApiRemotePatterns(),
    ],
  },
  async rewrites() {
    return [
      {
        source: "/localstack/:path*",
        destination: `${LOCALSTACK_ORIGIN}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
