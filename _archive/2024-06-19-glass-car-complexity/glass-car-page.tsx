'use client';

import { useState, useEffect } from 'react';
import {
  Send,
  Brain,
  Users,
  Sparkles,
  Activity,
  Eye,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { ThoughtBubble, ThoughtProcess, Evidence, Hypothesis } from '@/components/ai/thought-bubble';
import { DecisionTree } from '@/components/ai/decision-tree';
import { AgentConversation } from '@/components/ai/agent-conversation';
import { ThinkingTimeline } from '@/components/ai/thinking-timeline';
import { RealAITransparency } from '@/components/demo/real-ai-transparency';

interface DemoEvent {
  id: string;
  timestamp: Date;
  type: 'thinking' | 'decision' | 'collaboration' | 'insight' | 'debate';
  agent: string;
  data: any;
}

interface ConversationMessage {
  id: string;
  from: string;
  to: string | 'broadcast';
  type: 'question' | 'insight' | 'hypothesis' | 'challenge' | 'agreement';
  content: string;
  timestamp: Date;
  thinking?: string;
  confidence?: number;
}

const SAMPLE_SCENARIOS = [
  {
    title: 'Calendar sync completely broken after update',
    description:
      "My calendar sync with Airbnb and VRBO stopped working after your latest update. I have 15 properties and I'm getting double bookings! This is costing me thousands. I need this fixed NOW!",
    category: 'critical',
    customerType: 'vip',
  },
  {
    title: 'Guest demanding refund after stay',
    description:
      "A guest who stayed for 2 weeks is now demanding a full refund claiming the AC didn't work properly. They never mentioned this during their stay and left a 5-star review! My cancellation policy is strict. What are my options?",
    category: 'billing',
    customerType: 'regular',
  },
  {
    title: 'How to optimize for summer season?',
    description:
      "I'm new to vacation rentals and summer is approaching. How should I adjust my pricing? Should I change minimum stays? Any tips for maximizing bookings while maintaining quality guests?",
    category: 'strategy',
    customerType: 'new',
  },
];

export default function GlassCarDemoPage() {
  const [mounted, setMounted] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [demoEvents, setDemoEvents] = useState<DemoEvent[]>([]);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [showClassicView, setShowClassicView] = useState(false);
  const [activeTab, setActiveTab] = useState<'bubbles' | 'decisions' | 'conversation' | 'timeline'>('bubbles');

  useEffect(() => {
    setMounted(true);
  }, []);

  const simulateAIProcessing = () => {
    // Phase 1: Initial thinking
    setTimeout(() => {
      setCurrentPhase(1);
      addThinkingEvent('router', 'Analyzing ticket severity and routing requirements...');
      
      // Add conversation
      addConversationMessage({
        from: 'router',
        to: 'broadcast',
        type: 'question',
        content: 'Team, we have a critical calendar sync issue affecting a VIP customer with 15 properties.',
        confidence: 0.95,
        thinking: 'This requires immediate attention from multiple specialists.'
      });
    }, 500);

    // Phase 2: Pattern analysis
    setTimeout(() => {
      setCurrentPhase(2);
      addThinkingEvent('pattern_analyst', 'Searching for similar issues in recent tickets...');
      
      addConversationMessage({
        from: 'pattern_analyst',
        to: 'router',
        type: 'insight',
        content: 'I found 47 similar calendar sync issues in the past week, all after the v2.1 update.',
        confidence: 0.88,
        thinking: 'This is definitely a pattern related to our recent deployment.'
      });
    }, 2000);

    // Phase 3: Customer insights
    setTimeout(() => {
      setCurrentPhase(3);
      addThinkingEvent('customer_insight', 'Analyzing customer impact and sentiment...');
      
      addConversationMessage({
        from: 'customer_insight',
        to: 'broadcast',
        type: 'insight',
        content: 'This customer generates $125K annual revenue. They\'ve been with us for 3 years with a 98% satisfaction rate.',
        confidence: 0.92,
        thinking: 'We need to prioritize this immediately to prevent churn.'
      });
    }, 3500);

    // Phase 4: Solution debate
    setTimeout(() => {
      setCurrentPhase(4);
      
      addConversationMessage({
        from: 'solution_architect',
        to: 'broadcast',
        type: 'hypothesis',
        content: 'I see two options: 1) Quick rollback to previous version, or 2) Deploy hotfix targeting the sync module.',
        confidence: 0.78,
        thinking: 'Weighing immediate relief vs. long-term stability...'
      });

      addConversationMessage({
        from: 'proactive_specialist',
        to: 'solution_architect',
        type: 'challenge',
        content: 'Rolling back would affect 3,000 users who rely on new features. Can we isolate the fix?',
        confidence: 0.85,
        thinking: 'We need to consider the broader impact.'
      });
    }, 5000);

    // Phase 5: Decision
    setTimeout(() => {
      setCurrentPhase(5);
      addDecisionEvent();
      
      addConversationMessage({
        from: 'solution_architect',
        to: 'broadcast',
        type: 'agreement',
        content: 'Consensus reached: Deploy targeted hotfix for calendar sync while maintaining new features.',
        confidence: 0.91,
        thinking: 'This balances immediate needs with system stability.'
      });
    }, 7000);

    // Phase 6: Complete
    setTimeout(() => {
      setCurrentPhase(6);
      setIsProcessing(false);
      
      // Set mock response
      setAiResponse({
        solution: 'Immediate hotfix deployment for calendar sync issue',
        steps: [
          'Deploy calendar sync patch (ETA: 30 minutes)',
          'Manually sync affected properties',
          'Provide compensation for any losses',
          'Set up monitoring for similar issues'
        ],
        confidence: 0.91
      });
    }, 9000);
  };

  const addThinkingEvent = (agent: string, thought: string) => {
    const event: DemoEvent = {
      id: `event_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      type: 'thinking',
      agent,
      data: { thought, confidence: 0.75 + Math.random() * 0.2 }
    };
    setDemoEvents(prev => [...prev, event]);
  };

  const addDecisionEvent = () => {
    const event: DemoEvent = {
      id: `event_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      type: 'decision',
      agent: 'solution_architect',
      data: {
        decision: 'Deploy targeted hotfix',
        options: [
          {
            id: '1',
            title: 'Targeted Hotfix',
            description: 'Fix only calendar sync module',
            pros: ['Minimal risk', 'Quick deployment', 'Preserves new features'],
            cons: ['Doesn\'t address root cause', 'May need follow-up'],
            confidence: 0.91,
            selected: true
          },
          {
            id: '2',
            title: 'Full Rollback',
            description: 'Revert to previous version',
            pros: ['Guaranteed to work', 'Immediate relief'],
            cons: ['Loses new features', 'Affects 3000 users', 'Technical debt'],
            confidence: 0.65,
            selected: false,
            rejectionReason: 'Too disruptive for other users'
          },
          {
            id: '3',
            title: 'Wait for Full Fix',
            description: 'Develop comprehensive solution',
            pros: ['Addresses root cause', 'Most stable'],
            cons: ['Too slow', 'Customer can\'t wait', 'Revenue impact'],
            confidence: 0.43,
            selected: false,
            rejectionReason: 'Timeline unacceptable for VIP customer'
          }
        ]
      }
    };
    setDemoEvents(prev => [...prev, event]);
  };

  const addConversationMessage = (message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    const newMessage: ConversationMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random()}`,
      timestamp: new Date()
    };
    setConversationMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim() || !ticketDescription.trim()) return;

    setIsProcessing(true);
    setCurrentPhase(0);
    setDemoEvents([]);
    setConversationMessages([]);
    setAiResponse(null);

    try {
      const response = await fetch('/api/demo/process-glass-car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: ticketTitle,
          description: ticketDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process ticket');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                handleStreamEvent(data);
              } catch (err) {
                console.error('Error parsing event:', err);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setIsProcessing(false);
    }
  };

  const handleStreamEvent = (event: any) => {
    switch (event.phase) {
      case 'router_analysis':
        setCurrentPhase(1);
        break;
      case 'pattern_analysis':
        setCurrentPhase(2);
        break;
      case 'customer_analysis':
        setCurrentPhase(3);
        break;
      case 'solution_debate':
        setCurrentPhase(4);
        break;
      case 'debate_complete':
        setCurrentPhase(5);
        break;
      case 'complete':
        setCurrentPhase(6);
        setIsProcessing(false);
        setAiResponse(event.solution);
        break;
    }

    // Add events for timeline
    if (event.type) {
      addTimelineEvent(event);
    }
  };

  const addTimelineEvent = (event: any) => {
    const demoEvent: DemoEvent = {
      id: `event_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      type: event.type as any,
      agent: event.agent || 'orchestrator',
      data: event
    };
    setDemoEvents(prev => [...prev, demoEvent]);
  };

  const selectScenario = (scenario: typeof SAMPLE_SCENARIOS[0]) => {
    setTicketTitle(scenario.title);
    setTicketDescription(scenario.description);
  };

  if (!mounted) {
    // Return a loading state to prevent hydration mismatch
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ backgroundColor: '#f9fafb', color: '#111827' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Glass Car AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb', color: '#111827' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🚗 AI Agent Glass Car View
          </h1>
          <p className="text-gray-600 text-lg">
            Watch real AI agents think, collaborate, and solve problems in real-time
          </p>
        </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Issue Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Issue Title
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                disabled={isProcessing}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Details
                </label>
                <textarea
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Provide more details about what you're experiencing..."
                  rows={5}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  disabled={isProcessing}
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing || !ticketTitle.trim() || !ticketDescription.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit to AI System
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sample Scenarios */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-3 text-gray-800">Try These Scenarios:</h3>
            <div className="space-y-3">
              {SAMPLE_SCENARIOS.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => selectScenario(scenario)}
                  disabled={isProcessing}
                  className="w-full text-left p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">
                      {scenario.category === 'critical' ? '🚨' : scenario.category === 'billing' ? '💰' : '📈'}
                    </span>
                    <div>
                      <div className="font-medium text-sm text-gray-800">{scenario.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {scenario.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Transparency Section */}
        <div className="lg:col-span-2">
          {/* View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('bubbles')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'bubbles' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                💭 AI Thinking
              </button>
              <button
                onClick={() => setActiveTab('conversation')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'conversation' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                💬 Collaboration
              </button>
              <button
                onClick={() => setActiveTab('decisions')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'decisions' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🎯 Decisions
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'timeline' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📊 Timeline
              </button>
            </div>
            <button
              onClick={() => setShowClassicView(!showClassicView)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showClassicView ? 'Hide' : 'Show'} Classic View
            </button>
          </div>

          {/* Glass Car View */}
          {!showClassicView && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 min-h-[500px]">
              {activeTab === 'bubbles' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Real-time AI Thinking
                  </h3>
                  
                  {/* Dynamic thought bubbles based on events */}
                  {demoEvents
                    .filter(event => event.type === 'thinking' && activeTab === 'bubbles')
                    .slice(-3) // Show last 3 thoughts
                    .map((event, index) => (
                      <ThoughtBubble 
                        key={event.id}
                        agent={event.agent} 
                        type="thinking" 
                        confidence={event.data.confidence || 0.85} 
                        isActive={index === demoEvents.filter(e => e.type === 'thinking').length - 1}
                      >
                        <ThoughtProcess>
                          {event.data.content || event.data.thought}
                        </ThoughtProcess>
                      </ThoughtBubble>
                    ))}

                  {!isProcessing && demoEvents.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                      <Brain className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p>Submit a ticket to see AI agents thinking in real-time</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'conversation' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Agent Collaboration
                  </h3>
                  <AgentConversation
                    messages={conversationMessages}
                    activeAgents={isProcessing ? ['router', 'pattern_analyst', 'customer_insight', 'solution_architect', 'proactive_specialist'] : []}
                    showThinking={true}
                    autoScroll={true}
                  />
                </div>
              )}

              {activeTab === 'decisions' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Decision Analysis
                  </h3>
                  
                  {currentPhase >= 5 && demoEvents.find(e => e.type === 'decision') && (
                    <DecisionTree
                      agent="solution_architect"
                      decision="How to fix calendar sync issue"
                      options={demoEvents.find(e => e.type === 'decision')?.data.options || []}
                      reasoning="Balancing immediate customer needs with system stability"
                    />
                  )}

                  {currentPhase < 5 && (
                    <div className="text-center py-16 text-gray-500">
                      <Activity className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p>Decision analysis will appear here</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'timeline' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Thinking Timeline
                  </h3>
                  <ThinkingTimeline
                    events={demoEvents.map(e => ({
                      id: e.id,
                      timestamp: e.timestamp,
                      agent: e.agent,
                      type: e.type,
                      title: e.type === 'thinking' ? 'Analyzing' : e.type === 'decision' ? 'Deciding' : 'Processing',
                      description: e.data.thought || e.data.decision || 'Processing information',
                      confidence: e.data.confidence,
                      metadata: e.data
                    }))}
                    showConnections={true}
                  />
                </div>
              )}
            </div>
          )}

          {/* Classic View */}
          {showClassicView && (
            <div className="mb-6">
              <RealAITransparency />
            </div>
          )}

          {/* Results */}
          {aiResponse && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold">Comprehensive Solution Delivered</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Solution:</h4>
                  <p className="text-gray-600">{aiResponse.solution}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Action Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {aiResponse.steps.map((step: string, index: number) => (
                      <li key={index} className="text-gray-600">{step}</li>
                    ))}
                  </ol>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Solution Confidence:</span>
                    <span className="font-medium text-green-600">
                      {(aiResponse.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Phases */}
      {isProcessing && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-6 py-3">
          <div className="flex items-center gap-4">
            {[
              'Analyzing',
              'Pattern Recognition', 
              'Customer Impact',
              'Solution Design',
              'Decision Making',
              'Finalizing'
            ].map((phase, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 ${
                  currentPhase > index
                    ? 'text-green-600'
                    : currentPhase === index
                    ? 'text-blue-600'
                    : 'text-gray-400'
                }`}
              >
                {currentPhase > index ? (
                  <CheckCircle className="w-5 h-5" />
                ) : currentPhase === index ? (
                  <div className="animate-pulse">
                    <Clock className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-current" />
                )}
                <span className="text-sm font-medium hidden md:inline">{phase}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}