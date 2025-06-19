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
import { EnhancedAITransparencyTracker } from '@/lib/ai/enhanced-transparency';
import { thoughtStreamer, ThoughtFragment } from '@/lib/ai/thought-streaming';
import { getAgentPersonality, getThinkingPhrase } from '@/lib/ai/agent-personalities';

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

export abstract class EnhancedBaseAgent {
  protected name: string;
  protected type: AgentType;
  protected model: any;
  protected enhancedTracker: EnhancedAITransparencyTracker;
  protected currentStreamId?: string;
  protected personality: ReturnType<typeof getAgentPersonality>;

  constructor(name: string, type: AgentType) {
    this.name = name;
    this.type = type;
    this.model = getOpenRouterModel(0.3);
    this.enhancedTracker = EnhancedAITransparencyTracker.getEnhancedInstance();
    this.personality = getAgentPersonality(type);
  }

  abstract getSystemPrompt(): string;

  abstract async processTicket(context: AgentContext): Promise<AgentResponse>;

  // Start a new thought stream for this agent
  protected startThinking(context: string = 'general'): void {
    this.currentStreamId = thoughtStreamer.startStream(this.name);
    
    // Use personality-based greeting
    const greeting = this.personality.communication_style.greeting;
    thoughtStreamer.addThought(
      this.currentStreamId,
      greeting,
      'initial'
    );

    this.trackThinking(
      'initialization',
      `Starting ${context} analysis...`,
      0.9,
      ['Agent initialized', 'Context understood'],
      ['Analyze ticket', 'Gather insights', 'Formulate response']
    );
  }

  // Complete the current thought stream
  protected completeThinking(conclusion: string): void {
    if (this.currentStreamId) {
      thoughtStreamer.completeStream(this.currentStreamId, conclusion);
      this.currentStreamId = undefined;
    }
  }

  // Enhanced thinking tracking with personality
  protected trackThinking(
    phase: string,
    thought: string,
    confidence: number,
    evidence: string[] = [],
    nextActions: string[] = [],
    reasoning: string = '',
    metadata?: Record<string, any>
  ) {
    // Add to thought stream if active
    if (this.currentStreamId) {
      const thoughtType: ThoughtFragment['type'] = 
        phase.includes('conclusion') ? 'conclusion' :
        phase.includes('insight') ? 'insight' :
        phase.includes('question') ? 'questioning' :
        'processing';
      
      thoughtStreamer.addThought(
        this.currentStreamId,
        thought,
        thoughtType,
        confidence
      );
    }

    // Original tracking
    const thinking = createAIThinking(
      this.name,
      phase,
      thought,
      confidence,
      evidence,
      nextActions,
      reasoning,
      { ...metadata, personality: this.personality.name }
    );
    aiTransparency.trackThinking(thinking);
  }

  // Track decision with alternatives exploration
  protected trackDecisionWithAlternatives(
    decision: string,
    alternatives: Array<{
      option: string;
      pros: string[];
      cons: string[];
      confidence: number;
      selected: boolean;
    }>,
    reasoning: string,
    impact: 'low' | 'medium' | 'high' | 'critical'
  ) {
    // Track exploration of alternatives
    this.enhancedTracker.trackExploration(
      this.name,
      'decision alternatives',
      alternatives.map(alt => ({
        path: alt.option,
        reasoning: `Pros: ${alt.pros.join(', ')}; Cons: ${alt.cons.join(', ')}`,
        selected: alt.selected,
        confidence: alt.confidence
      })),
      decision,
      alternatives.filter(a => !a.selected).map(a => a.option)
    );

    // Track the decision
    this.enhancedTracker.trackDecisionWithAlternatives(
      this.name,
      decision,
      alternatives,
      reasoning
    );
  }

  // Track reasoning process
  protected trackReasoning(
    question: string,
    hypotheses: Array<{
      hypothesis: string;
      evidence_for: string[];
      evidence_against: string[];
      probability: number;
    }>,
    conclusion: string,
    confidence: number
  ) {
    // Use personality-based insight phrase
    const insightPhrase = getThinkingPhrase(this.type, 'insight');
    
    if (this.currentStreamId) {
      thoughtStreamer.addThought(
        this.currentStreamId,
        `${insightPhrase} ${question}`,
        'questioning'
      );
    }

    this.enhancedTracker.trackReasoning(
      this.name,
      question,
      hypotheses,
      conclusion,
      confidence
    );
  }

