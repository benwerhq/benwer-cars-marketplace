import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    API_ORIGIN: z.string().url().optional(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3002"),
    NEXT_PUBLIC_MARKETPLACE_DOMAIN: z.string().min(1).default("benwer.es"),
    NEXT_PUBLIC_ENV: z
      .enum(["local", "staging", "production"])
      .default(process.env.NODE_ENV === "production" ? "production" : "local"),
    NEXT_PUBLIC_MARKETING_URL: z
      .string()
      .url()
      .default("https://cars.benwer.es"),
    NEXT_PUBLIC_ADMIN_DEMO_URL: z.string().url().optional(),
    NEXT_PUBLIC_ADMIN_URL: z
      .string()
      .url()
      .default("https://cars-admin.benwer.es"),
    NEXT_PUBLIC_MEDIA_ORIGIN: z.string().url().optional(),
    NEXT_PUBLIC_STAFF_FIREBASE_API_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_STAFF_FIREBASE_AUTH_DOMAIN: z.string().min(1).optional(),
    NEXT_PUBLIC_STAFF_FIREBASE_PROJECT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_STAFF_FIREBASE_APP_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_STAFF_FIREBASE_TENANT_ID: z.string().min(1).optional(),
  },
  runtimeEnv: {
    API_ORIGIN: process.env.API_ORIGIN,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_MARKETPLACE_DOMAIN: process.env.NEXT_PUBLIC_MARKETPLACE_DOMAIN,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXT_PUBLIC_MARKETING_URL: process.env.NEXT_PUBLIC_MARKETING_URL,
    NEXT_PUBLIC_ADMIN_DEMO_URL: process.env.NEXT_PUBLIC_ADMIN_DEMO_URL,
    NEXT_PUBLIC_ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL,
    NEXT_PUBLIC_MEDIA_ORIGIN: process.env.NEXT_PUBLIC_MEDIA_ORIGIN,
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
  },
  emptyStringAsUndefined: true,
});
