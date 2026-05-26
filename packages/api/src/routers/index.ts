import type { Context } from "../context";

import { contract } from "../index";

export function createRouter(ctx: Context) {
  return {
    healthCheck: async () => {
      return {
        status: 200 as const,
        body: "OK" as const,
      };
    },
    privateData: async () => {
      if (!ctx.session) {
        return {
          status: 401 as const,
          body: {
            message: "Authentication required",
          },
        };
      }
      return {
        status: 200 as const,
        body: {
          message: "This is private",
          user: ctx.session.user,
        },
      };
    },
  };
}

export type AppRouter = ReturnType<typeof createRouter>;
