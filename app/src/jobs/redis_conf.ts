import { env } from "@/env";

export const config: { host: string; password: string } = {
  host: env.REDIS_SERVER as string,
  password: env.REDIS_PASSWORD as string,
};
