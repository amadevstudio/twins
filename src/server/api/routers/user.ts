import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import {
  queryUserSchema,
  queryUserType,
} from "@/server/api/types/user";

export const userRouter = createTRPCRouter({
  find: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.db.user.findFirst({ where: { id: input } });
  }),

  self: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findFirst({
      where: { id: ctx.session?.user?.id },
      include: {
        userInfo: true,
        userToKeyWords: {
          include: {
            keyWord: true,
          },
        },
        userToRegistrationTargets: {
          include: {
            registrationTarget: true,
          },
        },
      },
    });
  }),

  update: protectedProcedure
    .input(queryUserSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        data: {
          name: input.name,
          userInfo: {
            update: {
              data: {
                sex: input.sex,
              },
            },
          },
        },
        where: { id: ctx.session?.user?.id },
      });
    }),
});
