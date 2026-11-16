"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface OwnerEditorView {
  editorOpen: boolean;
  previewing: boolean;
  setEditorView: (view: { editorOpen: boolean; previewing: boolean }) => void;
}

const OwnerEditorViewContext = createContext<OwnerEditorView>({
  editorOpen: false,
  previewing: false,
  setEditorView: () => undefined,
});

export function OwnerEditorViewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ editorOpen: false, previewing: false });
  const value = useMemo(
    () => ({ ...state, setEditorView: setState }),
    [state],
  );
  return (
    <OwnerEditorViewContext.Provider value={value}>{children}</OwnerEditorViewContext.Provider>
  );
}

export function useOwnerEditorView(): OwnerEditorView {
  return useContext(OwnerEditorViewContext);
}
