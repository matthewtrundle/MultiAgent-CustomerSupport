import { aiTransparency, createAIThinking, createAIDecision } from './transparency';

// Base event interface
export interface AIEvent {
  id: string;
  timestamp: Date;
  type: string;
  agent: string;
  [key: string]: any;
}

// Extended event types for deeper transparency
export interface AIDebate {
  id: string;
  timestamp: Date;
  type: 'debate';
  agent: string;
  participants: string[];
  topic: string;
  positions: Array<{
    agent: string;
    stance: string;
    arguments: string[];
    confidence: number;
  }>;
  consensus?: string;
  dissent?: string[];
}

export interface AIReasoning {
  id: string;
  timestamp: Date;
  type: 'reasoning';
  agent: string;
  question: string;
  hypotheses: Array<{
    hypothesis: string;
    evidence_for: string[];
    evidence_against: string[];
    probability: number;
  }>;
  conclusion: string;
  confidence: number;
}

export interface AILearning {
  id: string;
  timestamp: Date;
  type: 'learning';
  agent: string;
  observation: string;
  pattern: string;
  application: string;
  impact: 'immediate' | 'future';
}

export interface AIExploration {
  id: string;
  timestamp: Date;
  type: 'exploration';
  agent: string;
  exploring: string;
  paths_considered: Array<{
    path: string;
    reasoning: string;
    selected: boolean;
    confidence: number;
  }>;
  final_choice: string;
  alternatives_rejected: string[];
}

export interface AICollaboration {
  id: string;
  timestamp: Date;
  type: 'collaboration';
  agent: string;
  initiator: string;
  collaborators: string[];
  purpose: string;
  contributions: Array<{
    agent: string;
    contribution: string;
    impact: 'critical' | 'helpful' | 'minor';
  }>;
  outcome: string;
}

// Enhanced transparency tracker that works with the existing system
export class EnhancedAITransparencyTracker {
  private static enhancedInstance: EnhancedAITransparencyTracker;
  private enhancedEvents: AIEvent[] = [];
  private listeners: Map<string, (event: AIEvent) => void> = new Map();
  private maxEvents = 1000;

  static getEnhancedInstance(): EnhancedAITransparencyTracker {
    if (!EnhancedAITransparencyTracker.enhancedInstance) {
      EnhancedAITransparencyTracker.enhancedInstance = new EnhancedAITransparencyTracker();
    }
    return EnhancedAITransparencyTracker.enhancedInstance;
  }

  // Add event listener
  addEventListener(type: string, callback: (event: AIEvent) => void): void {
    this.listeners.set(`${type}_${Date.now()}`, callback);
  }

  // Get all events
  getEvents(): AIEvent[] {
    return [...this.enhancedEvents];
  }

  // Add event to history
  private addEvent(event: AIEvent): void {
    this.enhancedEvents.push(event);
    if (this.enhancedEvents.length > this.maxEvents) {
      this.enhancedEvents.shift();
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener(event));
  }

  // Track a debate between agents
  trackDebate(
    participants: string[],
    topic: string,
    positions: Array<{
      agent: string;
      stance: string;
      arguments: string[];
      confidence: number;
    }>,
    consensus?: string,
    dissent?: string[]
  ): AIDebate {
    const event: AIDebate = {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'debate',
      agent: 'orchestrator',
      participants,
      topic,
      positions,
      consensus,
      dissent
    };
    
    this.addEvent(event);
    
    // Also track in base system as thinking
    const thinking = createAIThinking(
      'orchestrator',
      'debate',
      `Debate on: ${topic}`,
      0.8,
      positions.map(p => `${p.agent}: ${p.stance}`),
      ['Evaluate positions', 'Seek consensus'],
      consensus || 'Ongoing debate'
    );
    aiTransparency.trackThinking(thinking);
    
    return event;
  }

  // Track reasoning process
  trackReasoning(
    agent: string,
    question: string,
    hypotheses: Array<{
      hypothesis: string;
      evidence_for: string[];
      evidence_against: string[];
      probability: number;
    }>,
    conclusion: string,
    confidence: number
  ): AIReasoning {
    const event: AIReasoning = {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'reasoning',
      agent,
      question,
      hypotheses,
      conclusion,
      confidence
    };
    
    this.addEvent(event);
    
    // Track in base system
    const thinking = createAIThinking(
      agent,
      'reasoning',
      question,
      confidence,
      hypotheses.map(h => h.hypothesis),
      ['Evaluate evidence', 'Draw conclusion'],
      conclusion
    );
    aiTransparency.trackThinking(thinking);
    
    return event;
  }

  // Track learning moments
  trackLearning(
    agent: string,
    observation: string,
    pattern: string,
    application: string,
    impact: 'immediate' | 'future'
  ): AILearning {
    const event: AILearning = {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'learning',
      agent,
      observation,
      pattern,
      application,
      impact
    };
    
    this.addEvent(event);
    
    // Track in base system
    const thinking = createAIThinking(
      agent,
      'learning',
      `Learning: ${observation}`,
      0.9,
      [pattern],
      [application],
      `Impact: ${impact}`
    );
    aiTransparency.trackThinking(thinking);
    
    return event;
  }

