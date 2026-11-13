"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { CompanyMapSkeleton } from "./CompanyMapSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { env } from "@/env";
import { getErrorKey } from "@/lib/errors";
import { logError } from "@/lib/logger";
import type { CompanyMapPin } from "@/lib/companyMap";
import { cn } from "@/lib/utils";

const CompaniesGoogleMapCanvas = dynamic(
  () =>
    import("./CompaniesGoogleMapCanvas").then(
      (mod) => mod.CompaniesGoogleMapCanvas,
    ),
  {
    ssr: false,
    loading: () => <CompanyMapSkeleton />,
  },
);

const CompaniesMapCanvas = dynamic(
  () => import("./CompaniesMapCanvas").then((mod) => mod.CompaniesMapCanvas),
  {
    ssr: false,
    loading: () => <CompanyMapSkeleton />,
  },
);

interface CompaniesMapProps {
  pins: CompanyMapPin[];
  selectedSlug: string | null;
  highlightedSlug: string | null;
  locationSlug: string | null;
  isPending: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  onSelect: (slug: string) => void;
  onClose: () => void;
  className?: string;
}

interface MapErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface MapErrorBoundaryState {
  hasError: boolean;
}

class MapErrorBoundary extends Component<
  MapErrorBoundaryProps,
  MapErrorBoundaryState
> {
  public override state: MapErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): MapErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo) {
    logError(error, { context: "companies_map", info: info.componentStack });
  }

  public override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export function CompaniesMap({
  pins,
  selectedSlug,
  highlightedSlug,
  locationSlug,
  isPending,
  isError,
  error,
  onRetry,
  onSelect,
  onClose,
  className,
}: CompaniesMapProps) {
  const t = useTranslations("map");
  const tRoot = useTranslations();
  const googleMapsApiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (isPending) {
    return (
      <div className={cn("h-full min-h-80", className)}>
        <CompanyMapSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={cn(
          "flex h-full min-h-80 items-center justify-center rounded-xl border border-border bg-surface",
          className,
        )}
      >
        <ErrorState message={tRoot(getErrorKey(error))} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative isolate h-full min-h-80 overflow-hidden rounded-xl border border-border bg-surface",
        className,
      )}
    >
      <MapErrorBoundary
        fallback={
          <div className="flex h-full min-h-80 items-center justify-center">
            <ErrorState message={t("errorDescription")} onRetry={onRetry} />
          </div>
        }
      >
        {googleMapsApiKey ? (
          <CompaniesGoogleMapCanvas
            apiKey={googleMapsApiKey}
            pins={pins}
            selectedSlug={selectedSlug}
            highlightedSlug={highlightedSlug}
            locationSlug={locationSlug}
            onSelect={onSelect}
            onClose={onClose}
          />
        ) : (
          <CompaniesMapCanvas
            pins={pins}
            selectedSlug={selectedSlug}
            highlightedSlug={highlightedSlug}
            locationSlug={locationSlug}
            onSelect={onSelect}
            onClose={onClose}
          />
        )}
      </MapErrorBoundary>
      {pins.length === 0 ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10">
          <div className="pointer-events-auto rounded-xl border border-border bg-surface/95 shadow-md backdrop-blur-sm">
            <EmptyState
              icon={<MapPin size={22} />}
              title={t("emptyTitle")}
              description={t("emptyDescription")}
              variant="compact"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
