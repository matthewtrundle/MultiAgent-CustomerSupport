/**
 * AI Transparency System
 * Captures and streams real AI agent thinking and processing
 */

export interface AIPrompt {
  id: string;
  timestamp: Date;
  agent: string;
  type: 'system' | 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any>;
}

export interface AIResponse {
  id: string;
  timestamp: Date;
  agent: string;
  prompt: string;
  response: string;
  model: string;
  temperature: number;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  confidence: number;
  reasoning?: string;
  metadata?: Record<string, any>;
}

export interface AIThinking {
  id: string;
  timestamp: Date;
  agent: string;
  phase: string;
  thought: string;
  confidence: number;
  evidence: string[];
  nextActions: string[];
  reasoning: string;
  metadata?: Record<string, any>;
}

export interface AIInteraction {
  id: string;
  timestamp: Date;
  fromAgent: string;
  toAgent: string;
  messageType: 'request' | 'response' | 'insight' | 'question';
  content: string;
  data?: any;
  confidence: number;
}

export interface AIDecision {
  id: string;
  timestamp: Date;
  agent: string;
  decision: string;
  reasoning: string;
  alternatives: string[];
  confidence: number;
  evidence: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface AIAnalysis {
  id: string;
  timestamp: Date;
  agent: string;
  analysisType: 'pattern' | 'sentiment' | 'priority' | 'similarity' | 'trend';
  input: string;
  output: any;
  methodology: string;
  confidence: number;
  dataPoints: number;
  insights: string[];
}

type AITransparencyEvent = 
  | { type: 'prompt'; data: AIPrompt }
  | { type: 'response'; data: AIResponse }
  | { type: 'thinking'; data: AIThinking }
  | { type: 'interaction'; data: AIInteraction }
  | { type: 'decision'; data: AIDecision }
  | { type: 'analysis'; data: AIAnalysis };

export type AITransparencyListener = (event: AITransparencyEvent) => void;

class AITransparencyTracker {
  private listeners: Map<string, AITransparencyListener> = new Map();
  private events: AITransparencyEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events

  // Event listeners management
  addListener(id: string, listener: AITransparencyListener) {
    this.listeners.set(id, listener);
  }

  removeListener(id: string) {
    this.listeners.delete(id);
  }

  private emit(event: AITransparencyEvent) {
    // Store event
    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in AI transparency listener:', error);
      }
    });
  }

  // Track AI prompts being sent
  trackPrompt(prompt: AIPrompt) {
    this.emit({ type: 'prompt', data: prompt });
  }

  // Track AI responses received
  trackResponse(response: AIResponse) {
    this.emit({ type: 'response', data: response });
  }

  // Track agent thinking process
  trackThinking(thinking: AIThinking) {
    this.emit({ type: 'thinking', data: thinking });
  }

  // Track inter-agent communication
  trackInteraction(interaction: AIInteraction) {
    this.emit({ type: 'interaction', data: interaction });
  }

  // Track agent decisions
  trackDecision(decision: AIDecision) {
    this.emit({ type: 'decision', data: decision });
  }

  // Track analysis processes
  trackAnalysis(analysis: AIAnalysis) {
    this.emit({ type: 'analysis', data: analysis });
  }

  // Get recent events
  getRecentEvents(limit = 100): AITransparencyEvent[] {
    return this.events.slice(-limit);
  }

  // Get events by type
  getEventsByType(type: AITransparencyEvent['type'], limit = 50): AITransparencyEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit);
  }

  // Get events by agent
  getEventsByAgent(agent: string, limit = 50): AITransparencyEvent[] {
    return this.events
      .filter(event => {
        switch (event.type) {
          case 'prompt':
          case 'response':
          case 'thinking':
          case 'decision':
          case 'analysis':
            return event.data.agent === agent;
          case 'interaction':
            return event.data.fromAgent === agent || event.data.toAgent === agent;
          default:
            return false;
        }
      })
      .slice(-limit);
  }

  // Clear all events
  clear() {
    this.events = [];
  }
}

// Global singleton instance
export const aiTransparency = new AITransparencyTracker();

// Utility functions for creating events
export function createAIPrompt(
  agent: string,
  type: AIPrompt['type'],
  content: string,
  metadata?: Record<string, any>
): AIPrompt {
  return {
    id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    agent,
    type,
    content,
    metadata
  };
}

export function createAIResponse(
  agent: string,
  prompt: string,
  response: string,
  model: string,
  temperature: number,
  tokens: AIResponse['tokens'],
  confidence: number,
  reasoning?: string,
  metadata?: Record<string, any>
): AIResponse {
  return {
    id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    agent,
    prompt,
    response,
    model,
    temperature,
    tokens,
    confidence,
    reasoning,
    metadata
  };
}

export function createAIThinking(
  agent: string,
  phase: string,
  thought: string,
  confidence: number,
  evidence: string[] = [],
  nextActions: string[] = [],
  reasoning: string = '',
  metadata?: Record<string, any>
): AIThinking {
  return {
    id: `thinking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    agent,
    phase,
    thought,
    confidence,
    evidence,
    nextActions,
    reasoning,
    metadata
  };
}

export function createAIInteraction(
  fromAgent: string,
  toAgent: string,
  messageType: AIInteraction['messageType'],
  content: string,
  confidence: number,
  data?: any
): AIInteraction {
  return {
    id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    fromAgent,
    toAgent,
    messageType,
    content,
    data,
    confidence
  };
}

export function createAIDecision(
  agent: string,
  decision: string,
  reasoning: string,
  alternatives: string[],
  confidence: number,
  evidence: string[],
  impact: AIDecision['impact']
): AIDecision {
  return {
    id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    agent,
    decision,
    reasoning,
    alternatives,
    confidence,
    evidence,
    impact
  };
}

export function createAIAnalysis(
  agent: string,
  analysisType: AIAnalysis['analysisType'],
  input: string,
  output: any,
  methodology: string,
  confidence: number,
  dataPoints: number,
  insights: string[]
): AIAnalysis {
  return {
    id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    agent,
    analysisType,
    input,
    output,
    methodology,
    confidence,
    dataPoints,
    insights
  };
}