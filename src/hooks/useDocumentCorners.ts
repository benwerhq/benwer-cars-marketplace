"use client";

import { useEffect } from "react";
import { SiteCornerStyle } from "@/enums";

const ATTRIBUTE = "data-corners";
const active: { corners: SiteCornerStyle }[] = [];

function applyLatest(): void {
  const root = document.documentElement;
  if (active.at(-1)?.corners === SiteCornerStyle.SQUARE) {
    root.setAttribute(ATTRIBUTE, SiteCornerStyle.SQUARE);
  } else {
    root.removeAttribute(ATTRIBUTE);
  }
}

export function useDocumentCorners(corners: SiteCornerStyle | undefined): void {
  useEffect(() => {
    if (!corners) return;
    const entry = { corners };
    active.push(entry);
    applyLatest();
    return () => {
      active.splice(active.indexOf(entry), 1);
      applyLatest();
    };
  }, [corners]);
}
