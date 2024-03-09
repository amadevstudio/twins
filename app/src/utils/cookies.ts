import { type NextApiResponse } from "next";
import { type CookieSerializeOptions, serialize } from "cookie";
import { env } from "@/env";

const cookiesDefaultLifetimeMonths = 1;
const maxAgeSeconds = cookiesDefaultLifetimeMonths * 2_592_000; // 30 * 24 * 60 * 60

export function unsetCookie(
  res: NextApiResponse,
  name: string,
  options: CookieSerializeOptions | undefined = undefined,
) {
  setCookie(res, name, "", { ...options, expires: new Date(0), maxAge: 0 });
}

export function setCookie(
  res: NextApiResponse,
  name: string,
  value: string,
  options: CookieSerializeOptions | undefined = undefined,
) {
  const date = new Date();
  const expiresDate = new Date(date.setMonth(date.getMonth() + cookiesDefaultLifetimeMonths));

  const defaultOptions = {
    httpOnly: true,
    secure: env.NODE_ENV !== "development",
    path: "/",
    expires: expiresDate,
    maxAge: maxAgeSeconds,
    sameSite: true
  };
  const resultOptions = { ...defaultOptions, ...(options ?? {}) };
  res.setHeader("Set-Cookie", serialize(name, value, resultOptions));
}
