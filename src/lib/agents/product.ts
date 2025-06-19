import { BaseAgent, AgentContext, AgentResponse } from './base';
import { AgentType } from '@prisma/client';

export class ProductExpertAgent extends BaseAgent {
  constructor() {
    super('Product Expert Agent', AgentType.PRODUCT);
  }

  getSystemPrompt(): string {
    return `You are a Product Expert for a vacation rental platform. Your expertise covers:

HOST FEATURES & TOOLS:
- Creating and optimizing listings (titles, descriptions, photos)
- Pricing strategies (seasonal, weekend, smart pricing)
- Calendar management and availability
- House rules and check-in instructions
- Instant Book settings and requirements
- Superhost program and benefits
- Co-hosting and team management

GUEST FEATURES:
- Search and filters usage
- Booking process and requirements
- Wishlist and trip planning tools
- Review system (leaving and responding)
- Communication with hosts
- Travel insurance and protection

PLATFORM POLICIES:
- Cancellation policies (Flexible, Moderate, Strict, Super Strict)
- Service fees and how they work
- Community standards and guidelines
- Party and event policies
- Long-term stay policies (28+ days)
- Pet policies and additional fees

Guidelines:
1. Explain features in simple, actionable terms
2. Provide tips for success (better bookings, reviews)
3. Reference relevant help articles
4. Suggest best practices for hosts and guests
5. Clarify policy implications

Always focus on helping users maximize their experience on the platform.`;
  }

  async processTicket(context: AgentContext): Promise<AgentResponse> {
    try {
      const conversationHistory = this.formatConversationHistory(context.previousMessages);
      const knowledge = await this.getRelevantKnowledge(
        context.ticket.description,
        'product'
      );

      const messages = [
        { role: 'system' as const, content: this.getSystemPrompt() },
        { role: 'user' as const, content: `
Customer: ${context.ticket.customer.name}
Company: ${context.ticket.customer.company || 'Individual'}
Question: ${context.ticket.title}
Details: ${context.ticket.description}

Previous conversation:
${conversationHistory}

Relevant knowledge base articles:
${knowledge.join('\n')}

Please provide helpful guidance about our product.` }
      ];

      const response = await this.model.invoke(messages);
      const responseContent = response.content as string;

      const confidence = this.calculateConfidence(responseContent, context);
      const shouldEscalate = this.shouldEscalateProduct(context);

      await this.logHandling(
        context.ticket.id,
        'provide_product_guidance',
        true,
        confidence,
        { 
          responseType: this.categorizeResponse(responseContent),
          suggestedFeatures: this.extractFeatureSuggestions(responseContent)
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
          responseType: this.categorizeResponse(responseContent),
          helpfulResources: this.extractResources(responseContent),
        }
      };
    } catch (error) {
      console.error('Product expert agent error:', error);
      
      return {
        content: 'I encountered an error while helping with your product question. Let me connect you with our product team.',
        confidence: 0,
        shouldEscalate: true,
      };
    }
  }

  private calculateConfidence(response: string, context: AgentContext): number {
    let confidence = 0.8; // Base confidence for product questions

    // Higher confidence for common questions
    const commonQuestions = ['how to', 'getting started', 'best practice', 'tutorial'];
    commonQuestions.forEach(question => {
      if (context.ticket.description.toLowerCase().includes(question)) {
        confidence += 0.05;
      }
    });

    // Lower confidence for feature requests or complaints
    if (context.ticket.description.toLowerCase().includes('feature request') ||
        context.ticket.description.toLowerCase().includes('missing feature')) {
      confidence -= 0.15;
    }

    // Higher confidence for detailed responses
    if (response.includes('Step 1') || response.includes('Here\'s how')) {
      confidence += 0.05;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  private shouldEscalateProduct(context: AgentContext): boolean {
    const escalationIndicators = [
      'bug',
      'broken',
      'not working',
      'enterprise',
      'custom implementation',
      'integration partner'
    ];

    const text = context.ticket.description.toLowerCase();
    return escalationIndicators.some(indicator => text.includes(indicator));
  }

  private categorizeResponse(response: string): string {
    if (response.includes('Step 1') || response.includes('follow these steps')) {
      return 'tutorial';
    } else if (response.includes('best practice') || response.includes('recommend')) {
      return 'best_practice';
    } else if (response.includes('feature allows') || response.includes('capability')) {
      return 'feature_explanation';
    } else {
      return 'general_guidance';
    }
  }

  private extractFeatureSuggestions(response: string): string[] {
    const suggestions: string[] = [];
    const featurePattern = /(?:try|use|check out|explore) (?:our |the )?([A-Za-z\s]+)(?:feature|tool|option)/gi;
    
    let match;
    while ((match = featurePattern.exec(response)) !== null) {
      suggestions.push(match[1].trim());
    }
    
    return suggestions;
  }

  private extractResources(response: string): string[] {
    const resources: string[] = [];
    
    // Extract documentation links (simplified)
    if (response.includes('documentation') || response.includes('guide')) {
      resources.push('documentation');
    }
    if (response.includes('video') || response.includes('tutorial')) {
      resources.push('video_tutorial');
    }
    if (response.includes('example') || response.includes('template')) {
      resources.push('examples');
    }
    
    return resources;
  }
}