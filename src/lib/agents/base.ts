import { AgentType, Ticket, Message } from '@prisma/client';
import { getOpenRouterModel } from '@/lib/ai/openrouter';
import { prisma } from '@/lib/db/prisma';
import { 
  aiTransparency, 
  createAIPrompt, 
  createAIResponse, 
  createAIThinking,
  createAIDecision,
  createAIAnalysis
} from '@/lib/ai/transparency';

export interface AgentContext {
  ticket: Ticket & {
    customer: any;
    messages: Message[];
  };
  previousMessages: Message[];
}

export interface AgentResponse {
  content: string;
  confidence: number;
  shouldEscalate: boolean;
  metadata?: Record<string, any>;
}

export abstract class BaseAgent {
  protected name: string;
  protected type: AgentType;
  protected model: any;

  constructor(name: string, type: AgentType) {
    this.name = name;
    this.type = type;
    this.model = getOpenRouterModel(0.3);
  }

  abstract getSystemPrompt(): string;

  abstract async processTicket(context: AgentContext): Promise<AgentResponse>;

  protected async getRelevantKnowledge(query: string, category: string): Promise<string[]> {
    const { VectorStore } = await import('@/lib/db/vector-store');
    const vectorStore = new VectorStore();

    const results = await vectorStore.searchSimilar(query, category, 3);
    return results.map((doc) => `${doc.title}\n${doc.content}`);
  }

  protected formatConversationHistory(messages: Message[]): string {
    return messages
      .map((msg) => `${msg.customerId ? 'Customer' : 'Agent'}: ${msg.content}`)
      .join('\n');
  }

  protected async logHandling(
    ticketId: string,
    action: string,
    successful: boolean,
    confidence: number,
    metadata?: any
  ) {
    // Skip logging for demo mode to avoid foreign key constraints
    console.log('Agent handling:', {
      ticketId,
      agentType: this.type,
      action,
      successful,
      confidence,
    });

    // TODO: In production, create a system user and use its ID
    // await prisma.ticketHandling.create({
    //   data: {
    //     ticketId,
    //     agentId: 'system-user-id',
    //     agentType: this.type,
    //     action,
    //     successful,
    //     confidence,
    //     metadata,
    //     endTime: new Date(),
    //   }
    // });
  }

  protected async saveResponse(
    ticketCategory: string,
    query: string,
    response: string,
    confidence: number,
    successful: boolean
  ) {
    // Skip saving responses for demo mode
    console.log('Agent response:', {
      agentType: this.type,
      ticketCategory,
      confidence,
      successful,
    });

    // TODO: Enable in production
    // await prisma.agentResponse.create({
    //   data: {
    //     agentType: this.type,
    //     ticketCategory: ticketCategory as any,
    //     query,
    //     response,
    //     confidence,
    //     successful,
    //   }
    // });
  }

  // AI Transparency Methods
  protected trackThinking(
    phase: string,
    thought: string,
    confidence: number,
    evidence: string[] = [],
    nextActions: string[] = [],
    reasoning: string = '',
    metadata?: Record<string, any>
  ) {
    const thinking = createAIThinking(
      this.name,
      phase,
      thought,
      confidence,
      evidence,
      nextActions,
      reasoning,
      metadata
    );
    aiTransparency.trackThinking(thinking);
  }

  protected trackDecision(
    decision: string,
    reasoning: string,
    alternatives: string[],
    confidence: number,
    evidence: string[],
    impact: 'low' | 'medium' | 'high' | 'critical'
  ) {
    const decisionData = createAIDecision(
      this.name,
      decision,
      reasoning,
      alternatives,
      confidence,
      evidence,
      impact
    );
    aiTransparency.trackDecision(decisionData);
  }

  protected trackAnalysis(
    analysisType: 'pattern' | 'sentiment' | 'priority' | 'similarity' | 'trend',
    input: string,
    output: any,
    methodology: string,
    confidence: number,
    dataPoints: number,
    insights: string[]
  ) {
    const analysis = createAIAnalysis(
      this.name,
      analysisType,
      input,
      output,
      methodology,
      confidence,
      dataPoints,
      insights
    );
    aiTransparency.trackAnalysis(analysis);
  }

  protected async invokeAI(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    temperature: number = 0.3,
    metadata?: Record<string, any>
  ) {
    // Track system prompt
    const systemMessage = messages.find(m => m.role === 'system');
    if (systemMessage) {
      const systemPrompt = createAIPrompt(
        this.name,
        'system',
        systemMessage.content,
        { ...metadata, purpose: 'system_prompt' }
      );
      aiTransparency.trackPrompt(systemPrompt);
    }

    // Track user prompts
    messages.filter(m => m.role === 'user').forEach(message => {
      const userPrompt = createAIPrompt(
        this.name,
        'user',
        message.content,
        { ...metadata, purpose: 'user_input' }
      );
      aiTransparency.trackPrompt(userPrompt);
    });

    // Track thinking before AI call
    this.trackThinking(
      'ai_invocation',
      `Sending ${messages.length} messages to AI model for processing`,
      0.9,
      [`Temperature: ${temperature}`, `Model: ${this.model?.modelName || 'unknown'}`],
      ['Process AI response', 'Extract insights', 'Make decisions'],
      'About to invoke AI model with prepared prompts'
    );

    try {
      const startTime = Date.now();
      const response = await this.model.invoke(messages);
      const endTime = Date.now();
      
      const responseContent = response.content as string;
      const processingTime = endTime - startTime;

      // Estimate token usage (simplified)
      const inputTokens = messages.reduce((acc, msg) => acc + msg.content.length / 4, 0);
      const outputTokens = responseContent.length / 4;

      // Track AI response
      const aiResponse = createAIResponse(
        this.name,
        messages.map(m => `${m.role}: ${m.content}`).join('\n'),
        responseContent,
        this.model?.modelName || 'unknown',
        temperature,
        {
          input: Math.round(inputTokens),
          output: Math.round(outputTokens),
          total: Math.round(inputTokens + outputTokens)
        },
        0.85, // Default confidence
        `AI processing completed in ${processingTime}ms`,
        { 
          ...metadata, 
          processingTime,
          messageCount: messages.length
        }
      );
      aiTransparency.trackResponse(aiResponse);

      // Track thinking after AI response
      this.trackThinking(
        'ai_response_received',
        `Received AI response with ${Math.round(outputTokens)} tokens`,
        0.9,
        [`Processing time: ${processingTime}ms`, `Response length: ${responseContent.length} chars`],
        ['Parse response', 'Extract structured data', 'Validate output'],
        'AI model has provided response, now processing the output'
      );

      return response;
    } catch (error) {
      // Track error
      this.trackThinking(
        'ai_error',
        `AI invocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0.1,
        ['Error occurred during AI processing'],
        ['Retry with different parameters', 'Fallback to simpler approach'],
        'AI model invocation encountered an error'
      );
      throw error;
    }
  }
}
