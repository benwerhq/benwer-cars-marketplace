"use client";

import { useState } from "react";

export function useVisibleCount(
  pageSize: number,
  resetKey: string,
): [number, () => void] {
  const [state, setState] = useState({ key: resetKey, count: pageSize });
  const count = state.key === resetKey ? state.count : pageSize;

  return [count, () => setState({ key: resetKey, count: count + pageSize })];
}
