import { Worker } from "bullmq";

import * as redis_conf from "../redis_conf";
import { findUserIntersection } from "@/server/service/searchQuerySubscription";
import searchQuerySubscriptionMailer from "@/jobs/queues/searchQuerySubscriptionMailer";

const sendMailWorker = new Worker(
  "searchQuerySubscriptionMailer",
  async (job) => {
    console.log("Mailing...", job.data);
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
        await searchQuerySubscriptionMailer.add(
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
