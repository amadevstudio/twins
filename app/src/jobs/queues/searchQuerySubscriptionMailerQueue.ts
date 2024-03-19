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

let searchQueryCompletedSubscriptionMailerQueue: Queue<
  { id: string; searcher_id: string; candidate_id: string },
  void,
  string
>;
export function getSearchQueryCompletedSubscriptionMailerQueue() {
  if (!searchQueryCompletedSubscriptionMailerQueue) {
    searchQueryCompletedSubscriptionMailerQueue = new Queue(
      QUEUE_NAMES.COMPLETED,
      {
        connection: redis_conf.config,
      },
    );
  }
  return searchQueryCompletedSubscriptionMailerQueue;
}
