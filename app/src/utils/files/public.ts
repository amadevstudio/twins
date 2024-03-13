import {env} from "@/env";

export function publicUrl(path: string) {
  return `${env.NEXT_PUBLIC_UPLOAD_PATH}/${path}`;
}
