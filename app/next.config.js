/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  logging: {
    fetches: {
      fullUrl: true
    }
  },

  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/uploads/:path*"
      }
    ]
  },

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["ru"],
    defaultLocale: "ru",
  },
  output: "standalone",
};

export default config;
