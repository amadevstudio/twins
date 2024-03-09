import { Queue } from "bullmq";
import * as redis_conf from "@/jobs/redis_conf";

const searchQuerySubscriptionMailerQueue = new Queue(
  "searchQuerySubscriptionMailer",
  {
    connection: redis_conf.config,
  },
);

export default searchQuerySubscriptionMailerQueue;
