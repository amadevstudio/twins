import { Queue } from "bullmq";

import * as redis_conf from "../../redis_conf.js";
import { config } from "./config.js";

await Promise.all(
  config.map(async (repeating_job) => {
    const queue = new Queue(repeating_job.queue_name, {
      connection: redis_conf.config,
    });

    const repeatableJobs = await queue.getRepeatableJobs();
    await Promise.all(
      repeatableJobs.map(async (repeatable_job) => {
        console.log(`Removing ${repeatable_job.key})`);

        const removed = await queue.removeRepeatableByKey(repeatable_job.key);

        console.log(`Removed ${repeatable_job.key}: ${removed}`);
      }),
    );
  }),
);

console.log("Done, exiting");
process.exit();
