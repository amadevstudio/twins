import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import * as registrationTargetService from "@/server/service/registrationTarget";

export const registrationTarget = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return registrationTargetService.getAll();
  }),
});
