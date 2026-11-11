type StaffAccessTokenProvider = () => Promise<string | null>;

let provider: StaffAccessTokenProvider | null = null;

export function setStaffAccessTokenProvider(
  next: StaffAccessTokenProvider | null,
): void {
  provider = next;
}

export function getStaffAccessToken(): Promise<string | null> {
  return provider ? provider() : Promise.resolve(null);
}