  // Track exploration of alternatives
  trackExploration(
    agent: string,
    exploring: string,
    paths: Array<{
      path: string;
      reasoning: string;
      selected: boolean;
      confidence: number;
    }>,
    final_choice: string,
    alternatives_rejected: string[]
  ): AIExploration {
    const event: AIExploration = {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'exploration',
      agent,
      exploring,
      paths_considered: paths,
      final_choice,
      alternatives_rejected
    };
    
    this.addEvent(event);
    
    // Track in base system
    const decision = createAIDecision(
      agent,
      final_choice,
      `Exploring: ${exploring}`,
      alternatives_rejected,
      Math.max(...paths.map(p => p.confidence)),
      paths.map(p => p.reasoning),
      'medium'
    );
    aiTransparency.trackDecision(decision);
    
    return event;
  }

  // Track collaboration between agents
  trackCollaboration(
    initiator: string,
    collaborators: string[],
    purpose: string,
    contributions: Array<{
      agent: string;
      contribution: string;
      impact: 'critical' | 'helpful' | 'minor';
    }>,
    outcome: string
  ): AICollaboration {
    const event: AICollaboration = {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'collaboration',
      agent: initiator,
      initiator,
      collaborators,
      purpose,
      contributions,
      outcome
    };
    
    this.addEvent(event);
    
    // Track in base system
    const thinking = createAIThinking(
      initiator,
      'collaboration',
      purpose,
      0.85,
      contributions.map(c => `${c.agent}: ${c.contribution}`),
      ['Synthesize inputs', 'Reach outcome'],
      outcome
    );
    aiTransparency.trackThinking(thinking);
    
    return event;
  }

  // Helper to create a thinking chain
  createThinkingChain(agent: string, thoughts: string[]): void {
    const chainId = this.generateId();
    thoughts.forEach((thought, index) => {
      const thinking = createAIThinking(
        agent,
        `chain_step_${index + 1}`,
        thought,
        0.8,
        [],
        index < thoughts.length - 1 ? [`Step ${index + 2}`] : ['Complete'],
        `Chain ${chainId}`,
        {
          chain_id: chainId,
          step: index + 1,
          total_steps: thoughts.length
        }
      );
      aiTransparency.trackThinking(thinking);
    });
  }

  // Track decision with alternatives
  trackDecisionWithAlternatives(
    agent: string,
    decision: string,
    alternatives: Array<{
      option: string;
      pros: string[];
      cons: string[];
      confidence: number;
      selected: boolean;
    }>,
    reasoning: string
  ): void {
    const selectedOption = alternatives.find(alt => alt.selected);
    const rejectedOptions = alternatives.filter(alt => !alt.selected);

    const decisionData = createAIDecision(
      agent,
      decision,
      reasoning,
      rejectedOptions.map(opt => opt.option),
      selectedOption?.confidence || 0.5,
      selectedOption?.pros || [],
      'high'
    );
    
    aiTransparency.trackDecision(decisionData);
    
    // Also track as exploration
    this.trackExploration(
      agent,
      decision,
      alternatives.map(alt => ({
        path: alt.option,
        reasoning: `Pros: ${alt.pros.join(', ')}; Cons: ${alt.cons.join(', ')}`,
        selected: alt.selected,
        confidence: alt.confidence
      })),
      selectedOption?.option || decision,
      rejectedOptions.map(opt => opt.option)
    );
  }

  // Track thinking (delegates to base system)
  trackThinking(agent: string, thought: string, metadata?: any): void {
    const thinking = createAIThinking(
      agent,
      metadata?.phase || 'thinking',
      thought,
      metadata?.confidence || 0.8,
      metadata?.evidence || [],
      metadata?.nextActions || [],
      metadata?.reasoning || '',
      metadata
    );
    aiTransparency.trackThinking(thinking);
  }

  // Track decision (delegates to base system)
  trackDecision(agent: string, decision: string, reasoning: string, metadata?: any): void {
    const decisionData = createAIDecision(
      agent,
      decision,
      reasoning,
      metadata?.alternatives || [],
      metadata?.confidence || 0.8,
      metadata?.evidence || [],
      metadata?.impact || 'medium'
    );
    aiTransparency.trackDecision(decisionData);
  }

  // Track analysis (delegates to base system)
  trackAnalysis(
    agent: string,
    analysisType: 'pattern' | 'sentiment' | 'priority' | 'similarity' | 'trend',
    input: string,
    output: any,
    methodology: string,
    confidence: number,
    dataPoints: number,
    insights: string[]
  ): void {
    // Note: Base system doesn't have createAIAnalysis helper, so we track as thinking
    const thinking = createAIThinking(
      agent,
      `analysis_${analysisType}`,
      `Analyzing ${analysisType}: ${input}`,
      confidence,
      insights,
      ['Apply insights', 'Share findings'],
      methodology,
      {
        analysisType,
        output,
        dataPoints
      }
    );
    aiTransparency.trackThinking(thinking);
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}