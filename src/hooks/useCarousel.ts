"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { useMediaQuery } from "./useMediaQuery";

export const CAROUSEL_ROTATE_MS = 10_000;
const SWIPE_MIN_PX = 40;

export function useCarousel(count: number, rotateMs = CAROUSEL_ROTATE_MS) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [index, setIndex] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const active = count > 0 ? Math.min(index, count - 1) : 0;
  const touchStart = useRef<{ x: number; y: number } | null>(null);

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
      onTouchStart: (event: TouchEvent) => {
        const touch = event.touches[0];
        touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
        setInteracting(true);
      },
      onTouchEnd: (event: TouchEvent) => {
        const start = touchStart.current;
        const touch = event.changedTouches[0];
        touchStart.current = null;
        setInteracting(false);
        if (!start || !touch || count < 2) {
          return;
        }
        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) {
          go(dx < 0 ? 1 : -1);
        }
      },
    },
  };
}
