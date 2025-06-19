import { BaseAgent, AgentContext, AgentResponse } from './base';
import { AgentType, TicketCategory } from '@prisma/client';
import { z } from 'zod';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { prisma } from '@/lib/db/prisma';

const routingSchema = z.object({
  category: z.enum(['TECHNICAL', 'BILLING', 'PRODUCT', 'GENERAL', 'COMPLAINT']),
  confidence: z.number().min(0).max(1),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  sentiment: z.number().min(-1).max(1),
  requiresHuman: z.boolean(),
  suggestedAgent: z.enum(['TECHNICAL', 'BILLING', 'PRODUCT', 'ESCALATION']),
  reasoning: z.string(),
});

type RoutingDecision = z.infer<typeof routingSchema>;

export class RouterAgent extends BaseAgent {
  private parser: StructuredOutputParser<RoutingDecision>;

  constructor() {
    super('Router Agent', AgentType.ROUTER);
    this.parser = StructuredOutputParser.fromZodSchema(routingSchema);
  }

  getSystemPrompt(): string {
    return `You are a ticket routing agent for a vacation rental platform. Your job is to analyze incoming support tickets and route them to the appropriate specialist.

Analyze the ticket and determine:
1. The category (TECHNICAL, BILLING, PRODUCT, GENERAL, or COMPLAINT)
2. Your confidence level (0-1)
3. The urgency level (LOW, MEDIUM, HIGH, or URGENT)
4. The sentiment (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)
5. Whether it requires immediate human attention
6. Which specialized agent should handle it
7. Your reasoning for the routing decision

Routing guidelines for vacation rental topics:
- TECHNICAL: Login issues, app bugs, calendar sync problems, API errors, photo upload failures, integration issues, password resets
- BILLING: Payment failures, refund requests, payout delays, commission questions, currency issues, tax documents, security deposits
- PRODUCT: How to create listings, pricing strategies, booking policies, house rules, review system, search optimization, Superhost program
- GENERAL: General platform questions, policy clarifications, feature availability
- COMPLAINT: Bad guest/host experiences, property issues, discrimination, safety concerns, fraud reports

Priority indicators:
- URGENT: Safety issues, fraud, currently stranded guests, major property damage, payment emergencies
- HIGH: Check-in today problems, missing payouts, booking errors, locked accounts
- MEDIUM: Refund requests, listing issues, policy questions, feature requests
- LOW: General how-to questions, minor bugs, suggestions

Escalate to humans if:
- Safety or legal issues mentioned
- Fraud or scam suspected
- Discrimination reported
- Major financial disputes (>$1000)
- Threats of legal action
- Confidence is low (< 0.6)

${this.parser.getFormatInstructions()}`;
  }

  async processTicket(context: AgentContext): Promise<AgentResponse> {
    try {
      const messages = [
        { role: 'system' as const, content: this.getSystemPrompt() },
        { role: 'user' as const, content: `
Ticket Title: ${context.ticket.title}
Ticket Description: ${context.ticket.description}
Customer: ${context.ticket.customer.name} (${context.ticket.customer.email})
Previous Messages: ${context.previousMessages.length}

Please analyze and route this ticket.` }
      ];

      const response = await this.model.invoke(messages);
      const routingDecision = await this.parser.parse(response.content as string);

      await this.logHandling(
        context.ticket.id,
        'route_ticket',
        true,
        routingDecision.confidence,
        routingDecision
      );

      // Update ticket with routing information
      await prisma.ticket.update({
        where: { id: context.ticket.id },
        data: {
          category: routingDecision.category as TicketCategory,
          priority: routingDecision.urgency as any,
          sentiment: routingDecision.sentiment,
          confidence: routingDecision.confidence,
        }
      });

      return {
        content: `Ticket routed to ${routingDecision.suggestedAgent} agent. Category: ${routingDecision.category}, Urgency: ${routingDecision.urgency}`,
        confidence: routingDecision.confidence,
        shouldEscalate: routingDecision.requiresHuman,
        metadata: routingDecision,
      };
    } catch (error) {
      console.error('Router agent error:', error);
      
      await this.logHandling(
        context.ticket.id,
        'route_ticket',
        false,
        0,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );

      return {
        content: 'Failed to route ticket. Escalating to human agent.',
        confidence: 0,
        shouldEscalate: true,
      };
    }
  }
}