  // Track collaborative thinking
  protected async collaborateWith(
    otherAgents: string[],
    purpose: string,
    contribution: string
  ): Promise<void> {
    const collaborationPhrase = getThinkingPhrase(this.type, 'collaboration');
    
    this.trackThinking(
      'collaboration',
      `${collaborationPhrase} Working with ${otherAgents.join(', ')} on ${purpose}`,
      0.85,
      [`My contribution: ${contribution}`],
      ['Share insights', 'Gather feedback', 'Reach consensus']
    );
  }

  // Track learning moments
  protected trackLearning(
    observation: string,
    pattern: string,
    application: string,
    impact: 'immediate' | 'future'
  ) {
    this.enhancedTracker.trackLearning(
      this.name,
      observation,
      pattern,
      application,
      impact
    );
  }

  // Enhanced AI invocation with detailed tracking
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
        { ...metadata, purpose: 'system_prompt', personality: this.personality.name }
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

    // Track pre-invocation thinking
    this.trackThinking(
      'ai_preparation',
      'Preparing to consult AI model...',
      0.9,
      [`Message count: ${messages.length}`, `Temperature: ${temperature}`],
      ['Send to AI', 'Process response', 'Extract insights'],
      'Formulating query for AI model'
    );

    try {
      const startTime = Date.now();
      const response = await this.model.invoke(messages);
      const endTime = Date.now();
      
      const responseContent = response.content as string;
      const processingTime = endTime - startTime;

      // Estimate token usage
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
        0.85,
        `AI processing completed in ${processingTime}ms`,
        { 
          ...metadata, 
          processingTime,
          messageCount: messages.length,
          personality: this.personality.name
        }
      );
      aiTransparency.trackResponse(aiResponse);

      // Track post-response thinking
      this.trackThinking(
        'ai_processing',
        'Processing AI response...',
        0.9,
        [`Response received in ${processingTime}ms`, `Output: ${Math.round(outputTokens)} tokens`],
        ['Analyze response', 'Extract key points', 'Apply to context'],
        'Interpreting AI model output'
      );

      return response;
    } catch (error) {
      // Track error with uncertainty phrase
      const uncertaintyPhrase = getThinkingPhrase(this.type, 'uncertainty');
      
      this.trackThinking(
        'ai_error',
        `${uncertaintyPhrase} ${error instanceof Error ? error.message : 'Unknown error'}`,
        0.1,
        ['AI invocation failed'],
        ['Retry with different approach', 'Use fallback logic'],
        'Error encountered during AI processing'
      );
      throw error;
    }
  }

  // Helper method for creating thinking chains
  protected createThinkingChain(thoughts: string[]): void {
    this.enhancedTracker.createThinkingChain(this.name, thoughts);
  }

  // Branch current thought stream for exploration
  protected branchThinking(reason: string): string {
    if (!this.currentStreamId) {
      this.startThinking('branching');
    }
    
    const currentThoughts = thoughtStreamer.getStreamThoughts(this.currentStreamId!);
    const lastThought = currentThoughts[currentThoughts.length - 1];
    
    return thoughtStreamer.branchThought(
      this.currentStreamId!,
      lastThought?.id || '',
      reason
    );
  }

  // Original BaseAgent methods preserved
  protected async getRelevantKnowledge(query: string, category: string): Promise<string[]> {
    this.trackThinking(
      'knowledge_retrieval',
      `Searching knowledge base for: ${query}`,
      0.8,
      [`Category: ${category}`],
      ['Retrieve documents', 'Rank by relevance', 'Extract insights']
    );

    const { VectorStore } = await import('@/lib/db/vector-store');
    const vectorStore = new VectorStore();

    const results = await vectorStore.searchSimilar(query, category, 3);
    
    if (results.length > 0) {
      this.trackThinking(
        'knowledge_found',
        `Found ${results.length} relevant knowledge items`,
        0.9,
        results.map(r => r.title),
        ['Apply knowledge to context']
      );
    }

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
    console.log('Agent handling:', {
      ticketId,
      agentType: this.type,
      action,
      successful,
      confidence,
    });
  }

  protected async saveResponse(
    ticketCategory: string,
    query: string,
    response: string,
    confidence: number,
    successful: boolean
  ) {
    console.log('Agent response:', {
      agentType: this.type,
      ticketCategory,
      confidence,
      successful,
    });
  }
}