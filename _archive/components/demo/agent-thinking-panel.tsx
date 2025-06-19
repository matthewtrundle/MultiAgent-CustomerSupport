'use client';

import { useState, useEffect } from 'react';
import { Brain, Sparkles, MessageSquare, Search, Shield, Zap } from 'lucide-react';

export interface AgentThought {
  id: string;
  agent: string;
  timestamp: Date;
  type: 'analysis' | 'decision' | 'collaboration' | 'learning';
  thought: string;
  confidence: number;
  evidence?: string[];
  relatedAgents?: string[];
}

interface AgentThinkingPanelProps {
  thoughts: AgentThought[];
  isProcessing: boolean;
}

const agentProfiles = {
  'Router Agent': {
    name: 'Alex',
    role: 'Triage Specialist',
    avatar: '🎯',
    color: 'blue',
    icon: Zap,
  },
  'Technical Support Agent': {
    name: 'Dr. Debug',
    role: 'Tech Expert',
    avatar: '🔧',
    color: 'purple',
    icon: Brain,
  },
  'Billing Agent': {
    name: 'Fin',
    role: 'Financial Specialist',
    avatar: '💰',
    color: 'green',
    icon: Shield,
  },
  'Product Expert Agent': {
    name: 'Sage',
    role: 'Platform Guide',
    avatar: '📚',
    color: 'orange',
    icon: Sparkles,
  },
  'QA Agent': {
    name: 'Quinn',
    role: 'Quality Guardian',
    avatar: '✅',
    color: 'red',
    icon: Shield,
  },
  'Knowledge Base': {
    name: 'Atlas',
    role: 'Information Hub',
    avatar: '🗂️',
    color: 'gray',
    icon: Search,
  },
};

export function AgentThinkingPanel({ thoughts, isProcessing }: AgentThinkingPanelProps) {
  const [displayedThoughts, setDisplayedThoughts] = useState<AgentThought[]>([]);

  useEffect(() => {
    // Animate thoughts appearing one by one
    thoughts.forEach((thought, index) => {
      setTimeout(() => {
        setDisplayedThoughts(prev => {
          if (prev.find(t => t.id === thought.id)) return prev;
          return [...prev, thought];
        });
      }, index * 300);
    });
  }, [thoughts]);

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'border-blue-200 bg-blue-50',
      purple: 'border-purple-200 bg-purple-50',
      green: 'border-green-200 bg-green-50',
      orange: 'border-orange-200 bg-orange-50',
      red: 'border-red-200 bg-red-50',
      gray: 'border-gray-200 bg-gray-50',
    };
    return colors[color] || colors.gray;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          AI Agent Thinking Process
        </h3>
        {isProcessing && (
          <div className="flex items-center gap-2 text-purple-400 text-sm">
            <div className="animate-pulse">●</div>
            Processing...
          </div>
        )}
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
        {displayedThoughts.map((thought, index) => {
          const profile = agentProfiles[thought.agent as keyof typeof agentProfiles] || agentProfiles['Router Agent'];
          const Icon = profile.icon;
          
          return (
            <div
              key={thought.id}
              className={`border rounded-lg p-4 ${getColorClasses(profile.color)} transform transition-all duration-300 ${
                index === displayedThoughts.length - 1 ? 'scale-105' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">
                    {profile.avatar}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-semibold text-gray-900">{profile.name}</span>
                      <span className="text-xs text-gray-600 ml-2">({profile.role})</span>
                    </div>
                    <span className={`text-xs font-medium ${getConfidenceColor(thought.confidence)}`}>
                      {Math.round(thought.confidence * 100)}% confident
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-800 mb-2">{thought.thought}</p>
                  
                  {thought.evidence && thought.evidence.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-600 mb-1">Evidence:</p>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {thought.evidence.map((evidence, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{evidence}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {thought.type === 'collaboration' && thought.relatedAgents && (
                    <div className="mt-2 flex items-center gap-2">
                      <MessageSquare className="h-3 w-3 text-gray-600" />
                      <span className="text-xs text-gray-600">
                        Collaborating with: {thought.relatedAgents.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {displayedThoughts.length === 0 && !isProcessing && (
          <div className="text-center py-12 text-gray-400">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Agent thoughts will appear here...</p>
          </div>
        )}
      </div>

      {/* Neural Network Visualization */}
      {isProcessing && displayedThoughts.length > 0 && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Neural Pathways Active</span>
            <span className="text-purple-400">
              {displayedThoughts.filter(t => t.type === 'collaboration').length} collaborations
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}