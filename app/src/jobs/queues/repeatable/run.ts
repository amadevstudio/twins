import { Queue } from "bullmq";

import * as redis_conf from "../../redis_conf.js";
import { config } from "./config.js";

for (const repeating_job of config) {
  const queue = new Queue(repeating_job.queue_name, {
    connection: redis_conf.config,
  });

  console.log(
    `Removing ${repeating_job.name} with ${JSON.stringify(repeating_job.repeat)})`,
  );
  const removed = await queue.removeRepeatable(
    repeating_job.name,
    repeating_job.repeat,
  );
  console.log(`Removed ${repeating_job.name}: ${removed}`);

  console.log(`Staring ${repeating_job.name} with ${JSON.stringify(repeating_job.repeat)}`)
  await queue.add(repeating_job.name, repeating_job.data, {
    repeat: repeating_job.repeat,
  });
}

console.log("Done, exiting");
process.exit();
