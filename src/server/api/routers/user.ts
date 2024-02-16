import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import {
  queryUserSchema,
} from "@/server/api/types/user";

import * as userService from "@/server/service/user"

export const user = createTRPCRouter({
  find: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return await userService.findById(input)
  }),

  self: protectedProcedure.query(async ({ ctx }) => {
    return await userService.findByIdWithInfo(ctx.session?.user?.id)
  }),

  update: protectedProcedure
    .input(queryUserSchema)
    .mutation(async ({ ctx, input }) => {
      return await userService.updateUserInfo(ctx.session?.user?.id, input)
    }),
});
