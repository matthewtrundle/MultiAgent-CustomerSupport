import { useState, useEffect } from 'react';
import { Brain, Target, Lightbulb, Database, MessageSquare, TrendingUp } from 'lucide-react';

export interface AgentCapability {
  name: string;
  description: string;
  icon: React.ReactNode;
}

export interface AgentGoal {
  primary: string;
  metrics: string[];
}

export interface AgentThought {
  id: string;
  timestamp: Date;
  agent: string;
  thoughtType: 'analyzing' | 'searching' | 'deciding' | 'collaborating' | 'learning';
  content: string;
  confidence: number;
  evidence?: string[];
  relatedTickets?: string[];
  suggestedActions?: string[];
  collaborationNeeded?: string[];
}

export interface AgentProfile {
  name: string;
  role: string;
  avatar: string;
  capabilities: AgentCapability[];
  goals: AgentGoal;
  systemPrompt: string;
}

const agentProfiles: Record<string, AgentProfile> = {
  'Router Agent': {
    name: 'Alex',
    role: 'Triage Specialist',
    avatar: '🎯',
    capabilities: [
      {
        name: 'Pattern Recognition',
        description: 'Identifies issue patterns from description',
        icon: <Brain className="w-4 h-4" />,
      },
      {
        name: 'Priority Assessment',
        description: 'Determines urgency based on impact',
        icon: <TrendingUp className="w-4 h-4" />,
      },
      {
        name: 'Category Classification',
        description: 'Routes to appropriate specialist',
        icon: <Target className="w-4 h-4" />,
      },
    ],
    goals: {
      primary: 'Route tickets to the right specialist in <30 seconds',
      metrics: ['Classification Accuracy: 94%', 'Avg Route Time: 12s', 'Escalation Rate: 8%'],
    },
    systemPrompt:
      'Analyze tickets for vacation rental issues, classify by type, assess urgency, and route to specialists.',
  },
  'Technical Support Agent': {
    name: 'Dr. Debug',
    role: 'Technical Expert',
    avatar: '🔧',
    capabilities: [
      {
        name: 'Integration Diagnostics',
        description: 'Troubleshoots API and sync issues',
        icon: <Database className="w-4 h-4" />,
      },
      {
        name: 'Solution Synthesis',
        description: 'Creates step-by-step fixes',
        icon: <Lightbulb className="w-4 h-4" />,
      },
      {
        name: 'Historical Analysis',
        description: 'References past solutions',
        icon: <MessageSquare className="w-4 h-4" />,
      },
    ],
    goals: {
      primary: 'Resolve technical issues with clear, actionable steps',
      metrics: ['First Contact Resolution: 78%', 'Solution Accuracy: 91%', 'Avg Handle Time: 8min'],
    },
    systemPrompt:
      'Diagnose technical issues with property management systems, provide detailed solutions, reference documentation.',
  },
  'Billing Support Agent': {
    name: 'Penny',
    role: 'Financial Specialist',
    avatar: '💰',
    capabilities: [
      {
        name: 'Transaction Analysis',
        description: 'Traces payment flows',
        icon: <TrendingUp className="w-4 h-4" />,
      },
      {
        name: 'Policy Application',
        description: 'Applies refund and fee policies',
        icon: <Target className="w-4 h-4" />,
      },
      {
        name: 'Calculation Verification',
        description: 'Validates fees and taxes',
        icon: <Brain className="w-4 h-4" />,
      },
    ],
    goals: {
      primary: 'Resolve billing issues accurately while maintaining trust',
      metrics: ['Payment Accuracy: 99.5%', 'Dispute Resolution: 85%', 'Policy Compliance: 100%'],
    },
    systemPrompt:
      'Handle billing inquiries, process refunds per policy, explain fee structures, ensure compliance.',
  },
  'Product Expert Agent': {
    name: 'Sophie',
    role: 'Product Specialist',
    avatar: '📚',
    capabilities: [
      {
        name: 'Feature Guidance',
        description: 'Explains platform capabilities',
        icon: <Lightbulb className="w-4 h-4" />,
      },
      {
        name: 'Best Practices',
        description: 'Shares optimization strategies',
        icon: <TrendingUp className="w-4 h-4" />,
      },
      {
        name: 'Use Case Mapping',
        description: 'Matches features to needs',
        icon: <Target className="w-4 h-4" />,
      },
    ],
    goals: {
      primary: 'Enable hosts to maximize platform features for success',
      metrics: ['Feature Adoption: 67%', 'Tutorial Completion: 82%', 'Success Metrics: +23%'],
    },
    systemPrompt:
      'Guide users through platform features, share best practices, provide strategic advice for property success.',
  },
  'QA Agent': {
    name: 'Quinn',
    role: 'Quality Assurance',
    avatar: '✅',
    capabilities: [
      {
        name: 'Response Validation',
        description: 'Ensures accuracy and completeness',
        icon: <Brain className="w-4 h-4" />,
      },
      {
        name: 'Tone Analysis',
        description: 'Maintains professional communication',
        icon: <MessageSquare className="w-4 h-4" />,
      },
      {
        name: 'Compliance Check',
        description: 'Verifies policy adherence',
        icon: <Target className="w-4 h-4" />,
      },
    ],
    goals: {
      primary: 'Ensure every response meets quality and compliance standards',
      metrics: ['Quality Score: 96%', 'Compliance Rate: 99%', 'Customer Satisfaction: 4.7/5'],
    },
    systemPrompt:
      'Review agent responses for accuracy, completeness, tone, and policy compliance before sending.',
  },
  'Knowledge Base': {
    name: 'Atlas',
    role: 'Information Specialist',
    avatar: '📖',
    capabilities: [
      {
        name: 'Semantic Search',
        description: 'Finds relevant past solutions',
        icon: <Database className="w-4 h-4" />,
      },
      {
        name: 'Pattern Matching',
        description: 'Identifies similar issues',
        icon: <Brain className="w-4 h-4" />,
      },
      {
        name: 'Solution Ranking',
        description: 'Prioritizes by success rate',
        icon: <TrendingUp className="w-4 h-4" />,
      },
    ],
    goals: {
      primary: 'Provide instant access to proven solutions',
      metrics: ['Search Accuracy: 89%', 'Avg Response Time: 1.2s', 'Knowledge Coverage: 94%'],
    },
    systemPrompt:
      'Search knowledge base for relevant solutions, rank by relevance and success rate.',
  },
};

