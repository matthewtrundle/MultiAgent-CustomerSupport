// Enhanced agent system types for wow-factor demo

export interface EnhancedAgentThought {
  id: string;
  timestamp: Date;
  agent: string;
  phase: 'gathering' | 'analyzing' | 'designing' | 'implementing' | 'validating';
  thoughtType: 'insight' | 'pattern' | 'anomaly' | 'recommendation' | 'collaboration' | 'decision';
  content: string;
  confidence: number;
  evidence: string[];
  metrics?: {
    impact?: string;
    risk?: string;
    effort?: string;
  };
  relatedPatterns?: string[];
  suggestedActions?: string[];
  collaborationNeeded?: string[];
}

export interface AgentCommunication {
  id: string;
  timestamp: Date;
  from: string;
  to: string;
  type: 'request' | 'insight' | 'confirmation' | 'alert' | 'decision';
  message: string;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ComprehensiveSolution {
  immediateActions: {
    title: string;
    steps: string[];
    estimatedTime: string;
    automatable: boolean;
  };
  workarounds: {
    title: string;
    description: string;
    effectiveness: number;
  }[];
  longTermSolution: {
    title: string;
    steps: string[];
    timeline: string;
    requiredResources: string[];
  };
  preventiveMeasures: string[];
  followUpPlan: {
    checkIn: string;
    validationSteps: string[];
    escalationTriggers: string[];
  };
}

export interface CustomerInsights {
  segment: 'new' | 'regular' | 'vip' | 'at-risk';
  lifetime_value: number;
  churn_risk: number;
  properties_managed: number;
  average_booking_value: number;
  support_history: {
    total_tickets: number;
    resolution_rate: number;
    average_satisfaction: number;
  };
  behavioral_patterns: string[];
}

export interface PatternAnalysis {
  similarTickets: {
    id: string;
    similarity: number;
    resolution: string;
    successRate: number;
  }[];
  emergingTrend: boolean;
  trendDetails?: {
    affectedUsers: number;
    growthRate: number;
    predictedImpact: string;
  };
  rootCauseHypothesis: string[];
  recommendedSystemChanges: string[];
}

export interface BusinessImpact {
  revenue_at_risk: number;
  potential_churn_cost: number;
  operational_cost: number;
  priority_score: number;
  recommended_sla: string;
}
