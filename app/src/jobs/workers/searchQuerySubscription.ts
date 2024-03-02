import { Job, Worker } from "bullmq";

import * as redis_conf from "../redis_conf";
import { findUserIntersection } from "@/server/service/searchQuerySubscription";
import { searchQuerySubscriptionMailer } from "@/mailers/searchQuerySubscriptionMailer";
import searchQuerySubscriptionMailerQueue from "@/jobs/queues/searchQuerySubscriptionMailerQueue";
import * as userService from "@/server/service/user";
import * as searchQueryService from "@/server/service/searchQuerySubscription";

const sendMailWorker = new Worker(
  "searchQuerySubscriptionMailer",
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
      .map((kwstkw) => kwstkw.keyWord.keyWord)
      .join(" ");

    await searchQuerySubscriptionMailer(user.email, candidate.id, searchKeyWords);

    await searchQueryService.setStatus(subscription.id, "COMPLETED");
  },
  {
    connection: redis_conf.config,
  },
);

const worker = new Worker(
  "searchQuerySubscription",
  async (_) => {
    const subscriptionUserIntersection = await findUserIntersection();
    await Promise.all(
      subscriptionUserIntersection.map(async (intersection) => {
        await searchQuerySubscriptionMailerQueue.add(
          "searchQuerySubscriptionMail",
          intersection,
        );
      }),
    );
  },
  {
    connection: redis_conf.config,
  },
);

export default worker;
