import { Queue } from "bullmq";
import * as redis_conf from "@/jobs/redis_conf";

export const MAILER_QUEUE_NAME = "searchQuerySubscriptionMailer";

const searchQuerySubscriptionMailerQueue = new Queue(
  MAILER_QUEUE_NAME,
  {
    connection: redis_conf.config,
  },
);

export default searchQuerySubscriptionMailerQueue;
