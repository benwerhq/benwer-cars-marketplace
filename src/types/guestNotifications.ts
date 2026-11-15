import type { components } from "@/services/api/schema";

type Schemas = components["schemas"];

export type GuestNotificationList = Schemas["GuestNotificationListDto"];
export type GuestNotification = GuestNotificationList["items"][number];
export type GuestNotificationUnreadCount = Schemas["GuestNotificationUnreadCountDto"];
export type GuestVapidKey = Schemas["GuestVapidKeyDto"];

export interface GuestWebPushRegistrationInput {
  endpoint: string;
  p256dh: string;
  auth: string;
  locale?: string;
}
