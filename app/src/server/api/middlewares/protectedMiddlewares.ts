import { type NextApiResponse } from "next";
import { unsetCookie } from "@/utils/server/cookies";

export function unsetAnonCookies(res: NextApiResponse | undefined) {
  if (res !== undefined) {
    unsetCookie(res, "anonUserId");
  }
}
