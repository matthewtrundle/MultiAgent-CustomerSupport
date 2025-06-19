import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';
import { type User } from '@prisma/client';

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts;
  let user: User | null = null;

  // In demo mode, create a default user
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    user = {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User',
      password: '',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  } else {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }

  return {
    prisma,
    user,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});