'use client';

import { useState, useEffect } from 'react';
import {
  Send,
  Brain,
  Users,
  Sparkles,
  Activity,
  Target,
  Shield,
  TrendingUp,
  Zap,
  Eye,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  BarChart,
  Network,
  Cpu,
} from 'lucide-react';
import { RealAITransparency } from '@/components/demo/real-ai-transparency';

interface AgentActivity {
  id: string;
  timestamp: Date;
  agent: string;
  action: string;
  details: string;
  type: 'analysis' | 'collaboration' | 'insight' | 'solution' | 'proactive';
  confidence?: number;
  impact?: 'low' | 'medium' | 'high' | 'critical';
}

interface AgentCollaboration {
  from: string;
  to: string;
  message: string;
  type: 'query' | 'insight' | 'decision';
}

interface SystemInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'prediction' | 'opportunity';
  content: string;
  evidence: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  agent: string;
}

const AGENT_PROFILES = {
  Router: { name: 'Alex', role: 'Triage Specialist', avatar: '🎯', color: 'purple' },
  PatternAnalyst: {
    name: 'Marina',
    role: 'Pattern Recognition Expert',
    avatar: '📊',
    color: 'blue',
  },
  CustomerInsight: { name: 'Sophia', role: 'Customer Intelligence', avatar: '👤', color: 'green' },
  SolutionArchitect: { name: 'Marcus', role: 'Technical Architect', avatar: '🏗️', color: 'orange' },
  Proactive: { name: 'Aria', role: 'Proactive Support', avatar: '🚀', color: 'pink' },
  Technical: { name: 'Dr. Debug', role: 'Technical Expert', avatar: '🔧', color: 'indigo' },
  QA: { name: 'Quinn', role: 'Quality Assurance', avatar: '✅', color: 'teal' },
};

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

// Import AI transparency types
type AITransparencyEvent = any; // Will be properly typed from the component

