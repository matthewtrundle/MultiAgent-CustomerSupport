'use client';

import { useState, useEffect } from 'react';
import { 
  Brain, 
  Cpu, 
  MessageSquare, 
  Lightbulb, 
  TrendingUp,
  Search,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Database,
  Target
} from 'lucide-react';

// Types from our AI transparency system
interface AIPrompt {
  id: string;
  timestamp: Date;
  agent: string;
  type: 'system' | 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any>;
}

interface AIResponse {
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

interface AIThinking {
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

interface AIInteraction {
  id: string;
  timestamp: Date;
  fromAgent: string;
  toAgent: string;
  messageType: 'request' | 'response' | 'insight' | 'question';
  content: string;
  data?: any;
  confidence: number;
}

interface AIDecision {
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

interface AIAnalysis {
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

interface RealAITransparencyProps {
  events: AITransparencyEvent[];
  isProcessing: boolean;
  processingStats?: {
    prompts: number;
    responses: number;
    thoughts: number;
    decisions: number;
    analyses: number;
  };
}

export function RealAITransparency({ 
  events, 
  isProcessing, 
  processingStats 
}: RealAITransparencyProps) {
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const getEventIcon = (type: AITransparencyEvent['type']) => {
    switch (type) {
      case 'prompt':
        return <MessageSquare className="w-4 h-4" />;
      case 'response':
        return <Cpu className="w-4 h-4" />;
      case 'thinking':
        return <Brain className="w-4 h-4" />;
      case 'interaction':
        return <ArrowRight className="w-4 h-4" />;
      case 'decision':
        return <Target className="w-4 h-4" />;
      case 'analysis':
        return <Database className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: AITransparencyEvent['type']) => {
    switch (type) {
      case 'prompt':
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      case 'response':
        return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'thinking':
        return 'text-purple-400 bg-purple-900/20 border-purple-500/30';
      case 'interaction':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'decision':
        return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'analysis':
        return 'text-cyan-400 bg-cyan-900/20 border-cyan-500/30';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'text-red-400 bg-red-900/20';
      case 'high':
        return 'text-orange-400 bg-orange-900/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'low':
        return 'text-green-400 bg-green-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const filteredEvents = events.filter(event => {
    if (selectedEventType !== 'all' && event.type !== selectedEventType) return false;
    
    const agentName = (() => {
      switch (event.type) {
        case 'prompt':
        case 'response':
        case 'thinking':
        case 'decision':
        case 'analysis':
          return event.data.agent;
        case 'interaction':
          return event.data.fromAgent;
        default:
          return '';
      }
    })();
    
    if (selectedAgent !== 'all' && agentName !== selectedAgent) return false;
    
    return true;
  });

  const uniqueAgents = Array.from(new Set(events.map(event => {
    switch (event.type) {
      case 'prompt':
      case 'response':
      case 'thinking':
      case 'decision':
      case 'analysis':
        return event.data.agent;
      case 'interaction':
        return event.data.fromAgent;
      default:
        return '';
    }
  }).filter(Boolean)));

  const toggleExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const formatTimestamp = (timestamp: Date | string | undefined) => {
    if (!timestamp) return 'N/A';
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        fractionalSecondDigits: 3
      });
    } catch (error) {
      return 'Invalid timestamp';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Brain className="mr-2 h-5 w-5 text-purple-400" />
          Real AI Agent Processing
          <span className="ml-2 text-sm text-gray-400">Glass Car View</span>
        </h2>
        {isProcessing && (
          <div className="flex items-center text-sm text-purple-400">
            <div className="animate-pulse mr-2">●</div>
            Live Processing
          </div>
        )}
      </div>

      {/* Processing Stats */}
      {processingStats && (
        <div className="mb-6 grid grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-blue-400 text-lg font-bold">{processingStats.prompts}</div>
            <div className="text-xs text-gray-400">Prompts</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-green-400 text-lg font-bold">{processingStats.responses}</div>
            <div className="text-xs text-gray-400">Responses</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-purple-400 text-lg font-bold">{processingStats.thoughts}</div>
            <div className="text-xs text-gray-400">Thoughts</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-red-400 text-lg font-bold">{processingStats.decisions}</div>
            <div className="text-xs text-gray-400">Decisions</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-cyan-400 text-lg font-bold">{processingStats.analyses}</div>
            <div className="text-xs text-gray-400">Analyses</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <div className="flex gap-2">
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
          >
            <option value="all">All Events</option>
            <option value="prompt">Prompts</option>
            <option value="response">Responses</option>
            <option value="thinking">Thinking</option>
            <option value="interaction">Interactions</option>
            <option value="decision">Decisions</option>
            <option value="analysis">Analysis</option>
          </select>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
          >
            <option value="all">All Agents</option>
            {uniqueAgents.map(agent => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-400">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      </div>

      {/* Events */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredEvents.length === 0 && !isProcessing ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No AI events captured yet...</p>
            <p className="text-sm mt-1">Process a ticket to see real AI agent thinking</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const eventId = (() => {
              switch (event.type) {
                case 'prompt':
                case 'response':
                case 'thinking':
                case 'interaction':
                case 'decision':
                case 'analysis':
                  return event.data.id;
                default:
                  return Math.random().toString();
              }
            })();

            const isExpanded = expandedEvents.has(eventId);

            return (
              <div
                key={eventId}
                className={`border rounded-lg p-4 hover:border-purple-600 transition-colors cursor-pointer ${getEventColor(event.type)}`}
                onClick={() => toggleExpanded(eventId)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <span className="mr-2">{getEventIcon(event.type)}</span>
                    <span className="font-medium capitalize">{event.type}</span>
                    <span className="ml-2 text-sm">
                      {(() => {
                        switch (event.type) {
                          case 'prompt':
                          case 'response':
                          case 'thinking':
                          case 'decision':
                          case 'analysis':
                            return event.data.agent;
                          case 'interaction':
                            return `${event.data.fromAgent} → ${event.data.toAgent}`;
                          default:
                            return '';
                        }
                      })()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp((() => {
                      switch (event.type) {
                        case 'prompt':
                        case 'response':
                        case 'thinking':
                        case 'interaction':
                        case 'decision':
                        case 'analysis':
                          return event.data.timestamp;
                        default:
                          return new Date();
                      }
                    })())}
                  </span>
                </div>

                {/* Event Summary */}
                <div className="text-sm mb-2">
                  {event.type === 'prompt' && (
                    <div>
                      <span className="font-medium">{event.data.type.toUpperCase()}:</span> 
                      <span className="ml-1">{event.data.content.substring(0, 100)}...</span>
                    </div>
                  )}
                  {event.type === 'response' && (
                    <div>
                      <span className="font-medium">AI Response:</span>
                      <span className="ml-1">{event.data.response.substring(0, 100)}...</span>
                      <div className="flex items-center mt-1 space-x-4 text-xs">
                        <span>Model: {event.data.model}</span>
                        <span>Tokens: {event.data.tokens.total}</span>
                        <span className={getConfidenceColor(event.data.confidence)}>
                          {Math.round(event.data.confidence * 100)}% confident
                        </span>
                      </div>
                    </div>
                  )}
                  {event.type === 'thinking' && (
                    <div>
                      <span className="font-medium">{event.data.phase}:</span>
                      <span className="ml-1">{event.data.thought}</span>
                      <div className="flex items-center mt-1 text-xs">
                        <span className={getConfidenceColor(event.data.confidence)}>
                          {Math.round(event.data.confidence * 100)}% confident
                        </span>
                      </div>
                    </div>
                  )}
                  {event.type === 'interaction' && (
                    <div>
                      <span className="font-medium">{event.data.messageType.toUpperCase()}:</span>
                      <span className="ml-1">{event.data.content}</span>
                    </div>
                  )}
                  {event.type === 'decision' && (
                    <div>
                      <span className="font-medium">Decision:</span>
                      <span className="ml-1">{event.data.decision}</span>
                      <div className="flex items-center mt-1 space-x-4 text-xs">
                        <span className={getConfidenceColor(event.data.confidence)}>
                          {Math.round(event.data.confidence * 100)}% confident
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getImpactColor(event.data.impact)}`}>
                          {event.data.impact} impact
                        </span>
                      </div>
                    </div>
                  )}
                  {event.type === 'analysis' && (
                    <div>
                      <span className="font-medium">{event.data.analysisType} Analysis:</span>
                      <span className="ml-1">{event.data.methodology}</span>
                      <div className="flex items-center mt-1 space-x-4 text-xs">
                        <span>{event.data.dataPoints} data points</span>
                        <span className={getConfidenceColor(event.data.confidence)}>
                          {Math.round(event.data.confidence * 100)}% confident
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 p-3 bg-gray-800/50 rounded border-l-2 border-purple-500">
                    {event.type === 'prompt' && (
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-gray-400">Full Prompt:</span>
                          <pre className="text-xs mt-1 whitespace-pre-wrap bg-gray-900 p-2 rounded">
                            {event.data.content}
                          </pre>
                        </div>
                        {event.data.metadata && (
                          <div>
                            <span className="text-xs text-gray-400">Metadata:</span>
                            <pre className="text-xs mt-1 text-gray-300">
                              {JSON.stringify(event.data.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                    {event.type === 'response' && (
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-gray-400">Full Response:</span>
                          <pre className="text-xs mt-1 whitespace-pre-wrap bg-gray-900 p-2 rounded">
                            {event.data.response}
                          </pre>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Reasoning:</span>
                          <p className="text-xs mt-1">{event.data.reasoning}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>Input Tokens: {event.data.tokens.input}</div>
                          <div>Output Tokens: {event.data.tokens.output}</div>
                          <div>Temperature: {event.data.temperature}</div>
                        </div>
                      </div>
                    )}
                    {event.type === 'thinking' && (
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-gray-400">Reasoning:</span>
                          <p className="text-xs mt-1">{event.data.reasoning}</p>
                        </div>
                        {event.data.evidence.length > 0 && (
                          <div>
                            <span className="text-xs text-gray-400">Evidence:</span>
                            <ul className="text-xs mt-1 space-y-1">
                              {event.data.evidence.map((item, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="mr-1">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {event.data.nextActions.length > 0 && (
                          <div>
                            <span className="text-xs text-gray-400">Next Actions:</span>
                            <ul className="text-xs mt-1 space-y-1">
                              {event.data.nextActions.map((action, idx) => (
                                <li key={idx} className="flex items-start text-green-400">
                                  <span className="mr-1">→</span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    {event.type === 'decision' && (
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-gray-400">Reasoning:</span>
                          <p className="text-xs mt-1">{event.data.reasoning}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Alternatives Considered:</span>
                          <ul className="text-xs mt-1 space-y-1">
                            {event.data.alternatives.map((alt, idx) => (
                              <li key={idx} className="flex items-start text-yellow-400">
                                <span className="mr-1">•</span>
                                {alt}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Evidence:</span>
                          <ul className="text-xs mt-1 space-y-1">
                            {event.data.evidence.map((item, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-1">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {event.type === 'analysis' && (
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-gray-400">Input:</span>
                          <p className="text-xs mt-1 bg-gray-900 p-2 rounded">{event.data.input}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Output:</span>
                          <pre className="text-xs mt-1 bg-gray-900 p-2 rounded">
                            {JSON.stringify(event.data.output, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Insights:</span>
                          <ul className="text-xs mt-1 space-y-1">
                            {event.data.insights.map((insight, idx) => (
                              <li key={idx} className="flex items-start text-cyan-400">
                                <span className="mr-1">💡</span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}