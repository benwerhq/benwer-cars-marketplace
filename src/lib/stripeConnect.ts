import { loadStripe, type Stripe } from "@stripe/stripe-js";

const cache = new Map<string, Promise<Stripe | null>>();

export function loadConnectedStripe(
  publishableKey: string,
  connectedAccountId: string,
): Promise<Stripe | null> {
  const cacheKey = `${publishableKey}:${connectedAccountId}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const loaded = loadStripe(publishableKey, {
    stripeAccount: connectedAccountId,
  });
  cache.set(cacheKey, loaded);
  return loaded;
}

export function stripeAppearance(): {
  theme: "stripe" | "night";
  variables: {
    colorPrimary: string;
    colorBackground: string;
    colorText: string;
    colorDanger: string;
    borderRadius: string;
  };
} {
  if (typeof document === "undefined") {
    return {
      theme: "stripe",
      variables: {
        colorPrimary: "var(--primary)",
        colorBackground: "var(--surface)",
        colorText: "var(--foreground)",
        colorDanger: "var(--danger)",
        borderRadius: "8px",
      },
    };
  }

  const styles = getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();

  return {
    theme: document.documentElement.classList.contains("dark")
      ? "night"
      : "stripe",
    variables: {
      colorPrimary: token("--primary"),
      colorBackground: token("--surface"),
      colorText: token("--foreground"),
      colorDanger: token("--danger"),
      borderRadius: "8px",
    },
  };
}
