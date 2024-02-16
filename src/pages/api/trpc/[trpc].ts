import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import {createContextInner, createTRPCContext} from "@/server/api/trpc";
import {createServerSideHelpers} from "@trpc/react-query/server";
import superjson from "superjson";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
          );
        }
      : undefined,
});

export const serverSideHelper = createServerSideHelpers({
  router: appRouter,
  ctx: await createContextInner(),
  transformer: superjson, // optional - adds superjson serialization
});