export default function WowFactorDemoPage() {
  const [mounted, setMounted] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [collaborations, setCollaborations] = useState<AgentCollaboration[]>([]);
  const [insights, setInsights] = useState<SystemInsight[]>([]);
  const [finalResponse, setFinalResponse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ai_transparency' | 'activity' | 'collaboration' | 'insights'>('ai_transparency');
  
  // Real AI transparency state
  const [aiEvents, setAiEvents] = useState<AITransparencyEvent[]>([]);
  const [processingStats, setProcessingStats] = useState<{
    prompts: number;
    responses: number;
    thoughts: number;
    decisions: number;
    analyses: number;
  }>({ prompts: 0, responses: 0, thoughts: 0, decisions: 0, analyses: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const processWithEnhancedSystem = async () => {
    setIsProcessing(true);
    setActivities([]);
    setCollaborations([]);
    setInsights([]);
    setFinalResponse(null);
    setCurrentPhase(1);
    
    // Reset AI transparency data
    setAiEvents([]);
    setProcessingStats({ prompts: 0, responses: 0, thoughts: 0, decisions: 0, analyses: 0 });

    try {
      const response = await fetch('/api/demo/process-enhanced', {
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

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'start':
                  setCurrentPhase(1);
                  break;

                case 'ai_event':
                  // Handle real AI transparency events with proper structure
                  const aiEvent = {
                    ...data.event,
                    timestamp: new Date(data.timestamp || Date.now())
                  };
                  
                  // Add to events immediately so user sees progressive updates
                  setAiEvents(prev => [...prev, aiEvent]);
                  
                  // Update processing stats based on event type
                  const eventType = data.event.type || 'unknown';
                  setProcessingStats(prev => {
                    const key = eventType + 's';
                    return {
                      ...prev,
                      [key]: (prev[key as keyof typeof prev] || 0) + 1
                    };
                  });
                  
                  // If we're on the AI transparency tab, ensure it stays visible
                  if (activeTab === 'ai_transparency' && aiEvents.length === 0) {
                    setActiveTab('ai_transparency');
                  }
                  break;

                case 'ai_transparency_summary':
                  setProcessingStats(data.eventBreakdown);
                  break;

                case 'status':
                  // Handle status updates
                  console.log('Status:', data.message, data.phase);
                  break;

                case 'agent_activity':
                  await addActivity({
                    agent: data.agent,
                    action: data.contribution,
                    details: `Confidence: ${Math.round(data.confidence * 100)}%`,
                    type: 'analysis',
                    confidence: data.confidence,
                    impact: data.confidence > 0.8 ? 'high' : 'medium',
                  });

                  // Update phase based on agent
                  if (data.agent === 'Router' || data.agent === 'PatternAnalyst') {
                    setCurrentPhase(1);
                  } else if (data.agent === 'SolutionArchitect') {
                    setCurrentPhase(3);
                  } else if (data.agent === 'Proactive') {
                    setCurrentPhase(4);
                  } else if (data.agent === 'QA') {
                    setCurrentPhase(5);
                  }
                  break;

                case 'insight':
                  await addInsight({
                    type: data.insight.insightType as any,
                    content: data.insight.content,
                    evidence: data.insight.evidence,
                    impact: data.insight.impact,
                    agent: data.insight.agent,
                  });
                  setCurrentPhase(2);
                  break;

                case 'communication':
                  await addCollaboration({
                    from: data.communication.fromAgent,
                    to: data.communication.toAgent,
                    message: data.communication.content,
                    type: data.communication.messageType as any,
                  });
                  break;

                case 'complete':
                  setCurrentPhase(5);

                  // Use the actual AI response instead of hardcoded mock data
                  setFinalResponse({
                    rawResponse: data.response,
                    metrics: data.metrics || {},
                    aiTransparency: data.aiTransparency || {}
                  });

                  setCurrentPhase(0);
                  break;
              }
            } catch (err) {
              console.error('Error parsing SSE data:', err);
            }
          }
        }
      }
    } catch (error) {
      console.error('Processing error:', error);
      // Show error instead of falling back to mock data
      setFinalResponse({
        error: true,
        message: 'Failed to process with real AI. Please check the console for errors.'
      });
    } finally {
      setIsProcessing(false);
      setCurrentPhase(0);
    }
  };

  const simulatePhase1 = async () => {
    setCurrentPhase(1);

    // Router Agent
    await addActivity({
      agent: 'Router',
      action: 'Analyzing ticket urgency and impact',
      details: 'Detected VIP customer with critical business impact. 15 properties affected.',
      type: 'analysis',
      confidence: 0.92,
      impact: 'critical',
    });

    // Pattern Analyst
    await addActivity({
      agent: 'PatternAnalyst',
      action: 'Searching historical patterns',
      details:
        'Found 47 similar calendar sync issues in past 7 days. Spike detected after v2.1 release.',
      type: 'analysis',
      confidence: 0.88,
      impact: 'high',
    });

    // Customer Insight
    await addActivity({
      agent: 'CustomerInsight',
      action: 'Analyzing customer profile',
      details: 'VIP Host: $180k annual revenue, 15 properties, 4.8★ rating, 2-year customer',
      type: 'analysis',
      confidence: 0.95,
      impact: 'high',
    });

    // Add insight
    await addInsight({
      type: 'anomaly',
      content: 'Calendar sync failures spiked 400% after v2.1 deployment',
      evidence: [
        '47 similar tickets in 7 days',
        '92% correlation with update',
        'Affects multi-property hosts',
      ],
      impact: 'critical',
      agent: 'PatternAnalyst',
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  const simulatePhase2 = async () => {
    setCurrentPhase(2);

    // Collaboration
    await addCollaboration({
      from: 'PatternAnalyst',
      to: 'SolutionArchitect',
      message: 'Critical pattern detected: v2.1 API endpoint change breaking legacy iCal URLs',
      type: 'insight',
    });

    await addActivity({
      agent: 'SolutionArchitect',
      action: 'Designing multi-layered solution',
      details: 'Immediate fix: Legacy endpoint restoration. Long-term: Migration assistant.',
      type: 'solution',
      confidence: 0.91,
    });

    await addCollaboration({
      from: 'CustomerInsight',
      to: 'Proactive',
      message: 'High churn risk detected. Customer showing frustration signals.',
      type: 'query',
    });

    await new Promise((resolve) => setTimeout(resolve, 1200));
  };

  const simulatePhase3 = async () => {
    setCurrentPhase(3);

    // Technical specialist joins
    await addActivity({
      agent: 'Technical',
      action: 'Implementing immediate workaround',
      details: "Created backward-compatible endpoint wrapper. Testing with customer's account.",
      type: 'solution',
      confidence: 0.94,
    });

    // Collaborative decision
    await addCollaboration({
      from: 'SolutionArchitect',
      to: 'Technical',
      message: 'Proposing dual approach: Quick fix now + automated migration tool',
      type: 'decision',
    });

    await addInsight({
      type: 'opportunity',
      content: 'Proactive migration tool could prevent 500+ similar issues',
      evidence: [
        '15% of hosts use legacy URLs',
        'Automated migration feasible',
        '2-hour development time',
      ],
      impact: 'high',
      agent: 'SolutionArchitect',
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  const simulatePhase4 = async () => {
    setCurrentPhase(4);

    await addActivity({
      agent: 'Proactive',
      action: 'Creating comprehensive follow-up plan',
      details:
        'Scheduled: Immediate fix validation, 24hr check-in, migration assistance, compensation review',
      type: 'proactive',
      confidence: 0.89,
    });

    await addInsight({
      type: 'prediction',
      content: 'Without proactive intervention, 15% churn risk for affected VIP hosts',
      evidence: [
        'Historical churn patterns',
        'Customer sentiment analysis',
        'Business impact severity',
      ],
      impact: 'critical',
      agent: 'Proactive',
    });

    // QA Review
    await addActivity({
      agent: 'QA',
      action: 'Reviewing solution completeness',
      details: 'Solution approved. Added empathy elements and clearer timeline.',
      type: 'analysis',
      confidence: 0.96,
    });

    await new Promise((resolve) => setTimeout(resolve, 1200));
  };

  const simulatePhase5 = async () => {
    setCurrentPhase(5);

    const response = {
      immediate: {
        solution:
          "I've identified the issue affecting your calendar sync and I'm implementing an immediate fix.",
        actions: [
          'Restored legacy endpoint compatibility for your account',
          'Re-syncing all 15 properties now (ETA: 5 minutes)',
          'Setting up real-time monitoring for your calendars',
        ],
        timeframe: '5-10 minutes',
      },
      comprehensive: {
        rootCause: 'Our v2.1 update changed API endpoints, affecting legacy iCal integrations',
        impact: '47 hosts affected, primarily those with 10+ properties',
        prevention: 'Building automated migration tool (release: 48 hours)',
      },
      proactive: {
        followUp: [
          'Validation call in 2 hours',
          '24-hour stability check',
          'Personal migration assistance when tool is ready',
          'Considering service credit for inconvenience',
        ],
        longTerm: [
          'Priority beta access to new features',
          'Dedicated technical account manager',
          'Quarterly business reviews',
        ],
      },
      metrics: {
        agentsInvolved: 7,
        insightsGenerated: 12,
        confidenceScore: 94,
        estimatedRevenueSaved: '$8,500',
      },
    };

    setFinalResponse(response);

    await addInsight({
      type: 'pattern',
      content: 'Solution implemented successfully. Creating playbook for future incidents.',
      evidence: ['Fix validated', 'Customer satisfied', 'Prevention plan active'],
      impact: 'high',
      agent: 'QA',
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const addActivity = async (activity: Omit<AgentActivity, 'id' | 'timestamp'>) => {
    const newActivity: AgentActivity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };
    setActivities((prev) => [...prev, newActivity]);
    await new Promise((resolve) => setTimeout(resolve, 300));
  };

  const addCollaboration = async (collab: AgentCollaboration) => {
    setCollaborations((prev) => [...prev, collab]);
    await new Promise((resolve) => setTimeout(resolve, 200));
  };

  const addInsight = async (insight: Omit<SystemInsight, 'id'>) => {
    const newInsight: SystemInsight = {
      ...insight,
      id: `insight-${Date.now()}`,
    };
    setInsights((prev) => [...prev, newInsight]);
    await new Promise((resolve) => setTimeout(resolve, 200));
  };

  const getPhaseStatus = (phase: number) => {
    if (currentPhase > phase) return 'completed';
    if (currentPhase === phase) return 'active';
    return 'pending';
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧠 AI Agent Glass Car View
          </h1>
          <p className="text-gray-600">
            Watch real AI agents think, collaborate, and solve problems in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Ticket Submission */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-purple-600" />
                Submit Support Ticket
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  processWithEnhancedSystem();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Title
                  </label>
                  <input
                    type="text"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    placeholder="Brief description of your issue"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                  <textarea
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    placeholder="Provide more details about your issue..."
                    disabled={isProcessing}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !ticketTitle || !ticketDescription}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <Activity className="animate-spin h-5 w-5 mr-2" />
                      AI Agents Collaborating...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Submit to AI System
                    </>
                  )}
                </button>
              </form>

              {/* Sample Scenarios */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Try These Scenarios:</h3>
                <div className="space-y-2">
                  {SAMPLE_SCENARIOS.map((scenario, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTicketTitle(scenario.title);
                        setTicketDescription(scenario.description);
                      }}
                      disabled={isProcessing}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{scenario.title}</p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {scenario.description}
                          </p>
                        </div>
                        <span
                          className={`ml-2 text-xs px-2 py-1 rounded-full ${
                            scenario.customerType === 'vip'
                              ? 'bg-purple-100 text-purple-700'
                              : scenario.customerType === 'new'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {scenario.customerType}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: AI Thinking Display */}
          <div className="lg:col-span-3">
            {/* Real-time AI Thinking Display */}

            {/* Activity Tabs - Show immediately when processing starts */}
            {(isProcessing || activities.length > 0 || aiEvents.length > 0) && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="border-b border-gray-200">
                  <div className="flex">
                    {[
                      { id: 'ai_transparency', label: '🧠 AI Thinking', count: aiEvents.length, icon: Cpu },
                      { id: 'activity', label: 'Agent Activity', count: activities.length },
                      { id: 'collaboration', label: 'Collaboration', count: collaborations.length },
                      { id: 'insights', label: 'Insights', count: insights.length },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center ${
                          activeTab === tab.id
                            ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {tab.icon && <tab.icon className="h-4 w-4 mr-1" />}
                        {tab.label}
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            activeTab === tab.id
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={activeTab === 'ai_transparency' ? 'p-0' : 'p-6 max-h-96 overflow-y-auto'}>
                  {activeTab === 'ai_transparency' && (
                    <div className="p-6">
                      <RealAITransparency 
                        events={aiEvents}
                        isProcessing={isProcessing}
                        processingStats={processingStats}
                      />
                    </div>
                  )}
                  
                  {activeTab === 'activity' && (
                    <div className="space-y-3">
                      {activities.map((activity) => {
                        const agent = AGENT_PROFILES[activity.agent as keyof typeof AGENT_PROFILES];
                        return (
                          <div
                            key={activity.id}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-shrink-0 text-2xl">{agent?.avatar || '🤖'}</div>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900">
                                  {agent?.name || activity.agent}
                                </span>
                                <span className="ml-2 text-xs text-gray-500">{agent?.role}</span>
                                {activity.confidence && (
                                  <span className="ml-auto text-xs text-gray-600">
                                    {Math.round(activity.confidence * 100)}% confidence
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-800 mt-1">{activity.action}</p>
                              {activity.details && (
                                <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                              )}
                              {activity.impact && (
                                <span
                                  className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${getImpactColor(activity.impact)}`}
                                >
                                  {activity.impact} impact
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === 'collaboration' && (
                    <div className="space-y-3">
                      {collaborations.map((collab, idx) => {
                        const fromAgent =
                          AGENT_PROFILES[collab.from as keyof typeof AGENT_PROFILES];
                        const toAgent = AGENT_PROFILES[collab.to as keyof typeof AGENT_PROFILES];
                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-blue-50 border border-blue-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{fromAgent?.avatar}</span>
                                <ChevronRight className="h-4 w-4 text-blue-600" />
                                <span className="text-lg">{toAgent?.avatar}</span>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  collab.type === 'insight'
                                    ? 'bg-purple-100 text-purple-700'
                                    : collab.type === 'decision'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {collab.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800">{collab.message}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === 'insights' && (
                    <div className="space-y-3">
                      {insights.map((insight) => {
                        const agent = AGENT_PROFILES[insight.agent as keyof typeof AGENT_PROFILES];
                        return (
                          <div
                            key={insight.id}
                            className={`p-4 rounded-lg border ${
                              insight.impact === 'critical'
                                ? 'border-red-300 bg-red-50'
                                : insight.impact === 'high'
                                  ? 'border-orange-300 bg-orange-50'
                                  : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center">
                                <Sparkles
                                  className={`h-5 w-5 mr-2 ${
                                    insight.type === 'anomaly'
                                      ? 'text-red-600'
                                      : insight.type === 'opportunity'
                                        ? 'text-green-600'
                                        : insight.type === 'prediction'
                                          ? 'text-blue-600'
                                          : 'text-purple-600'
                                  }`}
                                />
                                <span className="font-medium text-gray-900">
                                  {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}{' '}
                                  Detected
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">by {agent?.name}</span>
                            </div>
                            <p className="text-sm text-gray-800 mb-2">{insight.content}</p>
                            <div className="space-y-1">
                              {insight.evidence.map((evidence, idx) => (
                                <p key={idx} className="text-xs text-gray-600 flex items-center">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                                  {evidence}
                                </p>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Final Response */}
            {finalResponse && (
              <div className={`mt-6 rounded-xl shadow-lg p-6 border ${
                finalResponse.error 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
              }`}>
                <div className="flex items-center mb-4">
                  {finalResponse.error ? (
                    <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  )}
                  <h2 className="text-xl font-semibold text-gray-900">
                    {finalResponse.error ? 'Processing Error' : 'Comprehensive Solution Delivered'}
                  </h2>
                </div>
                
                {finalResponse.error ? (
                  <p className="text-red-700">{finalResponse.message}</p>
                ) : finalResponse.rawResponse ? (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">AI Response:</h3>
                      <div className="whitespace-pre-wrap text-gray-700">
                        {finalResponse.rawResponse}
                      </div>
                    </div>
                    {finalResponse.metrics && (
                      <div className="text-sm text-gray-600">
                        <p>✓ Processing time: {finalResponse.metrics.totalProcessingTime}ms</p>
                        <p>✓ Confidence score: {Math.round(finalResponse.metrics.confidenceScore * 100)}%</p>
                      </div>
                    )}
                  </div>
                ) : (
                <div className="space-y-6">
                  {/* Immediate Solution */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-orange-600" />
                      Immediate Actions
                    </h3>
                    <p className="text-gray-800 mb-2">{finalResponse.immediate.solution}</p>
                    <ul className="space-y-1">
                      {finalResponse.immediate.actions.map((action: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-600 mt-2">
                      ⏱ {finalResponse.immediate.timeframe}
                    </p>
                  </div>

                  {/* Root Cause */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Target className="h-4 w-4 mr-2 text-blue-600" />
                      Root Cause Analysis
                    </h3>
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">Cause:</span>{' '}
                      {finalResponse.comprehensive.rootCause}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">Impact:</span>{' '}
                      {finalResponse.comprehensive.impact}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Prevention:</span>{' '}
                      {finalResponse.comprehensive.prevention}
                    </p>
                  </div>

                  {/* Proactive Follow-up */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-purple-600" />
                      Proactive Support Plan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Immediate Follow-up:
                        </p>
                        <ul className="space-y-1">
                          {finalResponse.proactive.followUp.map((item: string, idx: number) => (
                            <li key={idx} className="text-xs text-gray-600">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Long-term Benefits:
                        </p>
                        <ul className="space-y-1">
                          {finalResponse.proactive.longTerm.map((item: string, idx: number) => (
                            <li key={idx} className="text-xs text-gray-600">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
