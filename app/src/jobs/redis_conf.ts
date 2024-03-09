import { env } from "@/env";

export const config: { host: string; password: string } = {
  host: env.REDIS_SERVER,
  password: env.REDIS_PASSWORD,
};
