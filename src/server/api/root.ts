import { authRouter } from "~/server/api/routers/auth";
import { teachersRouter } from "~/server/api/routers/teachers";
import { promosRouter } from "~/server/api/routers/promos";
import { modulesRouter } from "~/server/api/routers/modules";
import { promoModulesRouter } from "~/server/api/routers/promoModules";
import { relationsRouter } from "~/server/api/routers/relations";
import { usersRouter } from "~/server/api/routers/users";
import { surveyRouter } from "~/server/api/routers/survey";
import { surveyAdminRouter } from "~/server/api/routers/surveyAdmin";
import { perimetersRouter } from "~/server/api/routers/perimeters";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  teachers: teachersRouter,
  promos: promosRouter,
  modules: modulesRouter,
  promoModules: promoModulesRouter,
  relations: relationsRouter,
  users: usersRouter,
  survey: surveyRouter,
  surveyAdmin: surveyAdminRouter,
  perimeters: perimetersRouter,
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
