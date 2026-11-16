import { PublicChannel } from "@/enums";

export const PREVIEW_TOKEN_MIN = 16;
export const PREVIEW_TOKEN_MAX = 256;

export function channelQuery(
  channel?: PublicChannel,
): { channel?: PublicChannel } {
  return channel ? { channel } : {};
}

export function previewQueryValue(preview?: string): string | undefined {
  const token = preview?.trim();
  if (!token) {
    return undefined;
  }

  if (token.length < PREVIEW_TOKEN_MIN || token.length > PREVIEW_TOKEN_MAX) {
    return undefined;
  }

  return token;
}
