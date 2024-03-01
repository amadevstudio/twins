import { Worker } from "bullmq";

import * as redis_conf from "../redis_conf";
import { findUserIntersection } from "@/server/service/searchQuerySubscription";

const worker = new Worker(
  "searchQuerySubscription",
  async (job) => {
    // Will print { foo: 'bar'} for the first job
    // and { qux: 'baz' } for the second.
    console.log(job.data);
  },
  {
    connection: redis_conf.config,
  },
);

export default worker;
