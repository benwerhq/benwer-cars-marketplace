"use client";

import { guestNotificationsApi } from "@/services/api/guestNotifications";

const SW_PATH = "/sw.js";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function canUseGuestWebPush(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getWebPushPermission(): NotificationPermission | "unsupported" {
  if (!canUseGuestWebPush()) {
    return "unsupported";
  }
  return Notification.permission;
}

export async function getActiveGuestPushSubscription(): Promise<PushSubscription | null> {
  if (!canUseGuestWebPush()) {
    return null;
  }
  const registration = await navigator.serviceWorker.getRegistration(SW_PATH);
  if (!registration) {
    return null;
  }
  return registration.pushManager.getSubscription();
}

export async function enableGuestWebPush(
  locale: string,
): Promise<"enabled" | "denied" | "unavailable"> {
  if (!canUseGuestWebPush()) {
    return "unavailable";
  }
  const { publicKey } = await guestNotificationsApi.vapidPublicKey();
  if (!publicKey) {
    return "unavailable";
  }
  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();
  if (permission !== "granted") {
    return "denied";
  }

  const registration = await navigator.serviceWorker.register(SW_PATH);
  await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const p256dh = arrayBufferToBase64Url(subscription.getKey("p256dh"));
  const auth = arrayBufferToBase64Url(subscription.getKey("auth"));
  await guestNotificationsApi.registerWebPush({
    endpoint: subscription.endpoint,
    p256dh,
    auth,
    locale,
  });
  return "enabled";
}

export async function disableGuestWebPush(): Promise<void> {
  const subscription = await getActiveGuestPushSubscription();
  if (!subscription) {
    return;
  }
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await guestNotificationsApi.removeWebPush(endpoint);
}
