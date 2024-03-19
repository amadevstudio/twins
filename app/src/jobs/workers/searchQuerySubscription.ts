import { type Job, Worker } from "bullmq";

import * as redis_conf from "../redis_conf";
import {
  searchQuerySubscriptionCompletedMailer,
  searchQuerySubscriptionCreatedMailer,
} from "@/mailers/searchQuerySubscriptionMailer";
import {
  QUEUE_NAMES as MAILER_QUEUE_NAME,
  getSearchQueryCompletedSubscriptionMailerQueue,
} from "@/jobs/queues/searchQuerySubscriptionMailerQueue";
import * as userService from "@/server/service/user";
import * as searchQueryService from "@/server/service/searchQuerySubscription";
import { QUEUE_NAMES as REPEATABLE_QUEUE_NAMES } from "@/jobs/queues/repeatable/config";
import { findUserIntersection } from "@/server/service/searchQuerySubscription";
import { type KeyWordsSubscription } from "@prisma/client";

function initializeSendCreatedMailWorker() {
  new Worker(
    MAILER_QUEUE_NAME.CREATED,
    async (job: Job<KeyWordsSubscription, void, string>) => {
      const user = await userService.findById(job.data.userId);
      const subscription = await searchQueryService.findById(job.data.id);
      if (
        user?.email == null ||
        subscription == null ||
        subscription.status != "NEW"
      ) {
        return;
      }

      const searchKeyWords = subscription.keyWordsSubscriptionToKeyWords
        .map(
          (kwstkw: { keyWord: { keyWord: string } }) => kwstkw.keyWord.keyWord,
        )
        .join(" ");

      await searchQuerySubscriptionCreatedMailer(user.email, searchKeyWords);
    },
    {
      connection: redis_conf.config,
    },
  );
}
initializeSendCreatedMailWorker();

function initializeSendSuccessMailWorker() {
  new Worker(
    MAILER_QUEUE_NAME.COMPLETED,
    async (
      job: Job<
        { id: string; searcher_id: string; candidate_id: string },
        void,
        string
      >,
    ) => {
      const user = await userService.findById(job.data.searcher_id);
      const subscription = await searchQueryService.findById(job.data.id);
      const candidate = await userService.findById(job.data.candidate_id);
      if (
        user?.email == null ||
        candidate == null ||
        subscription == null ||
        subscription.status != "NEW"
      ) {
        return;
      }

      const searchKeyWords = subscription.keyWordsSubscriptionToKeyWords
        .map(
          (kwstkw: { keyWord: { keyWord: string } }) => kwstkw.keyWord.keyWord,
        )
        .join(" ");

      await searchQuerySubscriptionCompletedMailer(
        user.email,
        candidate.id,
        searchKeyWords,
      );

      await searchQueryService.setStatus(subscription.id, "COMPLETED");
    },
    {
      connection: redis_conf.config,
    },
  );
}
initializeSendSuccessMailWorker();

function initializeSearchQuerySubscriptionWorker() {
  new Worker(
    REPEATABLE_QUEUE_NAMES.SEARCH_QUERY_SUBSCRIPTION,
    async (_) => {
      const subscriptionUserIntersection = await findUserIntersection();
      await Promise.all(
        subscriptionUserIntersection.map(async (intersection) => {
          await getSearchQueryCompletedSubscriptionMailerQueue().add(
            `${MAILER_QUEUE_NAME.COMPLETED} for ${intersection.searcher_id},
subscriptionId is ${intersection.id}, candidate is ${intersection.candidate_id}`,
            intersection,
          );
        }),
      );
    },
    {
      connection: redis_conf.config,
    },
  );
}
initializeSearchQuerySubscriptionWorker();
