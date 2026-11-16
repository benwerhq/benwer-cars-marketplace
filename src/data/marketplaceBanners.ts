export interface MarketplaceBannerLayout {
  script: number;
  highlight: number;
  joiner: number;
  boxed: number;
  boxedIndent: number;
  description: number;
  descriptionWidth: number;
}

export interface MarketplaceBanner {
  id: "trust" | "prices" | "anywhere";
  imageSrc: string;
  layout: MarketplaceBannerLayout;
}

export const MARKETPLACE_BANNERS: MarketplaceBanner[] = [
  {
    id: "trust",
    imageSrc: "/images/banners/marketplace-trust.webp",
    layout: {
      script: 2.3,
      highlight: 3.7,
      joiner: 2.3,
      boxed: 2.95,
      boxedIndent: 1.4,
      description: 1.5,
      descriptionWidth: 25,
    },
  },
  {
    id: "prices",
    imageSrc: "/images/banners/marketplace-prices.webp",
    layout: {
      script: 2.4,
      highlight: 3.7,
      joiner: 2.4,
      boxed: 2.1,
      boxedIndent: 0,
      description: 1.3,
      descriptionWidth: 21.5,
    },
  },
  {
    id: "anywhere",
    imageSrc: "/images/banners/marketplace-anywhere.webp",
    layout: {
      script: 2.4,
      highlight: 3.4,
      joiner: 2.3,
      boxed: 1.75,
      boxedIndent: 0,
      description: 1.3,
      descriptionWidth: 21.5,
    },
  },
];
