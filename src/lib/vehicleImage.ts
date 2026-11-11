export interface VehicleImageSource {
  photos?: readonly (string | null | undefined)[] | null;
  photoUrl?: string | null;
  categoryImageUrl?: string | null;
}

function firstNonEmpty(
  ...values: Array<string | null | undefined>
): string | null {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return null;
}

export function vehicleImageUrl(vehicle: VehicleImageSource): string | null {
  const firstPhoto = vehicle.photos?.find((url): url is string =>
    Boolean(url?.trim()),
  );

  return firstNonEmpty(firstPhoto, vehicle.photoUrl, vehicle.categoryImageUrl);
}

export function vehicleImageUrls(vehicle: VehicleImageSource): string[] {
  const photos = (vehicle.photos ?? []).filter((url): url is string =>
    Boolean(url?.trim()),
  );
  if (photos.length > 0) {
    return photos;
  }

  const fallback = firstNonEmpty(vehicle.photoUrl, vehicle.categoryImageUrl);
  return fallback ? [fallback] : [];
}
