import {env} from "@/env";

export function userAvatarUrl(path: string) {
  return `/api/user/getAvatar?avatar=${path}`;
}
