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
  similarTickets: z.array(z.string()).optional(),
  keywords: z.array(z.string()),
  estimatedResolutionTime: z.number(),
});

type RoutingDecision = z.infer<typeof routingSchema>;

export class EnhancedRouterAgent extends BaseAgent {
  private parser: StructuredOutputParser<RoutingDecision>;

  constructor() {
    super('Router Agent', AgentType.ROUTER);
    this.parser = StructuredOutputParser.fromZodSchema(routingSchema);
  }

  getSystemPrompt(): string {
    return `You are Alex, an expert ticket routing specialist for a vacation rental property management platform. Your job is to analyze support tickets with high accuracy and route them to the appropriate specialist.

Your capabilities:
- Pattern Recognition: Identify issue patterns from descriptions
- Priority Assessment: Determine urgency based on business impact
- Category Classification: Route to the most qualified specialist

Analyze the ticket and determine:
1. Category (TECHNICAL, BILLING, PRODUCT, GENERAL, or COMPLAINT)
2. Confidence level (0-1) - be realistic, not everything is 0.9+
3. Urgency level (LOW, MEDIUM, HIGH, or URGENT)
4. Sentiment (-1 to 1, where -1 is very negative)
5. Whether it requires immediate human attention
6. Which specialized agent should handle it
7. Your reasoning for the routing decision
8. Similar tickets you've seen (if any)
9. Key words/phrases that influenced your decision
10. Estimated resolution time in minutes

Common patterns you've learned:
- Calendar/sync issues → TECHNICAL (usually 30-45 min resolution)
- Payment/refund issues → BILLING (usually 15-30 min resolution)
- How-to questions → PRODUCT (usually 10-20 min resolution)
- Multiple properties → Often needs experienced agent
- Angry tone + damage/loss → Usually URGENT

Priority indicators:
- URGENT: Safety issues, fraud, stranded guests, major damage, large financial loss (>$1000)
- HIGH: Check-in today, missing payouts, booking errors, account locked
- MEDIUM: Refund requests, listing issues, policy questions
- LOW: General questions, minor bugs, feature requests

Escalate to humans if:
- Legal threats or safety concerns
- Discrimination or harassment
- Confidence < 0.6
- Multiple failed resolution attempts
- VIP customer (>10 properties)

${this.parser.getFormatInstructions()}`;
  }

  async processTicket(context: AgentContext): Promise<AgentResponse> {
    try {
      // Search for similar past tickets
      const similarTickets = await this.findSimilarTickets(context.ticket.description);
      
      // Get ticket history stats for context
      const stats = await this.getTicketStats();
      
      const messages = [
        { role: 'system' as const, content: this.getSystemPrompt() },
        { role: 'user' as const, content: `
Ticket #${context.ticket.id.slice(0, 8)}
Title: ${context.ticket.title}
Description: ${context.ticket.description}
Customer: ${context.ticket.customer.name} (${context.ticket.customer.email})
Customer Company: ${context.ticket.customer.company || 'Individual'}
Previous Messages: ${context.previousMessages.length}

Similar resolved tickets found: ${similarTickets.length}
${similarTickets.length > 0 ? `Examples: ${similarTickets.slice(0, 3).map(t => `"${t.title}" (${t.category}, resolved in ${t.metrics?.resolutionTime || 'unknown'} min)`).join(', ')}` : ''}

Platform stats:
- Average resolution time: ${stats.avgResolutionTime} minutes
- Current open tickets: ${stats.openTickets}
- Tickets in last hour: ${stats.recentTickets}

Please analyze and route this ticket.` }
      ];

      const response = await this.model.invoke(messages);
      const routingDecision = await this.parser.parse(response.content as string);

      // Log the routing analysis
      console.log('Router Analysis:', {
        ticketId: context.ticket.id,
        category: routingDecision.category,
        confidence: routingDecision.confidence,
        keywords: routingDecision.keywords,
        similarTicketsFound: similarTickets.length
      });

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
        content: `Routed to ${routingDecision.suggestedAgent} agent. Category: ${routingDecision.category}, Urgency: ${routingDecision.urgency}`,
        confidence: routingDecision.confidence,
        shouldEscalate: routingDecision.requiresHuman,
        metadata: {
          ...routingDecision,
          similarTicketIds: similarTickets.map(t => t.id),
          analysisTime: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Enhanced router agent error:', error);
      
      return {
        content: 'Failed to route ticket. Escalating to human agent.',
        confidence: 0,
        shouldEscalate: true,
      };
    }
  }

  private async findSimilarTickets(description: string) {
    // In a real implementation, this would use vector similarity search
    // For now, we'll do keyword matching
    const keywords = this.extractKeywords(description);
    
    const similarTickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { status: 'RESOLVED' },
          { status: 'CLOSED' }
        ],
        AND: {
          OR: keywords.map(keyword => ({
            OR: [
              { title: { contains: keyword, mode: 'insensitive' } },
              { description: { contains: keyword, mode: 'insensitive' } }
            ]
          }))
        }
      },
      include: {
        metrics: true
      },
      take: 5,
      orderBy: {
        resolvedAt: 'desc'
      }
    });
    
    return similarTickets;
  }
  
  private extractKeywords(text: string): string[] {
    const commonWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'shall', 'can', 'need', 'my', 'i', 'me', 'we', 'us', 'you', 'it', 'its', 'they', 'them', 'their']);
    
    const importantTerms = ['calendar', 'sync', 'payment', 'refund', 'booking', 'guest', 'host', 'property', 'listing', 'review', 'cancel', 'damage', 'clean', 'check-in', 'checkout', 'price', 'fee', 'tax', 'payout', 'api', 'integration', 'error', 'broken', 'failed', 'urgent'];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word));
    
    // Prioritize important terms
    const keywords = words.filter(word => importantTerms.includes(word));
    
    // Add other significant words
    words.forEach(word => {
      if (!keywords.includes(word) && keywords.length < 10) {
        keywords.push(word);
      }
    });
    
    return keywords.slice(0, 10);
  }
  
  private async getTicketStats() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const [openTickets, recentTickets, avgResolutionResult] = await Promise.all([
      prisma.ticket.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } }
      }),
      prisma.ticket.count({
        where: { createdAt: { gte: oneHourAgo } }
      }),
      prisma.ticketMetrics.aggregate({
        _avg: { resolutionTime: true },
        where: { resolutionTime: { not: null } }
      })
    ]);
    
    return {
      openTickets,
      recentTickets,
      avgResolutionTime: Math.round(avgResolutionResult._avg.resolutionTime || 45)
    };
  }
}