import { BaseAgent, AgentContext, AgentResponse } from './base';
import { AgentType } from '@prisma/client';

export class BillingAgent extends BaseAgent {
  constructor() {
    super('Billing Agent', AgentType.BILLING);
  }

  getSystemPrompt(): string {
    return `You are a billing support specialist for a vacation rental platform. Your role covers:

GUEST BILLING ISSUES:
- Booking payment failures and declines
- Refund requests (cancellations, property issues, double charges)
- Security deposit holds and releases
- Cleaning fees and additional charges
- Currency conversion questions
- Payment method updates

HOST PAYOUT ISSUES:
- Missing or delayed payouts
- Payout method setup (bank accounts, PayPal, etc.)
- Tax withholding and reporting
- Commission calculations
- Minimum payout thresholds
- Split payouts for co-hosts

Guidelines:
1. Identify if it's a host or guest immediately
2. Be empathetic with payment frustrations
3. Know the cancellation policy tiers (Flexible, Moderate, Strict)
4. Verify identity before processing refunds
5. Escalate fraud or disputes to Trust & Safety

Important policies:
- Guest refunds depend on cancellation policy and timing
- Host payouts occur 24 hours after check-in
- Security deposits are held for 7 days post-checkout
- Service fees are generally non-refundable
- Extenuating circumstances may override policies

Always show understanding while following platform policies.`;
  }

  async processTicket(context: AgentContext): Promise<AgentResponse> {
    try {
      const conversationHistory = this.formatConversationHistory(context.previousMessages);
      const knowledge = await this.getRelevantKnowledge(
        context.ticket.description,
        'billing'
      );

      const messages = [
        { role: 'system' as const, content: this.getSystemPrompt() },
        { role: 'user' as const, content: `
Customer: ${context.ticket.customer.name}
Email: ${context.ticket.customer.email}
Issue: ${context.ticket.title}
Description: ${context.ticket.description}

Previous conversation:
${conversationHistory}

Relevant knowledge base articles:
${knowledge.join('\n')}

Please provide assistance with this billing issue.` }
      ];

      const response = await this.model.invoke(messages);
      const responseContent = response.content as string;

      const confidence = this.calculateConfidence(responseContent, context);
      const shouldEscalate = this.shouldEscalateBilling(responseContent, context);

      await this.logHandling(
        context.ticket.id,
        'handle_billing_issue',
        true,
        confidence,
        { 
          responseLength: responseContent.length,
          requiresAction: this.requiresBillingAction(responseContent)
        }
      );

      await this.saveResponse(
        context.ticket.category,
        context.ticket.description,
        responseContent,
        confidence,
        true
      );

      return {
        content: responseContent,
        confidence,
        shouldEscalate,
        metadata: {
          agentType: this.type,
          requiresVerification: this.requiresCustomerVerification(responseContent),
          billingAction: this.extractBillingAction(responseContent),
        }
      };
    } catch (error) {
      console.error('Billing agent error:', error);
      
      return {
        content: 'I encountered an error while processing your billing request. Let me connect you with our billing team.',
        confidence: 0,
        shouldEscalate: true,
      };
    }
  }

  private calculateConfidence(response: string, context: AgentContext): number {
    let confidence = 0.75; // Base confidence for billing

    // Higher confidence for standard procedures
    const standardProcedures = ['refund policy', 'subscription change', 'payment retry'];
    standardProcedures.forEach(procedure => {
      if (context.ticket.description.toLowerCase().includes(procedure)) {
        confidence += 0.05;
      }
    });

    // Lower confidence for complex issues
    const complexIssues = ['dispute', 'chargeback', 'fraud', 'legal'];
    complexIssues.forEach(issue => {
      if (context.ticket.description.toLowerCase().includes(issue)) {
        confidence -= 0.2;
      }
    });

    return Math.max(0, Math.min(1, confidence));
  }

  private shouldEscalateBilling(response: string, context: AgentContext): boolean {
    const escalationKeywords = [
      'fraud',
      'legal action',
      'chargeback',
      'dispute',
      'large refund',
      'multiple failures'
    ];

    const text = (response + context.ticket.description).toLowerCase();
    return escalationKeywords.some(keyword => text.includes(keyword));
  }

  private requiresCustomerVerification(response: string): boolean {
    const verificationKeywords = ['verify', 'confirm identity', 'security', 'account access'];
    return verificationKeywords.some(keyword => 
      response.toLowerCase().includes(keyword)
    );
  }

  private requiresBillingAction(response: string): boolean {
    const actionKeywords = ['refund', 'cancel', 'upgrade', 'downgrade', 'process payment'];
    return actionKeywords.some(keyword => 
      response.toLowerCase().includes(keyword)
    );
  }

  private extractBillingAction(response: string): string | null {
    const actions = {
      refund: 'process_refund',
      cancel: 'cancel_subscription',
      upgrade: 'upgrade_plan',
      downgrade: 'downgrade_plan',
      'payment retry': 'retry_payment'
    };

    for (const [keyword, action] of Object.entries(actions)) {
      if (response.toLowerCase().includes(keyword)) {
        return action;
      }
    }

    return null;
  }
}