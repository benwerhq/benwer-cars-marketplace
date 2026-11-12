"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface SiteDraftLogo {
  headerLogo: string | null | undefined;
  setHeaderLogo: (url: string | null | undefined) => void;
}

const SiteDraftLogoContext = createContext<SiteDraftLogo | null>(null);

export function SiteDraftLogoProvider({ children }: { children: ReactNode }) {
  const [headerLogo, setHeaderLogo] = useState<string | null | undefined>(undefined);
  return (
    <SiteDraftLogoContext.Provider value={{ headerLogo, setHeaderLogo }}>
      {children}
    </SiteDraftLogoContext.Provider>
  );
}

export function useSiteDraftLogo(): SiteDraftLogo | null {
  return useContext(SiteDraftLogoContext);
}
