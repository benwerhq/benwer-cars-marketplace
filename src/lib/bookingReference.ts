/**
 * Short booking reference shared with the guest emails, admin and the guest app
 * (#A1B2C3: the last six characters of the reservation id).
 */
export function bookingReference(reservationId: string, fallbackToken = ""): string {
  const compact = reservationId.replaceAll("-", "");
  if (compact.length >= 6) {
    return `#${compact.slice(-6).toUpperCase()}`;
  }
  return fallbackToken.slice(0, 8).toUpperCase();
}
