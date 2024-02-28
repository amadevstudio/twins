import { createTRPCRouter } from "@/server/api/trpc";

import {user} from "@/server/api/routers/user";
import {registrationTarget} from "@/server/api/routers/registrationTarget";
import {searchQuerySubscription} from "@/server/api/routers/searchQuery";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user,
  registrationTarget,
  searchQuerySubscription
});

// export type definition of API
export type AppRouter = typeof appRouter;
