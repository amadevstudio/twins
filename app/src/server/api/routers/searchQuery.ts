import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import * as searchQuerySubscriptionService from "@/server/service/searchQuerySubscription";
import { z } from "zod";
import { subscribeAnonSchema } from "@/server/api/types/searchQuery";
import { subscribeAnon } from "@/server/service/searchQuerySubscriptionUnsafe";

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
    .input(z.string().min(1))
    .mutation(async ({ ctx, input }) => {
      return await searchQuerySubscriptionService.subscribe(
        ctx.session?.user?.id,
        input,
      );
    }),

  findByQueryAnon: publicProcedure
    // TODO: improve security
    // Anyone can subscribe emails on any queries!
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await searchQuerySubscriptionService.findByQueryAnon(
        ctx.req!,
        input,
      );
    }),

  subscribeAnon: publicProcedure
    .input(subscribeAnonSchema)
    .mutation(async ({ ctx, input }) => {
      return await subscribeAnon(ctx.res!, input.email, input.query);
    }),
});
