import { Queue } from "bullmq";
import * as redis_conf from "@/jobs/redis_conf";
import type { KeyWordsSubscription } from "@prisma/client";

export const QUEUE_NAMES = {
  CREATED: "searchQueryCreatedSubscriptionMailer",
  COMPLETED: "searchQueryCompletedSubscriptionMailer",
};

let searchQueryCreatedSubscriptionMailerQueue: Queue<
  KeyWordsSubscription,
  void,
  string
>;

export function getSearchQueryCreatedSubscriptionMailerQueue() {
  if (!searchQueryCreatedSubscriptionMailerQueue) {
    searchQueryCreatedSubscriptionMailerQueue = new Queue(QUEUE_NAMES.CREATED, {
      connection: redis_conf.config,
    });
  }
  return searchQueryCreatedSubscriptionMailerQueue;
}

export const searchQueryCompletedSubscriptionMailerQueue = new Queue(
  QUEUE_NAMES.COMPLETED,
  {
    connection: redis_conf.config,
  },
);
