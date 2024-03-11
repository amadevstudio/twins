import { Queue } from "bullmq";
import * as redis_conf from "@/jobs/redis_conf";

export const QUEUE_NAMES = {
  CREATED: "searchQueryCreatedSubscriptionMailer",
  COMPLETED: "searchQueryCompletedSubscriptionMailer",
};

export const searchQueryCreatedSubscriptionMailerQueue = new Queue(
  QUEUE_NAMES.CREATED,
  {
    connection: redis_conf.config,
  },
);

export const searchQueryCompletedSubscriptionMailerQueue = new Queue(
  QUEUE_NAMES.COMPLETED,
  {
    connection: redis_conf.config,
  },
);
