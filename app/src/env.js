import 'dotenv/config'
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),

    REDIS_SERVER: z.string(),
    REDIS_PASSWORD: z.string(),

    DATABASE_URL: z
      .string()
      // .url()
      .refine(
        (str) => !str.includes("YOUR_MYSQL_URL_HERE"),
        "You forgot to change the default URL"
      ),

    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url()
    ),
    NEXTAUTH_EMAIL_HOST: z.string(),
    NEXTAUTH_EMAIL_PORT: z.string(),
    NEXTAUTH_EMAIL_USER: z.string(),
    NEXTAUTH_EMAIL_PASSWORD: z.string(),
    NEXTAUTH_EMAIL_FROM: z.string().email(),
    NEXTAUTH_GOOGLE_ID: z.string(),
    NEXTAUTH_GOOGLE_SECRET: z.string()
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_PROJECT_NAME: z.string(),
    NEXT_PUBLIC_DOMAIN: z.string().url(),
    NEXT_PUBLIC_SUPPORT_EMAIL: z.string().email(),

    NEXT_PUBLIC_MAX_KEY_WORDS: z.string()
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    NEXT_PUBLIC_PROJECT_NAME: process.env.NEXT_PUBLIC_PROJECT_NAME,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
    NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,

    NEXT_PUBLIC_MAX_KEY_WORDS: process.env.NEXT_PUBLIC_MAX_KEY_WORDS,

    REDIS_SERVER: process.env.REDIS_SERVER,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,

    DATABASE_URL: process.env.DATABASE_URL,

    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_EMAIL_HOST: process.env.NEXTAUTH_EMAIL_HOST,
    NEXTAUTH_EMAIL_PORT: process.env.NEXTAUTH_EMAIL_PORT,
    NEXTAUTH_EMAIL_USER: process.env.NEXTAUTH_EMAIL_USER,
    NEXTAUTH_EMAIL_PASSWORD: process.env.NEXTAUTH_EMAIL_PASSWORD,
    NEXTAUTH_EMAIL_FROM: process.env.NEXTAUTH_EMAIL_FROM,
    NEXTAUTH_GOOGLE_ID: process.env.NEXTAUTH_GOOGLE_ID,
    NEXTAUTH_GOOGLE_SECRET: process.env.NEXTAUTH_GOOGLE_SECRET,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
