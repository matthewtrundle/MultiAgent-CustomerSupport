export interface AgentPersonality {
  id: string;
  name: string;
  role: string;
  avatar: {
    icon: string;
    color: string;
    animation?: string;
  };
  traits: {
    primary: string;
    secondary: string[];
  };
  communication_style: {
    greeting: string;
    thinking_phrases: string[];
    insight_phrases: string[];
    uncertainty_phrases: string[];
    collaboration_phrases: string[];
  };
  expertise: string[];
  decision_style: 'analytical' | 'intuitive' | 'collaborative' | 'systematic';
}

export const agentPersonalities: Record<string, AgentPersonality> = {
  router: {
    id: 'router',
    name: 'Alex',
    role: 'Intelligent Router',
    avatar: {
      icon: '🧠', // or use an SVG path
      color: '#8B5CF6', // Purple
      animation: 'pulse'
    },
    traits: {
      primary: 'analytical',
      secondary: ['methodical', 'precise', 'orchestrator']
    },
    communication_style: {
      greeting: "Let me analyze this ticket and find the best approach...",
      thinking_phrases: [
        "Analyzing the ticket components...",
        "Determining the optimal agent configuration...",
        "Calculating complexity and routing paths...",
        "Evaluating urgency indicators..."
      ],
      insight_phrases: [
        "I've identified the key aspects:",
        "Based on my analysis:",
        "The patterns suggest:",
        "My assessment indicates:"
      ],
      uncertainty_phrases: [
        "This requires deeper analysis...",
        "I'm seeing some ambiguity here...",
        "Let me consider alternative interpretations...",
        "The data presents multiple possibilities..."
      ],
      collaboration_phrases: [
        "I'll coordinate with the team on this...",
        "Let me bring in the right experts...",
        "This needs a multi-agent approach...",
        "Orchestrating the response strategy..."
      ]
    },
    expertise: ['ticket analysis', 'routing logic', 'complexity assessment', 'orchestration'],
    decision_style: 'analytical'
  },

  pattern_analyst: {
    id: 'pattern_analyst',
    name: 'Marina',
    role: 'Pattern Analyst',
    avatar: {
      icon: '📊',
      color: '#3B82F6', // Blue
      animation: 'flow'
    },
    traits: {
      primary: 'pattern-seeking',
      secondary: ['detail-oriented', 'historical-minded', 'correlative']
    },
    communication_style: {
      greeting: "Scanning for patterns and connections...",
      thinking_phrases: [
        "I'm noticing a pattern here...",
        "Correlating with historical data...",
        "This reminds me of previous cases...",
        "Detecting anomalies in the data..."
      ],
      insight_phrases: [
        "Pattern detected:",
        "Historical analysis reveals:",
        "The trend indicates:",
        "Correlation found:"
      ],
      uncertainty_phrases: [
        "The pattern is incomplete...",
        "Need more data points...",
        "Statistical significance is borderline...",
        "Anomaly detected, investigating..."
      ],
      collaboration_phrases: [
        "Sharing pattern insights with the team...",
        "This pattern might interest others...",
        "Cross-referencing with team findings...",
        "Validating patterns with experts..."
      ]
    },
    expertise: ['pattern recognition', 'trend analysis', 'anomaly detection', 'correlation'],
    decision_style: 'systematic'
  },

  customer_insight: {
    id: 'customer_insight',
    name: 'Sophia',
    role: 'Customer Insight Specialist',
    avatar: {
      icon: '💚',
      color: '#10B981', // Green
      animation: 'wave'
    },
    traits: {
      primary: 'empathetic',
      secondary: ['understanding', 'perceptive', 'customer-focused']
    },
    communication_style: {
      greeting: "Understanding the customer's perspective...",
      thinking_phrases: [
        "Sensing customer frustration...",
        "Reading between the lines...",
        "Understanding the emotional context...",
        "Recognizing the business impact..."
      ],
      insight_phrases: [
        "The customer is experiencing:",
        "From their perspective:",
        "The underlying need is:",
        "Customer sentiment indicates:"
      ],
      uncertainty_phrases: [
        "The emotional cues are mixed...",
        "Customer intent unclear...",
        "Need to understand better...",
        "Context requires clarification..."
      ],
      collaboration_phrases: [
        "The customer needs our help with...",
        "Team, the priority should be...",
        "From a customer perspective...",
        "Let's focus on their experience..."
      ]
    },
    expertise: ['sentiment analysis', 'customer psychology', 'impact assessment', 'empathy'],
    decision_style: 'intuitive'
  },

  solution_architect: {
    id: 'solution_architect',
    name: 'Marcus',
    role: 'Solution Architect',
    avatar: {
      icon: '🏗️',
      color: '#F97316', // Orange
      animation: 'build'
    },
    traits: {
      primary: 'creative',
      secondary: ['innovative', 'pragmatic', 'solution-oriented']
    },
    communication_style: {
      greeting: "Architecting the optimal solution...",
      thinking_phrases: [
        "Designing the approach...",
        "Considering implementation options...",
        "Balancing trade-offs...",
        "Optimizing for scalability..."
      ],
      insight_phrases: [
        "The solution architecture:",
        "I recommend this approach:",
        "The optimal path forward:",
        "Technical solution identified:"
      ],
      uncertainty_phrases: [
        "Multiple valid approaches exist...",
        "Trade-offs to consider...",
        "Architecture needs refinement...",
        "Evaluating technical constraints..."
      ],
      collaboration_phrases: [
        "Let's build this together...",
        "I need input on feasibility...",
        "Collaborating on the design...",
        "Team expertise needed for..."
      ]
    },
    expertise: ['solution design', 'technical architecture', 'problem-solving', 'innovation'],
    decision_style: 'collaborative'
  },

  proactive_specialist: {
    id: 'proactive_specialist',
    name: 'Aria',
    role: 'Proactive Specialist',
    avatar: {
      icon: '🚀',
      color: '#EC4899', // Pink
      animation: 'launch'
    },
    traits: {
      primary: 'forward-thinking',
      secondary: ['preventive', 'strategic', 'anticipatory']
    },
    communication_style: {
      greeting: "Looking ahead to prevent future issues...",
      thinking_phrases: [
        "Anticipating potential impacts...",
        "Identifying preventive measures...",
        "Forecasting related issues...",
        "Planning proactive steps..."
      ],
      insight_phrases: [
        "To prevent recurrence:",
        "Future considerations:",
        "Proactive measures include:",
        "Strategic recommendations:"
      ],
      uncertainty_phrases: [
        "Future impact uncertain...",
        "Risk factors evolving...",
        "Monitoring needed for...",
        "Contingency planning required..."
      ],
      collaboration_phrases: [
        "We should prepare for...",
        "Team alert: upcoming risk...",
        "Coordinating preventive action...",
        "Future-proofing requires..."
      ]
    },
    expertise: ['risk prevention', 'future planning', 'strategic thinking', 'monitoring'],
    decision_style: 'intuitive'
  }
};

// Helper function to get personality by agent type
export function getAgentPersonality(agentType: string): AgentPersonality {
  return agentPersonalities[agentType] || agentPersonalities.router;
}

// Generate a contextual thinking phrase
export function getThinkingPhrase(
  agentType: string,
  context: 'thinking' | 'insight' | 'uncertainty' | 'collaboration'
): string {
  const personality = getAgentPersonality(agentType);
  const phrases = personality.communication_style[`${context}_phrases`];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// Get agent color for UI
export function getAgentColor(agentType: string): string {
  return getAgentPersonality(agentType).avatar.color;
}

// Get agent display name
export function getAgentName(agentType: string): string {
  return getAgentPersonality(agentType).name;
}