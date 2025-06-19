import { BaseAgent, AgentContext, AgentResponse } from './base';
import { AgentType } from '@prisma/client';

export class TechnicalSupportAgent extends BaseAgent {
  constructor() {
    super('Technical Support Agent', AgentType.TECHNICAL);
  }

  getSystemPrompt(): string {
    return `You are a Technical Support specialist for a vacation rental platform. Your expertise covers:
- Website and mobile app issues (login problems, page errors, booking failures)
- Host listing management (photo uploads, description editing, amenity updates)
- Calendar synchronization (iCal, channel manager integrations)
- API and webhook issues for power users
- Browser compatibility and performance problems
- Account access issues (password resets, 2FA problems, locked accounts)
- Payment processing technical errors
- Third-party integrations (smart locks, pricing tools, cleaning services)

Guidelines:
1. Quickly identify if it's a host or guest issue
2. Check for common problems first (cache, cookies, browser version)
3. Provide clear step-by-step solutions with screenshots when helpful
4. Escalate complex backend issues to engineering
5. Document bugs clearly for development team
6. Be patient with non-technical users

Common quick fixes to check:
- Clear browser cache and cookies
- Try different browser or incognito mode
- Check internet connection
- Verify account email and password
- Update app to latest version`;
  }

  async processTicket(context: AgentContext): Promise<AgentResponse> {
    try {
      const conversationHistory = this.formatConversationHistory(context.previousMessages);
      const knowledge = await this.getRelevantKnowledge(
        context.ticket.description,
        'technical'
      );

      const messages = [
        { role: 'system' as const, content: this.getSystemPrompt() },
        { role: 'user' as const, content: `
Customer: ${context.ticket.customer.name}
Issue: ${context.ticket.title}
Description: ${context.ticket.description}

Previous conversation:
${conversationHistory}

Relevant knowledge base articles:
${knowledge.join('\n')}

Please provide a technical solution. Include:
- Step-by-step troubleshooting instructions
- Common causes for this issue
- Quick fixes they can try immediately
- When to escalate to engineering team
- Any relevant workarounds` }
      ];

      const response = await this.model.invoke(messages);
      const responseContent = response.content as string;

      // Simple confidence calculation based on response characteristics
      const confidence = this.calculateConfidence(responseContent);
      const shouldEscalate = confidence < 0.6 || responseContent.toLowerCase().includes('escalate');

      await this.logHandling(
        context.ticket.id,
        'provide_technical_support',
        true,
        confidence,
        { responseLength: responseContent.length }
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
          processingTime: Date.now(),
        }
      };
    } catch (error) {
      console.error('Technical agent error:', error);
      
      return {
        content: 'I encountered an error while processing your technical issue. Let me escalate this to a senior engineer.',
        confidence: 0,
        shouldEscalate: true,
      };
    }
  }

  private calculateConfidence(response: string): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence for detailed responses
    if (response.length > 500) confidence += 0.1;
    
    // Increase confidence for structured responses
    if (response.includes('1.') || response.includes('Step')) confidence += 0.1;
    
    // Decrease confidence for uncertain language
    const uncertainPhrases = ['might', 'possibly', 'not sure', 'could be', 'perhaps'];
    uncertainPhrases.forEach(phrase => {
      if (response.toLowerCase().includes(phrase)) confidence -= 0.1;
    });

    return Math.max(0, Math.min(1, confidence));
  }
}