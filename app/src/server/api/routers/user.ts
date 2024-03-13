import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import {
  queryUserSchema,
  searchUserSchema,
  searchUserType,
} from "@/server/api/types/user";

import * as userService from "@/server/service/user";

export const user = createTRPCRouter({
  findByEmail: publicProcedure
    .input(z.string().email())
    .query(async ({ ctx, input }) => {
      return await userService.findByEmail(input);
    }),

  findById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return await userService.findById(input);
  }),

  findByKeyWords: publicProcedure
    .input(searchUserSchema)
    .query(async ({ ctx, input }) => {
      return await userService.findByKeyWords(ctx.session?.user?.id, input);
    }),

  getUserAnon: publicProcedure
    .query(async ({ctx}) => {
      return await userService.findByReqIdAnon(ctx.req!);
    }),

  // Protected below

  self: protectedProcedure.query(async ({ ctx }) => {
    return await userService.findByIdWithInfo(ctx.session?.user?.id);
  }),

  selfAvatar: protectedProcedure.query(async ({ctx}) => {
    return await userService.findAvatarById(ctx.session?.user?.id);
  }),

  update: protectedProcedure
    .input(queryUserSchema)
    .mutation(async ({ ctx, input }) => {
      return await userService.updateUserInfo(ctx.session?.user?.id, input);
    }),
});
