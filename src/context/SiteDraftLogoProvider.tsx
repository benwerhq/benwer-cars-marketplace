"use client";

import type { SiteCornerStyle } from "@/enums";
import { useDocumentCorners } from "@/hooks/useDocumentCorners";
import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react";

interface SiteDraftLogo {
  headerLogo: string | null | undefined;
  setHeaderLogo: (url: string | null | undefined) => void;
  setThemeStyle: (style: CSSProperties | undefined) => void;
  setCornerStyle: (style: SiteCornerStyle | undefined) => void;
}

const SiteDraftLogoContext = createContext<SiteDraftLogo | null>(null);

export function SiteDraftLogoProvider({ children }: { children: ReactNode }) {
  const [headerLogo, setHeaderLogo] = useState<string | null | undefined>(undefined);
  const [themeStyle, setThemeStyle] = useState<CSSProperties | undefined>(undefined);
  const [cornerStyle, setCornerStyle] = useState<SiteCornerStyle | undefined>(undefined);
  useDocumentCorners(cornerStyle);
  return (
    <SiteDraftLogoContext.Provider value={{ headerLogo, setHeaderLogo, setThemeStyle, setCornerStyle }}>
      <div style={themeStyle} data-corners={cornerStyle} className="contents">
        {children}
      </div>
    </SiteDraftLogoContext.Provider>
  );
}

export function useSiteDraftLogo(): SiteDraftLogo | null {
  return useContext(SiteDraftLogoContext);
}
