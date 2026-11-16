import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { defaultPublicUrls } from "./lib/envDefaults";

const fallbackUrls = defaultPublicUrls();

export const env = createEnv({
  server: {
    API_ORIGIN: z.string().url().optional(),
    GUEST_APP_APPLE_TEAM_ID: z.string().optional(),
    GUEST_APP_ANDROID_SHA256_FINGERPRINTS: z.string().optional(),
    GUEST_APP_IOS_BUNDLE_ID: z.string().optional(),
    GUEST_APP_ANDROID_PACKAGE: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3002"),
    NEXT_PUBLIC_MARKETPLACE_DOMAIN: z.string().min(1).default("benwer.es"),
    NEXT_PUBLIC_PLATFORM_HOSTS: z.string().optional(),
    NEXT_PUBLIC_ENV: z
      .enum(["local", "staging", "production"])
      .default(process.env.NODE_ENV === "production" ? "production" : "local"),
    NEXT_PUBLIC_MARKETING_URL: z
      .string()
      .url()
      .default(fallbackUrls.marketing),
    NEXT_PUBLIC_ADMIN_DEMO_URL: z.string().url().optional(),
    NEXT_PUBLIC_ADMIN_URL: z
      .string()
      .url()
      .default(fallbackUrls.admin),
    NEXT_PUBLIC_MEDIA_ORIGIN: z.string().url().optional(),
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER: z.string().optional(),
    NEXT_PUBLIC_GUEST_BOOKING_FIELDS: z.enum(["true", "false"]).optional(),
    NEXT_PUBLIC_STAFF_FIREBASE_API_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_STAFF_FIREBASE_AUTH_DOMAIN: z.string().min(1).optional(),
    NEXT_PUBLIC_STAFF_FIREBASE_PROJECT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_STAFF_FIREBASE_APP_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_STAFF_FIREBASE_TENANT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_GUEST_FIREBASE_API_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_GUEST_FIREBASE_AUTH_DOMAIN: z.string().min(1).optional(),
    NEXT_PUBLIC_GUEST_FIREBASE_PROJECT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_GUEST_FIREBASE_APP_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_GUEST_FIREBASE_TENANT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_GUEST_APP_IOS_URL: z.string().url().optional(),
    NEXT_PUBLIC_GUEST_APP_ANDROID_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    API_ORIGIN: process.env.API_ORIGIN,
    GUEST_APP_APPLE_TEAM_ID: process.env.GUEST_APP_APPLE_TEAM_ID,
    GUEST_APP_ANDROID_SHA256_FINGERPRINTS:
      process.env.GUEST_APP_ANDROID_SHA256_FINGERPRINTS,
    GUEST_APP_IOS_BUNDLE_ID: process.env.GUEST_APP_IOS_BUNDLE_ID,
    GUEST_APP_ANDROID_PACKAGE: process.env.GUEST_APP_ANDROID_PACKAGE,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_MARKETPLACE_DOMAIN: process.env.NEXT_PUBLIC_MARKETPLACE_DOMAIN,
    NEXT_PUBLIC_PLATFORM_HOSTS: process.env.NEXT_PUBLIC_PLATFORM_HOSTS,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXT_PUBLIC_MARKETING_URL: process.env.NEXT_PUBLIC_MARKETING_URL,
    NEXT_PUBLIC_ADMIN_DEMO_URL: process.env.NEXT_PUBLIC_ADMIN_DEMO_URL,
    NEXT_PUBLIC_ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL,
    NEXT_PUBLIC_MEDIA_ORIGIN: process.env.NEXT_PUBLIC_MEDIA_ORIGIN,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID,
    NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER:
      process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER,
    NEXT_PUBLIC_GUEST_BOOKING_FIELDS: process.env.NEXT_PUBLIC_GUEST_BOOKING_FIELDS,
    NEXT_PUBLIC_STAFF_FIREBASE_API_KEY:
      process.env.NEXT_PUBLIC_STAFF_FIREBASE_API_KEY,
    NEXT_PUBLIC_STAFF_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_STAFF_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_STAFF_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_STAFF_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_STAFF_FIREBASE_APP_ID:
      process.env.NEXT_PUBLIC_STAFF_FIREBASE_APP_ID,
    NEXT_PUBLIC_STAFF_FIREBASE_TENANT_ID:
      process.env.NEXT_PUBLIC_STAFF_FIREBASE_TENANT_ID,
    NEXT_PUBLIC_GUEST_FIREBASE_API_KEY:
      process.env.NEXT_PUBLIC_GUEST_FIREBASE_API_KEY,
    NEXT_PUBLIC_GUEST_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_GUEST_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_GUEST_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_GUEST_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_GUEST_FIREBASE_APP_ID:
      process.env.NEXT_PUBLIC_GUEST_FIREBASE_APP_ID,
    NEXT_PUBLIC_GUEST_FIREBASE_TENANT_ID:
      process.env.NEXT_PUBLIC_GUEST_FIREBASE_TENANT_ID,
    NEXT_PUBLIC_GUEST_APP_IOS_URL: process.env.NEXT_PUBLIC_GUEST_APP_IOS_URL,
    NEXT_PUBLIC_GUEST_APP_ANDROID_URL:
      process.env.NEXT_PUBLIC_GUEST_APP_ANDROID_URL,
  },
  emptyStringAsUndefined: true,
});
