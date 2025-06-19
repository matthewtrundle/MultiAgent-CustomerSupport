import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const customersRouter = router({
  create: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string(),
      company: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.customer.findUnique({
        where: { email: input.email }
      });

      if (exists) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Customer already exists',
        });
      }

      const customer = await ctx.prisma.customer.create({
        data: input,
      });

      return customer;
    }),

  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search } = input;
      
      const where = search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { company: { contains: search, mode: 'insensitive' as const } },
        ]
      } : {};

      const customers = await ctx.prisma.customer.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (customers.length > limit) {
        const nextItem = customers.pop();
        nextCursor = nextItem!.id;
      }

      return {
        customers,
        nextCursor,
      };
    }),

  get: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.id },
        include: {
          tickets: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          }
        }
      });

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        });
      }

      return customer;
    }),
});