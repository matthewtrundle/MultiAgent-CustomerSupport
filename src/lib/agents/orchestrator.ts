import { Ticket, Message, AgentType } from '@prisma/client';
import { RouterAgent } from './router';
import { TechnicalSupportAgent } from './technical';
import { BillingAgent } from './billing';
import { ProductExpertAgent } from './product';
import { EscalationAgent } from './escalation';
import { QAAgent } from './qa';
import { BaseAgent, AgentContext, AgentResponse } from './base';
import { prisma } from '@/lib/db/prisma';

export class AgentOrchestrator {
  private agents: Map<AgentType, BaseAgent>;
  private routerAgent: RouterAgent;
  private qaAgent: QAAgent;

  constructor() {
    this.routerAgent = new RouterAgent();
    this.qaAgent = new QAAgent();
    
    this.agents = new Map([
      [AgentType.TECHNICAL, new TechnicalSupportAgent()],
      [AgentType.BILLING, new BillingAgent()],
      [AgentType.PRODUCT, new ProductExpertAgent()],
      [AgentType.ESCALATION, new EscalationAgent()],
    ]);
  }

  async processTicket(ticketId: string): Promise<{
    success: boolean;
    response?: string;
    agentType?: AgentType;
    confidence?: number;
    shouldEscalate?: boolean;
    error?: string;
  }> {
    try {
      // Fetch ticket with all related data
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          customer: true,
          messages: {
            orderBy: { createdAt: 'asc' }
          },
          handlings: true,
        }
      });

      if (!ticket) {
        return { success: false, error: 'Ticket not found' };
      }

      const context: AgentContext = {
        ticket,
        previousMessages: ticket.messages,
      };

      // Step 1: Route the ticket if it's new
      let targetAgentType: AgentType;
      
      if (ticket.status === 'OPEN' && ticket.handlings.length === 0) {
        const routingResponse = await this.routerAgent.processTicket(context);
        
        if (routingResponse.shouldEscalate) {
          targetAgentType = AgentType.ESCALATION;
        } else {
          // Extract the suggested agent from routing metadata
          const suggestedAgent = routingResponse.metadata?.suggestedAgent;
          targetAgentType = this.mapSuggestedAgentToType(suggestedAgent);
        }
      } else {
        // For ongoing conversations, use the last agent type or escalate
        const lastHandling = ticket.handlings[ticket.handlings.length - 1];
        targetAgentType = lastHandling?.agentType || AgentType.ROUTER;
      }

      // Step 2: Process with the target agent
      const targetAgent = this.agents.get(targetAgentType);
      
      if (!targetAgent) {
        return { 
          success: false, 
          error: `No agent available for type: ${targetAgentType}` 
        };
      }

      const agentResponse = await targetAgent.processTicket(context);

      // Step 3: QA Review (for non-escalation responses)
      let finalResponse: AgentResponse = agentResponse;
      
      if (targetAgentType !== AgentType.ESCALATION && !agentResponse.shouldEscalate) {
        // Create a temporary message for QA review
        const tempMessage: Message = {
          id: 'temp',
          content: agentResponse.content,
          ticketId: ticket.id,
          agentType: targetAgentType,
          senderId: null,
          customerId: null,
          isInternal: false,
          createdAt: new Date(),
          metadata: null,
        };

        const qaContext: AgentContext = {
          ...context,
          previousMessages: [...context.previousMessages, tempMessage],
        };

        const qaResponse = await this.qaAgent.processTicket(qaContext);
        
        // Use QA-approved response if available
        if (qaResponse.metadata?.qaApproved) {
          finalResponse = qaResponse;
        }
      }

      // Step 4: Save the response as a message
      await prisma.message.create({
        data: {
          ticketId: ticket.id,
          content: finalResponse.content,
          agentType: targetAgentType,
          isInternal: false,
          metadata: finalResponse.metadata,
        }
      });

      // Step 5: Update ticket status
      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: finalResponse.shouldEscalate ? 'ESCALATED' : 'IN_PROGRESS',
          assignedToId: finalResponse.shouldEscalate ? null : 'system', // Would be actual user ID
        }
      });

      return {
        success: true,
        response: finalResponse.content,
        agentType: targetAgentType,
        confidence: finalResponse.confidence,
        shouldEscalate: finalResponse.shouldEscalate,
      };

    } catch (error) {
      console.error('Orchestrator error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private mapSuggestedAgentToType(suggestedAgent: string): AgentType {
    const mapping: Record<string, AgentType> = {
      'TECHNICAL': AgentType.TECHNICAL,
      'BILLING': AgentType.BILLING,
      'PRODUCT': AgentType.PRODUCT,
      'ESCALATION': AgentType.ESCALATION,
    };

    return mapping[suggestedAgent] || AgentType.PRODUCT;
  }

  async getAgentMetrics(agentType: AgentType, days: number = 7): Promise<{
    totalHandled: number;
    avgConfidence: number;
    successRate: number;
    escalationRate: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const handlings = await prisma.ticketHandling.findMany({
      where: {
        agentType,
        startTime: { gte: startDate }
      }
    });

    const total = handlings.length;
    const successful = handlings.filter(h => h.successful).length;
    const avgConfidence = handlings.reduce((sum, h) => sum + (h.confidence || 0), 0) / total || 0;
    
    // Count escalations
    const escalations = await prisma.ticket.count({
      where: {
        handlings: {
          some: { agentType }
        },
        status: 'ESCALATED',
        updatedAt: { gte: startDate }
      }
    });

    return {
      totalHandled: total,
      avgConfidence,
      successRate: total > 0 ? successful / total : 0,
      escalationRate: total > 0 ? escalations / total : 0,
    };
  }
}