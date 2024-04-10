import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import * as registrationTargetService from "@/server/service/registrationTarget";
import { z } from "zod";

export const registrationTarget = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return registrationTargetService.getAll();
  }),

  getAllRT: publicProcedure
    .meta({ openapi: { method: "GET", path: "/getAllRT" } })
    .input(z.object({}))
    .output(z.array(z.object({ target: z.string() })))
    .query(async () => {
      return registrationTargetService.getAll();
    }),
});
