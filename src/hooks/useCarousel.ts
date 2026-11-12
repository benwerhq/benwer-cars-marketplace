"use client";

import { useCallback, useEffect, useState } from "react";
import { useMediaQuery } from "./useMediaQuery";

export const CAROUSEL_ROTATE_MS = 10_000;

export function useCarousel(count: number, rotateMs = CAROUSEL_ROTATE_MS) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [index, setIndex] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const active = count > 0 ? Math.min(index, count - 1) : 0;

  const go = useCallback(
    (direction: -1 | 1) =>
      setIndex((current) => (current + direction + count) % count),
    [count],
  );

  useEffect(() => {
    if (count < 2 || interacting || reducedMotion) {
      return;
    }
    const timer = window.setInterval(() => go(1), rotateMs);
    return () => window.clearInterval(timer);
  }, [count, interacting, reducedMotion, rotateMs, go]);

  return {
    active,
    setIndex,
    go,
    interactionHandlers: {
      onMouseEnter: () => setInteracting(true),
      onMouseLeave: () => setInteracting(false),
      onFocusCapture: () => setInteracting(true),
      onBlurCapture: () => setInteracting(false),
    },
  };
}
