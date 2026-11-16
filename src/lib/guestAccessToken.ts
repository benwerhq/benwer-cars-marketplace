type GuestAccessTokenProvider = () => Promise<string | null>;

let provider: GuestAccessTokenProvider | null = null;

export function setGuestAccessTokenProvider(
  next: GuestAccessTokenProvider | null,
): void {
  provider = next;
}

export function getGuestAccessToken(): Promise<string | null> {
  return provider ? provider() : Promise.resolve(null);
}
