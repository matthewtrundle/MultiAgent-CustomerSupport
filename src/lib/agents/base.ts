import { AgentType, Ticket, Message } from '@prisma/client';
import { getOpenRouterModel } from '@/lib/ai/openrouter';
import { prisma } from '@/lib/db/prisma';

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
    return results.map(doc => `${doc.title}\n${doc.content}`);
  }

  protected formatConversationHistory(messages: Message[]): string {
    return messages
      .map(msg => `${msg.customerId ? 'Customer' : 'Agent'}: ${msg.content}`)
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
      confidence
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
      successful
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
}