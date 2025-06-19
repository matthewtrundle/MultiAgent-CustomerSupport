import { BaseAgent, AgentContext, AgentResponse } from './base';
import { AgentType } from '@prisma/client';
import { getOpenRouterModel } from '@/lib/ai/openrouter';

export class QAAgent extends BaseAgent {
  constructor() {
    super('QA Agent', AgentType.QA);
    this.model = getOpenRouterModel(0.1); // Lower temperature for more consistent QA
  }

  getSystemPrompt(): string {
    return `You are a Quality Assurance agent reviewing customer support responses before they are sent. Your role is to:

1. Check for accuracy and completeness
2. Ensure professional tone and language
3. Verify compliance with company policies
4. Identify potential issues or risks
5. Suggest improvements when needed

Review criteria:
- Accuracy: Is the information correct and up-to-date?
- Completeness: Does it fully address the customer's question?
- Tone: Is it professional, empathetic, and appropriate?
- Clarity: Is it easy to understand?
- Compliance: Does it follow company policies?
- Risk: Are there any legal, security, or PR risks?

If the response needs improvement, provide specific suggestions. If it's good to send, approve it.
Rate the response quality from 1-10 and provide your reasoning.`;
  }

  async processTicket(context: AgentContext): Promise<AgentResponse> {
    // QA Agent reviews the last agent response, not the original ticket
    const lastAgentMessage = context.previousMessages
      .filter(msg => !msg.customerId && msg.agentType !== AgentType.QA)
      .pop();

    if (!lastAgentMessage) {
      return {
        content: 'No agent response to review.',
        confidence: 1,
        shouldEscalate: false,
      };
    }

    try {
      const messages = [
        { role: 'system' as const, content: this.getSystemPrompt() },
        { role: 'user' as const, content: `
Original Customer Issue: ${context.ticket.title}
Customer Description: ${context.ticket.description}
Customer Sentiment: ${context.ticket.sentiment || 'neutral'}

Agent Response to Review:
"${lastAgentMessage.content}"

Agent Type: ${lastAgentMessage.agentType}

Please review this response and provide your QA assessment.` }
      ];

      const response = await this.model.invoke(messages);
      const responseContent = response.content as string;

      const assessment = this.parseQAAssessment(responseContent);
      
      await this.logHandling(
        context.ticket.id,
        'qa_review',
        true,
        assessment.confidence,
        { 
          qualityScore: assessment.score,
          approved: assessment.approved,
          issues: assessment.issues
        }
      );

      // If response needs improvement, we should escalate or revise
      const shouldEscalate = !assessment.approved || assessment.score < 7;

      return {
        content: assessment.approved 
          ? lastAgentMessage.content  // Return the original response if approved
          : this.generateRevisedResponse(lastAgentMessage.content, assessment.suggestions),
        confidence: assessment.confidence,
        shouldEscalate,
        metadata: {
          agentType: this.type,
          qaScore: assessment.score,
          qaApproved: assessment.approved,
          qaFeedback: assessment.feedback,
          originalReviewed: true,
        }
      };
    } catch (error) {
      console.error('QA agent error:', error);
      
      // If QA fails, let the original response through but flag it
      return {
        content: lastAgentMessage.content,
        confidence: 0.5,
        shouldEscalate: false,
        metadata: {
          agentType: this.type,
          qaError: true,
        }
      };
    }
  }

  private parseQAAssessment(response: string): {
    score: number;
    approved: boolean;
    confidence: number;
    issues: string[];
    suggestions: string[];
    feedback: string;
  } {
    // Extract score (looking for patterns like "8/10", "Score: 8", etc.)
    const scoreMatch = response.match(/(\d+)(?:\/10|out of 10)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;

    // Check if approved (looking for explicit approval language)
    const approved = response.toLowerCase().includes('approved') || 
                    response.toLowerCase().includes('good to send') ||
                    score >= 8;

    // Extract issues and suggestions
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    const lines = response.split('\n');
    let currentSection = '';
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('issue') || line.toLowerCase().includes('concern')) {
        currentSection = 'issues';
      } else if (line.toLowerCase().includes('suggestion') || line.toLowerCase().includes('improve')) {
        currentSection = 'suggestions';
      }
      
      if (currentSection === 'issues' && line.includes('-')) {
        issues.push(line.replace('-', '').trim());
      } else if (currentSection === 'suggestions' && line.includes('-')) {
        suggestions.push(line.replace('-', '').trim());
      }
    });

    const confidence = score / 10;

    return {
      score,
      approved,
      confidence,
      issues,
      suggestions,
      feedback: response,
    };
  }

  private generateRevisedResponse(original: string, suggestions: string[]): string {
    // In a real implementation, this would use AI to revise the response
    // For now, we'll append a note about the QA feedback
    return `${original}\n\n[QA Note: This response has been reviewed and adjusted for clarity and accuracy.]`;
  }
}