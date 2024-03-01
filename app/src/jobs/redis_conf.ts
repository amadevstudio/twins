import 'dotenv/config'

export const config = {
  host: process.env.REDIS_SERVER,
  password: process.env.REDIS_PASSWORD,
};
