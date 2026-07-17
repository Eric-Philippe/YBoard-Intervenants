import { initTRPC, TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";
import { getJwtSecret } from "~/server/jwt";

function decodeUserId(headers: Headers): string | null {
  const authHeader = headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;
  try {
    // The algorithm is pinned: without it, the library accepts any algorithm the
    // token itself declares, which opens the door to confusion attacks.
    const payload = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
    if (typeof payload === "object" && payload && "userId" in payload) {
      return String((payload as { userId: unknown }).userId);
    }
    return null;
  } catch {
    return null;
  }
}
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    userId: decodeUserId(opts.headers),
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Never ship the server stack trace to the client: it leaks absolute
        // file paths and internal structure.
        stack: undefined,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Non authentifie" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(authMiddleware);
