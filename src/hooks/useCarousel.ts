"use client";

import { useCallback, useEffect, useState } from "react";
import { useMediaQuery } from "./useMediaQuery";

const DEFAULT_ROTATE_MS = 6000;

export function useCarousel(count: number, rotateMs = DEFAULT_ROTATE_MS) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const active = count > 0 ? Math.min(index, count - 1) : 0;

  const go = useCallback(
    (direction: -1 | 1) =>
      setIndex((current) => (current + direction + count) % count),
    [count],
  );

  useEffect(() => {
    if (count < 2 || paused || interacting || reducedMotion) {
      return;
    }
    const timer = window.setInterval(() => go(1), rotateMs);
    return () => window.clearInterval(timer);
  }, [count, paused, interacting, reducedMotion, rotateMs, go]);

  return {
    active,
    setIndex,
    go,
    paused,
    togglePaused: () => setPaused((value) => !value),
    reducedMotion,
    interactionHandlers: {
      onMouseEnter: () => setInteracting(true),
      onMouseLeave: () => setInteracting(false),
      onFocusCapture: () => setInteracting(true),
      onBlurCapture: () => setInteracting(false),
    },
  };
}
