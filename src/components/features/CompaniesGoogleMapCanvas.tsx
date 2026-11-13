"use client";

import { useEffect } from "react";
import {
  APIProvider,
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  ColorScheme,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import { Car } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { CompanyMapPinCard } from "./CompanyMapPinCard";
import {
  MALAGA_PROVINCE_BOUNDS,
  MALAGA_PROVINCE_CENTER,
  getCityCoordinates,
} from "@/data/malagaCityCoordinates";
import { getCityDisplayName } from "@/data/malagaCities";
import { env } from "@/env";
import { useIsDarkMode } from "@/hooks/useIsDarkMode";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { CompanyMapPin } from "@/lib/companyMap";
import { cn } from "@/lib/utils";

const DEV_MAP_ID = "DEMO_MAP_ID";
const PROVINCE_ZOOM = 8;
const CITY_ZOOM = 12;
const FIT_PADDING = 64;

const [[SOUTH, WEST], [NORTH, EAST]] = MALAGA_PROVINCE_BOUNDS;
const RESTRICTION: google.maps.MapRestriction = {
  latLngBounds: {
    south: SOUTH - 0.4,
    west: WEST - 0.6,
    north: NORTH + 0.4,
    east: EAST + 0.6,
  },
  strictBounds: false,
};

interface CompaniesGoogleMapCanvasProps {
  apiKey: string;
  pins: CompanyMapPin[];
  selectedSlug: string | null;
  highlightedSlug: string | null;
  locationSlug: string | null;
  onSelect: (slug: string) => void;
  onClose: () => void;
}

function FitPins({
  pins,
  locationSlug,
}: {
  pins: CompanyMapPin[];
  locationSlug: string | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) {
      return;
    }

    if (pins.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      pins.forEach((pin) => bounds.extend({ lat: pin.lat, lng: pin.lng }));
      map.fitBounds(bounds, FIT_PADDING);
      return;
    }

    const city = locationSlug ? getCityCoordinates(locationSlug) : null;
    const target = pins[0] ?? city;
    if (target) {
      map.setCenter({ lat: target.lat, lng: target.lng });
      map.setZoom(CITY_ZOOM);
      return;
    }

    map.setCenter(MALAGA_PROVINCE_CENTER);
    map.setZoom(PROVINCE_ZOOM);
  }, [map, pins, locationSlug]);

  return null;
}

function FocusSelectedPin({ pin }: { pin: CompanyMapPin | null }) {
  const map = useMap();

  useEffect(() => {
    if (map && pin) {
      map.panTo({ lat: pin.lat, lng: pin.lng });
    }
  }, [map, pin]);

  return null;
}

function CompanyPin({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      aria-label={label}
      className={cn(
        "flex items-center gap-1.5 rounded-full border-2 border-surface py-1 pr-3 pl-1 text-xs font-semibold shadow-md transition-transform motion-reduce:transition-none",
        active
          ? "scale-110 bg-foreground text-background"
          : "bg-primary text-primary-foreground hover:scale-105",
      )}
    >
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-full",
          active ? "bg-background/15" : "bg-primary-foreground/15",
        )}
      >
        <Car size={14} aria-hidden />
      </span>
      <span className="max-w-36 truncate">{label}</span>
    </span>
  );
}

export function CompaniesGoogleMapCanvas({
  apiKey,
  pins,
  selectedSlug,
  highlightedSlug,
  locationSlug,
  onSelect,
  onClose,
}: CompaniesGoogleMapCanvasProps) {
  const t = useTranslations("map");
  const locale = useLocale();
  const isDark = useIsDarkMode();
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");
  const selectedPin = pins.find((pin) => pin.slug === selectedSlug) ?? null;

  return (
    <APIProvider apiKey={apiKey} language={locale}>
      <div
        className="relative h-full w-full"
        aria-label={t("regionAria")}
        role="region"
      >
        <Map
          key={isDark ? "dark" : "light"}
          mapId={env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? DEV_MAP_ID}
          colorScheme={isDark ? ColorScheme.DARK : ColorScheme.LIGHT}
          defaultCenter={MALAGA_PROVINCE_CENTER}
          defaultZoom={PROVINCE_ZOOM}
          minZoom={7}
          maxZoom={17}
          restriction={RESTRICTION}
          gestureHandling={isCoarsePointer ? "cooperative" : "greedy"}
          disableDefaultUI
          zoomControl
          clickableIcons={false}
          onClick={onClose}
          className="h-full w-full"
        >
          <FitPins pins={pins} locationSlug={locationSlug} />
          <FocusSelectedPin pin={selectedPin} />
          {pins.map((pin) => {
            const active =
              pin.slug === selectedSlug || pin.slug === highlightedSlug;
            const cityName = getCityDisplayName(pin.city, locale);
            return (
              <AdvancedMarker
                key={pin.slug}
                position={{ lat: pin.lat, lng: pin.lng }}
                anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM_CENTER}
                title={t("pinAria", { name: pin.name, city: cityName })}
                zIndex={active ? 2 : 1}
                onClick={() => onSelect(pin.slug)}
              >
                <CompanyPin active={active} label={pin.name} />
              </AdvancedMarker>
            );
          })}
        </Map>
        {selectedPin ? (
          <div className="absolute inset-x-3 bottom-3 z-10 sm:right-auto sm:left-3">
            <div className="rounded-xl border border-border bg-surface shadow-lg">
              <CompanyMapPinCard
                pin={selectedPin}
                locale={locale}
                onClose={onClose}
                className="w-full sm:w-72"
              />
            </div>
          </div>
        ) : null}
      </div>
    </APIProvider>
  );
}

export default CompaniesGoogleMapCanvas;
