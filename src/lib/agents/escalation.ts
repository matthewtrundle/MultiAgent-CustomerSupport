import { BaseAgent, AgentContext, AgentResponse } from './base';
import { AgentType } from '@prisma/client';

export class EscalationAgent extends BaseAgent {
  constructor() {
    super('Escalation Agent', AgentType.ESCALATION);
  }

  getSystemPrompt(): string {
    return `You are an escalation specialist for a vacation rental platform handling sensitive and complex issues. Your role covers:

CRITICAL SITUATIONS:
- Safety concerns (unsafe properties, threatening behavior)
- Discrimination reports (race, gender, disability, etc.)
- Fraud and scam attempts
- Currently stranded guests
- Major property damage disputes
- Legal threats or media involvement

DE-ESCALATION APPROACH:
1. Show immediate empathy and concern
2. Acknowledge the severity of their situation
3. Take full ownership of finding a solution
4. Provide specific actions and timelines
5. Loop in specialized teams (Trust & Safety, Legal)
6. Document everything thoroughly

IMMEDIATE ACTIONS YOU CAN TAKE:
- Emergency rebooking for stranded guests
- Full refunds for safety/discrimination issues
- Account credits (up to $200) for major inconveniences
- Expedited payout processing for hosts
- Direct connection to Trust & Safety team
- Override standard cancellation policies

ESCALATION TRIGGERS (immediate human handoff):
- Any safety or security threat
- Discrimination or harassment
- Legal action mentioned
- Media/social media threats
- Financial disputes over $2000
- Law enforcement involvement

Remember: Guest safety and platform trust are paramount. When in doubt, escalate to humans.`;
  }

  async processTicket(context: AgentContext): Promise<AgentResponse> {
    try {
      const conversationHistory = this.formatConversationHistory(context.previousMessages);
      const sentiment = context.ticket.sentiment || 0;
      
      const messages = [
        { role: 'system' as const, content: this.getSystemPrompt() },
        { role: 'user' as const, content: `
ESCALATED TICKET - HANDLE WITH CARE

Customer: ${context.ticket.customer.name}
Email: ${context.ticket.customer.email}
Company: ${context.ticket.customer.company || 'Individual'}
Customer Sentiment: ${sentiment < -0.5 ? 'VERY NEGATIVE' : sentiment < 0 ? 'NEGATIVE' : 'NEUTRAL'}

Issue: ${context.ticket.title}
Description: ${context.ticket.description}

Previous conversation:
${conversationHistory}

Previous agents involved: ${context.ticket.handlings?.length || 0}

This ticket has been escalated. Please provide an empathetic and solution-focused response.` }
      ];

      const response = await this.model.invoke(messages);
      const responseContent = response.content as string;

      const requiresHuman = this.requiresHumanIntervention(context, responseContent);
      const confidence = requiresHuman ? 0.5 : 0.85;

      await this.logHandling(
        context.ticket.id,
        'handle_escalation',
        true,
        confidence,
        { 
          sentiment,
          offeredCompensation: this.extractCompensation(responseContent),
          requiresHuman,
          escalationReason: this.categorizeEscalation(context)
        }
      );

      // Update ticket priority if needed
      if (sentiment < -0.7 || requiresHuman) {
        await prisma.ticket.update({
          where: { id: context.ticket.id },
          data: { 
            priority: 'URGENT' as const,
            status: requiresHuman ? 'ESCALATED' as const : 'IN_PROGRESS' as const
          }
        });
      }

      return {
        content: responseContent,
        confidence,
        shouldEscalate: requiresHuman,
        metadata: {
          agentType: this.type,
          escalationLevel: 'high',
          suggestedCompensation: this.extractCompensation(responseContent),
          requiresFollowUp: true,
        }
      };
    } catch (error) {
      console.error('Escalation agent error:', error);
      
      return {
        content: 'I sincerely apologize for the difficulties you\'re experiencing. I\'m immediately connecting you with a senior team member who can better assist you.',
        confidence: 0,
        shouldEscalate: true,
      };
    }
  }

  private requiresHumanIntervention(context: AgentContext, response: string): boolean {
    // Always escalate certain situations
    const criticalKeywords = [
      'legal',
      'lawsuit',
      'lawyer',
      'media',
      'social media campaign',
      'data breach',
      'security incident',
      'discrimination',
      'harassment'
    ];

    const text = (context.ticket.description + ' ' + response).toLowerCase();
    
    // Check for critical keywords
    if (criticalKeywords.some(keyword => text.includes(keyword))) {
      return true;
    }

    // Check sentiment
    if (context.ticket.sentiment && context.ticket.sentiment < -0.8) {
      return true;
    }

    // Check if customer explicitly asks for human
    if (text.includes('speak to a human') || 
        text.includes('talk to a person') ||
        text.includes('real person')) {
      return true;
    }

    return false;
  }

  private extractCompensation(response: string): string | null {
    const compensationPattern = /(?:offer|provide|credit|refund|compensate).*?(\$?\d+|free month|discount)/i;
    const match = response.match(compensationPattern);
    
    if (match) {
      return match[1];
    }
    
    return null;
  }

  private categorizeEscalation(context: AgentContext): string {
    const description = context.ticket.description.toLowerCase();
    
    if (description.includes('refund') || description.includes('money back')) {
      return 'refund_dispute';
    } else if (description.includes('bug') || description.includes('broken')) {
      return 'technical_failure';
    } else if (description.includes('disappointed') || description.includes('frustrated')) {
      return 'service_complaint';
    } else if (context.ticket.sentiment && context.ticket.sentiment < -0.5) {
      return 'negative_sentiment';
    } else {
      return 'general_escalation';
    }
  }
}