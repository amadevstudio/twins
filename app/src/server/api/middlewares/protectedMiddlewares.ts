import { NextApiResponse } from "next";
import { unsetCookie } from "@/utils/cookies";

export function unsetAnonCookies(res: NextApiResponse | undefined) {
  if (res !== undefined) {
    unsetCookie(res, "anonUserId");
  }
}
