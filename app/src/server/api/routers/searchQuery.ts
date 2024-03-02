import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import * as searchQuerySubscriptionService from "@/server/service/searchQuerySubscription";
import { z } from "zod";
import { findByQuery } from "@/server/service/searchQuerySubscription";

export const searchQuerySubscription = createTRPCRouter({
  findByQuery: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await searchQuerySubscriptionService.findByQuery(
        ctx.session?.user?.id,
        input,
      );
    }),

  subscribe: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await searchQuerySubscriptionService.subscribe(
        ctx.session?.user?.id,
        input,
      );
    }),
});
