import type { SiteReviewsContent } from "@/types/siteContent";

const DEMO_REVIEW_PREFIX = "demo-review-";

const BENWER_HQ_COMPANY_ID = "c1000000-0000-7000-8000-000000000001";

const BENWER_HQ_REVIEWS: SiteReviewsContent = {
  average: 4.8,
  count: 27,
  items: [
    {
      id: "demo-review-1",
      rating: 5,
      text: "Picked the car up at Málaga airport in ten minutes. Spotless, full tank and no surprise charges at the desk.",
      createdAt: "2026-10-18T10:00:00Z",
    },
    {
      id: "demo-review-2",
      rating: 5,
      text: "Booked online the night before and everything was ready. The team even gave us tips for driving to Ronda.",
      createdAt: "2026-10-02T10:00:00Z",
    },
    {
      id: "demo-review-3",
      rating: 4,
      text: "Good value and friendly service. Drop-off at Calle Larios was quick; only wish the office opened a bit earlier.",
      createdAt: "2026-09-21T10:00:00Z",
    },
    {
      id: "demo-review-4",
      rating: 5,
      text: "Second time renting with them. Easy WhatsApp contact and a newer car than I expected for the price.",
      createdAt: "2026-09-05T10:00:00Z",
    },
  ],
};

export function withDemoReviews(
  companyId: string,
  reviews: SiteReviewsContent,
): SiteReviewsContent {
  if (companyId !== BENWER_HQ_COMPANY_ID || reviews.items.length > 0) {
    return reviews;
  }
  return BENWER_HQ_REVIEWS;
}

export function isDemoReviews(reviews: SiteReviewsContent): boolean {
  return reviews.items.some((item) => item.id.startsWith(DEMO_REVIEW_PREFIX));
}
