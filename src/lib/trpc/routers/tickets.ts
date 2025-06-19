import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';

export const ticketsRouter = router({
  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      customerId: z.string(),
      category: z.nativeEnum(TicketCategory),
      priority: z.nativeEnum(TicketPriority).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.prisma.ticket.create({
        data: {
          ...input,
          status: TicketStatus.OPEN,
        },
        include: {
          customer: true,
          messages: true,
        }
      });
      
      return ticket;
    }),

  list: protectedProcedure
    .input(z.object({
      status: z.nativeEnum(TicketStatus).optional(),
      category: z.nativeEnum(TicketCategory).optional(),
      assignedToId: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor, ...filters } = input;
      
      const tickets = await ctx.prisma.ticket.findMany({
        where: filters,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          assignedTo: true,
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          },
          metrics: true,
        }
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (tickets.length > limit) {
        const nextItem = tickets.pop();
        nextCursor = nextItem!.id;
      }

      return {
        tickets,
        nextCursor,
      };
    }),

  get: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const ticket = await ctx.prisma.ticket.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          assignedTo: true,
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              senderUser: true,
              customer: true,
            }
          },
          handlings: {
            include: {
              agent: true,
            }
          },
          metrics: true,
        }
      });

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Ticket not found',
        });
      }

      return ticket;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.nativeEnum(TicketStatus).optional(),
      priority: z.nativeEnum(TicketPriority).optional(),
      assignedToId: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const ticket = await ctx.prisma.ticket.update({
        where: { id },
        data: {
          ...data,
          resolvedAt: data.status === TicketStatus.RESOLVED ? new Date() : undefined,
        },
        include: {
          customer: true,
          assignedTo: true,
        }
      });

      return ticket;
    }),

  addMessage: protectedProcedure
    .input(z.object({
      ticketId: z.string(),
      content: z.string(),
      isInternal: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.message.create({
        data: {
          ticketId: input.ticketId,
          content: input.content,
          senderId: ctx.user.id,
          isInternal: input.isInternal,
        },
        include: {
          senderUser: true,
        }
      });

      await ctx.prisma.ticket.update({
        where: { id: input.ticketId },
        data: { updatedAt: new Date() }
      });

      return message;
    }),
});