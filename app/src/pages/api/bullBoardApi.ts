import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import express, { type RequestHandler } from "express";

import { config } from "@/jobs/queues/repeatable/config";
import { Queue } from "bullmq";
import * as redis_conf from "@/jobs/redis_conf";

const queues = config.map((queueConfig) => {
  const queue = new Queue(queueConfig.queue_name, {
    connection: redis_conf.config,
  });

  return new BullMQAdapter(queue);
});

const basePath = "/api/bullBoardApi";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath(basePath);

createBullBoard({
  queues,
  serverAdapter,
});

// const handler =
express().use(
  basePath,
  serverAdapter.getRouter() as RequestHandler,
);

// TODO: make it works
// export default handler;
