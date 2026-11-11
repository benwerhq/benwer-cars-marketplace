import { NavRoutes } from "@/enums";

export interface MarketplaceBannerLayout {
  script: number;
  highlight: number;
  joiner: number;
  boxed: number;
  boxedIndent: number;
  description: number;
  descriptionWidth: number;
  cta: number;
}

export interface MarketplaceBanner {
  id: "trust" | "prices" | "anywhere";
  imageSrc: string;
  href: NavRoutes;
  layout: MarketplaceBannerLayout;
}

export const MARKETPLACE_BANNERS: MarketplaceBanner[] = [
  {
    id: "trust",
    imageSrc: "/images/banners/marketplace-trust.webp",
    href: NavRoutes.COMPANIES,
    layout: {
      script: 2.3,
      highlight: 3.7,
      joiner: 2.3,
      boxed: 2.95,
      boxedIndent: 1.4,
      description: 1.15,
      descriptionWidth: 20,
      cta: 1.05,
    },
  },
  {
    id: "prices",
    imageSrc: "/images/banners/marketplace-prices.webp",
    href: NavRoutes.CARS,
    layout: {
      script: 2.6,
      highlight: 4,
      joiner: 2.9,
      boxed: 2.55,
      boxedIndent: 0,
      description: 0.98,
      descriptionWidth: 19.5,
      cta: 0.95,
    },
  },
  {
    id: "anywhere",
    imageSrc: "/images/banners/marketplace-anywhere.webp",
    href: NavRoutes.CARS,
    layout: {
      script: 2.6,
      highlight: 4.6,
      joiner: 2.9,
      boxed: 2.6,
      boxedIndent: 0,
      description: 1.02,
      descriptionWidth: 24,
      cta: 1,
    },
  },
];
