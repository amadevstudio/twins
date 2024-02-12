import {createTRPCRouter, protectedProcedure, publicProcedure} from "@/server/api/trpc";
import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100)
});

export const userRouter = createTRPCRouter({
  userById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.db.user.findFirst({ where: { id: input } });
  }),

  self: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findFirst({ where: { id: ctx.session?.user?.id } });
  }),

  update: protectedProcedure.input(updateUserSchema).mutation(async ({ ctx, input }) => {
    return ctx.db.user.update({data: input, where: {id: ctx.session?.user?.id}});
  })
});