interface EnhancedAgentThinkingProps {
  thoughts: AgentThought[];
  isProcessing: boolean;
  currentAgent?: string;
}

export function EnhancedAgentThinking({
  thoughts,
  isProcessing,
  currentAgent,
}: EnhancedAgentThinkingProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const activeProfile = selectedAgent
    ? agentProfiles[selectedAgent]
    : currentAgent
      ? agentProfiles[currentAgent]
      : null;

  const getThoughtIcon = (type: AgentThought['thoughtType']) => {
    switch (type) {
      case 'analyzing':
        return '🔍';
      case 'searching':
        return '🔎';
      case 'deciding':
        return '🤔';
      case 'collaborating':
        return '🤝';
      case 'learning':
        return '📚';
    }
  };

  const getThoughtColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Brain className="mr-2 h-5 w-5 text-purple-400" />
          AI Agent Intelligence Center
        </h2>
        {isProcessing && (
          <div className="flex items-center text-sm text-purple-400">
            <div className="animate-pulse mr-2">●</div>
            Processing
          </div>
        )}
      </div>

      {/* Agent Selection */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {Object.entries(agentProfiles).map(([agent, profile]) => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent === selectedAgent ? null : agent)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                agent === selectedAgent || agent === currentAgent
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="mr-1">{profile.avatar}</span>
              {profile.name}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Profile */}
      {activeProfile && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <span className="text-2xl mr-2">{activeProfile.avatar}</span>
                {activeProfile.name}
              </h3>
              <p className="text-sm text-gray-400">{activeProfile.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-purple-400 mb-2">Core Capabilities</h4>
              <div className="space-y-2">
                {activeProfile.capabilities.map((cap, idx) => (
                  <div key={idx} className="flex items-start text-sm">
                    <div className="mr-2 mt-0.5 text-purple-500">{cap.icon}</div>
                    <div>
                      <div className="font-medium">{cap.name}</div>
                      <div className="text-xs text-gray-500">{cap.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-purple-400 mb-2">Performance Metrics</h4>
              <div className="mb-2">
                <div className="text-sm font-medium">{activeProfile.goals.primary}</div>
              </div>
              <div className="space-y-1">
                {activeProfile.goals.metrics.map((metric, idx) => (
                  <div key={idx} className="text-xs text-gray-400">
                    {metric}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 italic">System: {activeProfile.systemPrompt}</div>
          <div className="text-xs text-purple-400 mt-2">
            Powered by Claude 3 Sonnet via OpenRouter API
          </div>
        </div>
      )}

      {/* Real-time Thoughts */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {thoughts.length === 0 && !isProcessing ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Agents are standing by...</p>
          </div>
        ) : (
          thoughts.map((thought) => (
            <div
              key={thought.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{getThoughtIcon(thought.thoughtType)}</span>
                  <span className="font-medium">{thought.agent}</span>
                  <span className={`ml-2 text-sm ${getThoughtColor(thought.confidence)}`}>
                    {Math.round(thought.confidence * 100)}% confident
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {typeof window !== 'undefined'
                    ? new Date(thought.timestamp).toLocaleTimeString()
                    : ''}
                </span>
              </div>

              <p className="text-sm mb-2">{thought.content}</p>

              {thought.evidence && thought.evidence.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-gray-400">Evidence:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {thought.evidence.map((item, idx) => (
                      <span key={idx} className="text-xs bg-gray-700 px-2 py-1 rounded">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {thought.relatedTickets && thought.relatedTickets.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-gray-400">Similar tickets:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {thought.relatedTickets.map((ticket, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded"
                      >
                        {ticket}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {thought.suggestedActions && thought.suggestedActions.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-gray-400">Suggested actions:</span>
                  <ul className="mt-1 space-y-1">
                    {thought.suggestedActions.map((action, idx) => (
                      <li key={idx} className="text-xs text-green-400 flex items-start">
                        <span className="mr-1">→</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {thought.collaborationNeeded && thought.collaborationNeeded.length > 0 && (
                <div>
                  <span className="text-xs text-gray-400">Requesting help from:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {thought.collaborationNeeded.map((agent, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded"
                      >
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
