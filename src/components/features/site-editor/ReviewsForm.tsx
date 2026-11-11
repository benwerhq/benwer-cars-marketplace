"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { MAX_SITE_REVIEWS, newContentId } from "@/lib/siteContent";
import type { SiteReview, SiteReviewsContent } from "@/types/siteContent";
import {
  EditorField,
  EditorGroup,
  ItemCard,
  TextField,
  editorSelectClass,
  moveItem,
  replaceItem,
} from "./EditorPrimitives";

interface ReviewsFormProps {
  reviews: SiteReviewsContent;
  onChange: (reviews: SiteReviewsContent) => void;
}

function toNumber(value: string): number | null {
  const parsed = Number(value.replace(",", "."));
  return value.trim() && Number.isFinite(parsed) ? parsed : null;
}

export function ReviewsForm({ reviews, onChange }: ReviewsFormProps) {
  const t = useTranslations("siteEditor.reviews");
  const items = reviews.items;
  const setItems = (next: SiteReview[]) => onChange({ ...reviews, items: next });

  return (
    <>
      <EditorGroup title={t("summaryTitle")} description={t("summaryDescription")}>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="reviews-score"
            label={t("score")}
            inputMode="decimal"
            value={reviews.score?.toString() ?? ""}
            placeholder="4.8"
            onChange={(value) => onChange({ ...reviews, score: toNumber(value) })}
          />
          <TextField
            id="reviews-count"
            label={t("count")}
            inputMode="numeric"
            value={reviews.count?.toString() ?? ""}
            placeholder="1860"
            onChange={(value) => onChange({ ...reviews, count: toNumber(value) })}
          />
        </div>
        <TextField
          id="reviews-source"
          label={t("source")}
          value={reviews.sourceLabel}
          placeholder="Google"
          onChange={(sourceLabel) => onChange({ ...reviews, sourceLabel })}
        />
        <TextField
          id="reviews-source-url"
          label={t("sourceUrl")}
          type="url"
          value={reviews.sourceUrl}
          placeholder="https://"
          hint={t("sourceUrlHint")}
          onChange={(sourceUrl) => onChange({ ...reviews, sourceUrl })}
        />
      </EditorGroup>
      <EditorGroup
        title={t("itemsTitle")}
        description={t("itemsDescription", { max: MAX_SITE_REVIEWS })}
      >
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : null}
        {items.map((review, index) => {
          const update = (patch: Partial<SiteReview>) =>
            setItems(replaceItem(items, index, { ...review, ...patch }));
          return (
            <ItemCard
              key={review.id}
              title={review.author || t("item", { position: index + 1 })}
              index={index}
              count={items.length}
              onMove={(direction) => setItems(moveItem(items, index, direction))}
              onRemove={() => setItems(items.filter((_, position) => position !== index))}
            >
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  id={`review-${review.id}-author`}
                  label={t("author")}
                  value={review.author}
                  onChange={(author) => update({ author })}
                />
                <EditorField label={t("rating")} htmlFor={`review-${review.id}-rating`}>
                  <select
                    id={`review-${review.id}-rating`}
                    className={editorSelectClass}
                    value={review.rating}
                    onChange={(event) => update({ rating: Number(event.target.value) })}
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {t("stars", { count: rating })}
                      </option>
                    ))}
                  </select>
                </EditorField>
                <TextField
                  id={`review-${review.id}-origin`}
                  label={t("origin")}
                  value={review.origin}
                  placeholder={t("originPlaceholder")}
                  onChange={(origin) => update({ origin })}
                />
                <TextField
                  id={`review-${review.id}-date`}
                  label={t("date")}
                  value={review.date}
                  placeholder={t("datePlaceholder")}
                  onChange={(date) => update({ date })}
                />
              </div>
              <TextField
                id={`review-${review.id}-vehicle`}
                label={t("vehicle")}
                value={review.vehicle}
                onChange={(vehicle) => update({ vehicle })}
              />
              <TextField
                id={`review-${review.id}-text`}
                label={t("text")}
                value={review.text}
                multiline
                onChange={(text) => update({ text })}
              />
            </ItemCard>
          );
        })}
        {items.length < MAX_SITE_REVIEWS ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-fit"
            onClick={() =>
              setItems([
                ...items,
                {
                  id: newContentId("review"),
                  author: "",
                  origin: "",
                  date: "",
                  rating: 5,
                  text: "",
                  vehicle: "",
                },
              ])
            }
          >
            <Plus size={14} aria-hidden />
            {t("add")}
          </Button>
        ) : null}
      </EditorGroup>
    </>
  );
}
