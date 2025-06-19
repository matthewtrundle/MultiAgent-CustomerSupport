import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { prisma } from '@/lib/db/prisma';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';

export class SocketManager {
  private io: SocketServer;
  private orchestrator: AgentOrchestrator;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    this.orchestrator = new AgentOrchestrator();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Join ticket room
      socket.on('join:ticket', async (ticketId: string) => {
        socket.join(`ticket:${ticketId}`);
        socket.emit('joined:ticket', ticketId);
      });

      // Leave ticket room
      socket.on('leave:ticket', (ticketId: string) => {
        socket.leave(`ticket:${ticketId}`);
      });

      // Handle new message
      socket.on('message:send', async (data: {
        ticketId: string;
        content: string;
        customerId: string;
      }) => {
        try {
          // Save customer message
          const message = await prisma.message.create({
            data: {
              ticketId: data.ticketId,
              content: data.content,
              customerId: data.customerId,
            },
            include: {
              customer: true,
            },
          });

          // Broadcast to all clients in the ticket room
          this.io.to(`ticket:${data.ticketId}`).emit('message:new', {
            ...message,
            sender: 'customer',
          });

          // Process with AI agents
          this.processTicketWithAgents(data.ticketId);
        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Subscribe to agent updates
      socket.on('subscribe:agents', () => {
        socket.join('agents:activity');
      });

      // Subscribe to dashboard metrics
      socket.on('subscribe:metrics', () => {
        socket.join('metrics:realtime');
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  private async processTicketWithAgents(ticketId: string) {
    try {
      // Emit processing started
      this.io.to(`ticket:${ticketId}`).emit('agent:processing', {
        ticketId,
        status: 'started',
      });

      // Process with orchestrator
      const result = await this.orchestrator.processTicket(ticketId);

      if (result.success && result.response) {
        // Create agent message
        const agentMessage = await prisma.message.create({
          data: {
            ticketId,
            content: result.response,
            agentType: result.agentType,
            metadata: {
              confidence: result.confidence,
            },
          },
        });

        // Emit agent response
        this.io.to(`ticket:${ticketId}`).emit('message:new', {
          ...agentMessage,
          sender: 'agent',
        });

        // Update agent activity
        this.io.to('agents:activity').emit('agent:activity', {
          agentType: result.agentType,
          status: 'completed',
          ticketId,
          confidence: result.confidence,
        });
      } else {
        this.io.to(`ticket:${ticketId}`).emit('agent:error', {
          ticketId,
          error: result.error || 'Failed to process ticket',
        });
      }
    } catch (error) {
      console.error('Error processing ticket:', error);
      this.io.to(`ticket:${ticketId}`).emit('agent:error', {
        ticketId,
        error: 'An unexpected error occurred',
      });
    }
  }

  // Emit real-time metrics updates
  public async emitMetricsUpdate() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const [totalTickets, resolvedTickets, avgResponseTime] = await Promise.all([
        prisma.ticket.count({
          where: { createdAt: { gte: oneHourAgo } },
        }),
        prisma.ticket.count({
          where: { 
            status: 'RESOLVED',
            resolvedAt: { gte: oneHourAgo },
          },
        }),
        prisma.ticketMetrics.aggregate({
          where: { createdAt: { gte: oneHourAgo } },
          _avg: { firstResponseTime: true },
        }),
      ]);

      this.io.to('metrics:realtime').emit('metrics:update', {
        totalTickets,
        resolvedTickets,
        avgResponseTime: avgResponseTime._avg.firstResponseTime || 0,
        timestamp: now,
      });
    } catch (error) {
      console.error('Error emitting metrics:', error);
    }
  }

  // Emit agent activity updates
  public emitAgentActivity(activity: any) {
    this.io.to('agents:activity').emit('agent:activity', activity);
  }
}