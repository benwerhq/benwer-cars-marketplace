import type { MetadataRoute } from "next";
import { absoluteUrl, shouldNoIndexPublicPages } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (shouldNoIndexPublicPages()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/book",
          "/booking/",
          "/cart",
          "/api/",
          "/s/*/book",
          "/s/*/booking/",
          "/s/*/cart",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
