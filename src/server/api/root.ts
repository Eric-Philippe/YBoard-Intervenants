import { authRouter } from "~/server/api/routers/auth";
import { teachersRouter } from "~/server/api/routers/teachers";
import { promosRouter } from "~/server/api/routers/promos";
import { modulesRouter } from "~/server/api/routers/modules";
import { promoModulesRouter } from "~/server/api/routers/promoModules";
import { relationsRouter } from "~/server/api/routers/relations";
import { usersRouter } from "~/server/api/routers/users";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  teachers: teachersRouter,
  promos: promosRouter,
  modules: modulesRouter,
  promoModules: promoModulesRouter,
  relations: relationsRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
