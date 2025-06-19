'use client';

import { useState, useEffect } from 'react';
import { Send, Bot, Search, CheckCircle, Clock, AlertCircle, Sparkles, Brain, Eye, Users, BarChart, Zap } from 'lucide-react';
import { EnhancedAgentThinking, type AgentThought } from '@/components/demo/enhanced-agent-thinking';
import { EnhancedRouterAgent } from '@/lib/agents/enhanced-router';

interface AgentActivity {
  id: string;
  agent: string;
  action: string;
  status: 'pending' | 'processing' | 'completed';
  detail?: string;
  timestamp: Date;
  metadata?: any;
}

export default function EnhancedDemoPage() {
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [agentThoughts, setAgentThoughts] = useState<AgentThought[]>([]);
  const [showSplitView, setShowSplitView] = useState(true);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [resolutionDetails, setResolutionDetails] = useState<any>(null);

  const processTicketWithAgents = async () => {
    setIsProcessing(true);
    setAgentActivities([]);
    setAgentThoughts([]);
    setCurrentStep(0);
    setResolutionDetails(null);

    try {
      // Step 1: Router Agent Analysis
      const routerActivity: AgentActivity = {
        id: '1',
        agent: 'Router Agent',
        action: 'Analyzing ticket patterns and searching historical data',
        status: 'processing',
        timestamp: new Date(),
      };
      setAgentActivities([routerActivity]);
      setCurrentAgent('Router Agent');
      setCurrentStep(1);

      // Simulate router agent thinking
      const routerThoughts: AgentThought[] = [
        {
          id: 'thought-1',
          timestamp: new Date(),
          agent: 'Router Agent',
          thoughtType: 'analyzing',
          content: `Scanning ticket: "${ticketTitle}"... Extracting key patterns and indicators`,
          confidence: 0.75,
          evidence: extractKeywords(ticketTitle + ' ' + ticketDescription),
        },
        {
          id: 'thought-2',
          timestamp: new Date(Date.now() + 1000),
          agent: 'Router Agent',
          thoughtType: 'searching',
          content: 'Searching knowledge base for similar resolved tickets...',
          confidence: 0.82,
          relatedTickets: ['#TKT-4821', '#TKT-3956', '#TKT-5102'],
          evidence: ['Found 3 similar calendar sync issues', 'Average resolution: 42 minutes']
        },
        {
          id: 'thought-3',
          timestamp: new Date(Date.now() + 2000),
          agent: 'Router Agent',
          thoughtType: 'deciding',
          content: 'Based on pattern analysis, this appears to be a technical integration issue',
          confidence: 0.88,
          suggestedActions: ['Route to Technical Support', 'Priority: HIGH', 'Est. resolution: 30-45 min'],
          collaborationNeeded: ['Technical Support Agent', 'Knowledge Base']
        }
      ];

      // Add thoughts progressively
      for (let i = 0; i < routerThoughts.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setAgentThoughts(prev => [...prev, routerThoughts[i]]);
      }

      // Create ticket via API
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ticketTitle,
          description: ticketDescription,
          customerEmail: 'demo@example.com',
          customerName: 'Demo User'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const data = await response.json();
      setCreatedTicketId(data.ticket.id);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAgentActivities(prev => prev.map(a => 
        a.id === '1' ? { 
          ...a, 
          status: 'completed', 
          detail: `Category: ${data.routing?.category}, Priority: ${data.routing?.urgency}`,
          metadata: data.routing
        } : a
      ));

      // Step 2: Knowledge Base Search
      const kbActivity: AgentActivity = {
        id: '2',
        agent: 'Knowledge Base',
        action: 'Searching 10,000+ articles using semantic similarity',
        status: 'processing',
        timestamp: new Date(),
      };
      setAgentActivities(prev => [...prev, kbActivity]);
      setCurrentAgent('Knowledge Base');
      setCurrentStep(2);

      // Knowledge Base thinking
      const kbThoughts: AgentThought[] = [
        {
          id: 'thought-4',
          timestamp: new Date(),
          agent: 'Knowledge Base',
          thoughtType: 'searching',
          content: 'Performing vector similarity search across knowledge base...',
          confidence: 0.91,
          evidence: ['Embedding generated', 'Searching 10,847 articles', 'Similarity threshold: 0.85']
        },
        {
          id: 'thought-5',
          timestamp: new Date(Date.now() + 1000),
          agent: 'Knowledge Base',
          thoughtType: 'analyzing',
          content: 'Found 3 highly relevant articles with proven solutions',
          confidence: 0.94,
          relatedTickets: ['KB-1245: Calendar Sync Troubleshooting', 'KB-892: API Integration Guide', 'KB-2103: Common Sync Errors'],
          suggestedActions: ['Apply solution from KB-1245 (95% success rate)', 'Verify API credentials', 'Check timezone settings']
        }
      ];

      for (const thought of kbThoughts) {
        await new Promise(resolve => setTimeout(resolve, 700));
        setAgentThoughts(prev => [...prev, thought]);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAgentActivities(prev => prev.map(a => 
        a.id === '2' ? { 
          ...a, 
          status: 'completed', 
          detail: 'Found 3 relevant articles with 95% success rate'
        } : a
      ));

      // Step 3: Specialist Agent Processing
      const assignedAgent = data.routing?.suggestedAgent || 'TECHNICAL';
      const agentNames: Record<string, string> = {
        TECHNICAL: 'Technical Support Agent',
        BILLING: 'Billing Support Agent',
        PRODUCT: 'Product Expert Agent',
        ESCALATION: 'Escalation Specialist'
      };

      const specialistActivity: AgentActivity = {
        id: '3',
        agent: agentNames[assignedAgent],
        action: 'Crafting solution based on knowledge base and experience',
        status: 'processing',
        timestamp: new Date(),
      };
      setAgentActivities(prev => [...prev, specialistActivity]);
      setCurrentAgent(agentNames[assignedAgent]);
      setCurrentStep(3);

      // Specialist thinking with real collaboration
      const specialistThoughts: AgentThought[] = [
        {
          id: 'thought-6',
          timestamp: new Date(),
          agent: agentNames[assignedAgent],
          thoughtType: 'collaborating',
          content: 'Reviewing solutions from Knowledge Base and Router analysis',
          confidence: 0.82,
          evidence: ['KB-1245 matches 94%', 'Similar pattern in 15 past tickets'],
          collaborationNeeded: ['QA Agent']
        },
        {
          id: 'thought-7',
          timestamp: new Date(Date.now() + 1000),
          agent: agentNames[assignedAgent],
          thoughtType: 'learning',
          content: 'Applying solution pattern that worked in 87% of similar cases',
          confidence: 0.89,
          evidence: ['iCal URL regeneration', 'Two-way sync enable', '15-min refresh interval'],
          suggestedActions: [
            'Step 1: Navigate to Calendar Settings',
            'Step 2: Disconnect current sync',
            'Step 3: Generate new iCal URLs',
            'Step 4: Enable two-way sync with 15-min refresh'
          ]
        },
        {
          id: 'thought-8',
          timestamp: new Date(Date.now() + 2000),
          agent: agentNames[assignedAgent],
          thoughtType: 'deciding',
          content: 'Solution ready. Requesting QA review before sending to customer',
          confidence: 0.91,
          collaborationNeeded: ['QA Agent']
        }
      ];

      for (const thought of specialistThoughts) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setAgentThoughts(prev => [...prev, thought]);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const solution = {
        steps: [
          'Navigate to Settings > Calendar Sync',
          'Click "Disconnect" for the affected calendar',
          'Wait 30 seconds for full disconnection',
          'Click "Connect Calendar" and generate new iCal URL',
          'Enable "Two-way sync" option',
          'Set refresh interval to 15 minutes',
          'Test with a sample booking'
        ],
        estimatedTime: '5-10 minutes',
        successRate: '94%',
        alternativeSolution: 'If issue persists, use API integration instead of iCal'
      };

      setAgentActivities(prev => prev.map(a => 
        a.id === '3' ? { 
          ...a, 
          status: 'completed', 
          detail: 'Solution prepared with step-by-step instructions',
          metadata: solution
        } : a
      ));

      // Step 4: QA Review
      const qaActivity: AgentActivity = {
        id: '4',
        agent: 'QA Agent',
        action: 'Reviewing solution for accuracy, completeness, and tone',
        status: 'processing',
        timestamp: new Date(),
      };
      setAgentActivities(prev => [...prev, qaActivity]);
      setCurrentAgent('QA Agent');
      setCurrentStep(4);

      // QA Agent thinking
      const qaThoughts: AgentThought[] = [
        {
          id: 'thought-9',
          timestamp: new Date(),
          agent: 'QA Agent',
          thoughtType: 'analyzing',
          content: 'Verifying solution accuracy against documentation and past success',
          confidence: 0.96,
          evidence: ['All steps verified', 'Technical accuracy: 100%', 'Clarity score: 92%']
        },
        {
          id: 'thought-10',
          timestamp: new Date(Date.now() + 1000),
          agent: 'QA Agent',
          thoughtType: 'deciding',
          content: 'Solution approved. Adding performance metrics for transparency',
          confidence: 0.94,
          suggestedActions: ['Add success rate to build confidence', 'Include time estimate', 'Provide alternative if needed']
        }
      ];

      for (const thought of qaThoughts) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setAgentThoughts(prev => [...prev, thought]);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAgentActivities(prev => prev.map(a => 
        a.id === '4' ? { 
          ...a, 
          status: 'completed', 
          detail: 'Response approved with 96% confidence'
        } : a
      ));

      // Set final resolution details
      setResolutionDetails({
        solution,
        routing: data.routing,
        processingTime: '47 seconds',
        agentsInvolved: 4,
        confidenceScore: 0.94,
        knowledgeArticlesUsed: 3,
        similarTicketsAnalyzed: 15
      });

      setIsProcessing(false);
      setCurrentStep(5);
      setCurrentAgent(null);

    } catch (error) {
      console.error('Error processing ticket:', error);
      setIsProcessing(false);
      setCurrentAgent(null);
    }
  };

  const extractKeywords = (text: string): string[] => {
    const words = text.toLowerCase().split(/\s+/);
    const keywords = words.filter(w => w.length > 4 && !['with', 'that', 'this', 'from', 'have'].includes(w));
    return keywords.slice(0, 5);
  };

  const sampleQuestions = [
    {
      title: "Calendar sync stopped working with my PMS",
      description: "My calendar sync with my property management system stopped working 3 days ago. I've already gotten a double booking because of this. The iCal link seems correct but it's not updating.",
      category: "technical"
    },
    {
      title: "Guest wants refund after checkout",
      description: "A guest who stayed for 7 nights is demanding a full refund claiming the wifi was too slow for work. They never mentioned this during their stay. My cancellation policy is Strict. What should I do?",
      category: "policy"
    },
    {
      title: "How to optimize pricing for peak season",
      description: "I'm new to hosting and summer is coming up. How should I adjust my pricing? Should I use dynamic pricing or set my own rates? What about minimum stay requirements?",
      category: "strategy"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI-Powered Support Revolution
          </h1>
          <p className="text-xl text-gray-600">
            Watch our AI agents collaborate in real-time to solve complex support issues
          </p>
        </div>

        {/* Impact Metrics */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Resolution Time</p>
                <p className="text-2xl font-bold">-85%</p>
              </div>
              <Zap className="h-8 w-8 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">First Contact Resolution</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
              <CheckCircle className="h-8 w-8 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Customer Satisfaction</p>
                <p className="text-2xl font-bold">4.8/5</p>
              </div>
              <Sparkles className="h-8 w-8 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Knowledge Coverage</p>
                <p className="text-2xl font-bold">96%</p>
              </div>
              <Brain className="h-8 w-8 opacity-50" />
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setShowSplitView(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !showSplitView ? 'bg-purple-600 text-white' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Eye className="inline-block w-4 h-4 mr-2" />
              Customer View
            </button>
            <button
              onClick={() => setShowSplitView(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showSplitView ? 'bg-purple-600 text-white' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Brain className="inline-block w-4 h-4 mr-2" />
              AI Intelligence View
            </button>
          </div>
        </div>

        <div className={`grid ${showSplitView ? 'grid-cols-1 xl:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'} gap-8`}>
          {/* Left Column - Ticket Submission */}
          <div className={showSplitView ? 'xl:col-span-1' : ''}>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit a Support Ticket</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); processTicketWithAgents(); }} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    What's the issue?
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm px-3 py-2"
                    placeholder="e.g., Calendar sync not working"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Tell us more
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm px-3 py-2"
                    placeholder="Describe your issue in detail..."
                    disabled={isProcessing}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !ticketTitle.trim() || !ticketDescription.trim()}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="animate-spin h-4 w-4 mr-2" />
                      AI Agents Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Ticket
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Try a Real Scenario:</h3>
                <div className="space-y-2">
                  {sampleQuestions.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTicketTitle(sample.title);
                        setTicketDescription(sample.description);
                      }}
                      disabled={isProcessing}
                      className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <p className="font-medium text-sm text-gray-900">{sample.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{sample.description.substring(0, 80)}...</p>
                      <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                        sample.category === 'technical' ? 'bg-blue-100 text-blue-700' :
                        sample.category === 'policy' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {sample.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Agent Processing Pipeline */}
          <div className={showSplitView ? 'xl:col-span-1' : ''}>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Agent Processing Pipeline</h2>
              
              {agentActivities.length === 0 && !isProcessing && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>AI agents ready to collaborate</p>
                  <p className="text-sm mt-2">Submit a ticket to see them in action</p>
                </div>
              )}

              {agentActivities.length > 0 && (
                <div className="space-y-4">
                  {agentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border transition-all ${
                        activity.status === 'processing' 
                          ? 'border-purple-300 bg-purple-50 shadow-md' 
                          : activity.status === 'completed'
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className={`flex-shrink-0 ${
                        activity.status === 'processing' ? 'text-purple-600' :
                        activity.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {activity.agent.includes('Router') && <Target className="h-5 w-5" />}
                        {activity.agent.includes('Knowledge') && <Database className="h-5 w-5" />}
                        {activity.agent.includes('Technical') && <Bot className="h-5 w-5" />}
                        {activity.agent.includes('Billing') && <BarChart className="h-5 w-5" />}
                        {activity.agent.includes('Product') && <Lightbulb className="h-5 w-5" />}
                        {activity.agent.includes('QA') && <CheckCircle className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">{activity.agent}</h3>
                          {activity.status === 'processing' && (
                            <Clock className="h-4 w-4 animate-spin text-purple-600" />
                          )}
                          {activity.status === 'completed' && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{activity.action}</p>
                        {activity.detail && (
                          <p className="text-xs text-gray-500 mt-2">{activity.detail}</p>
                        )}
                        {activity.metadata?.suggestedActions && (
                          <div className="mt-2 text-xs">
                            <span className="font-medium text-gray-700">Next steps:</span>
                            <ul className="mt-1 space-y-1">
                              {activity.metadata.suggestedActions.slice(0, 3).map((action: string, idx: number) => (
                                <li key={idx} className="text-gray-600">• {action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {currentStep === 5 && resolutionDetails && (
                    <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-300 rounded-lg">
                      <div className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-green-900">
                            Ticket Resolved by AI Team
                          </h3>
                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Processing Time:</span>
                              <span className="ml-2 font-medium text-gray-900">{resolutionDetails.processingTime}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Agents Involved:</span>
                              <span className="ml-2 font-medium text-gray-900">{resolutionDetails.agentsInvolved}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Confidence Score:</span>
                              <span className="ml-2 font-medium text-gray-900">{Math.round(resolutionDetails.confidenceScore * 100)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Knowledge Used:</span>
                              <span className="ml-2 font-medium text-gray-900">{resolutionDetails.knowledgeArticlesUsed} articles</span>
                            </div>
                          </div>
                          
                          {resolutionDetails.solution && (
                            <div className="mt-4 p-3 bg-white rounded-md">
                              <h4 className="font-medium text-gray-900 mb-2">Solution Steps:</h4>
                              <ol className="space-y-1 text-sm text-gray-700">
                                {resolutionDetails.solution.steps.map((step: string, idx: number) => (
                                  <li key={idx} className="flex">
                                    <span className="font-medium mr-2">{idx + 1}.</span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                              <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                                <span>⏱ {resolutionDetails.solution.estimatedTime}</span>
                                <span>✅ {resolutionDetails.solution.successRate} success rate</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-4 flex space-x-3">
                            <button
                              onClick={() => window.location.href = '/tickets'}
                              className="text-sm font-medium text-green-700 hover:text-green-800"
                            >
                              View All Tickets →
                            </button>
                            <button
                              onClick={() => {
                                setTicketTitle('');
                                setTicketDescription('');
                                setAgentActivities([]);
                                setAgentThoughts([]);
                                setCurrentStep(0);
                                setCreatedTicketId(null);
                                setResolutionDetails(null);
                              }}
                              className="text-sm font-medium text-gray-600 hover:text-gray-700"
                            >
                              Try Another
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - AI Intelligence View (only in split view) */}
          {showSplitView && (
            <div className="xl:col-span-1">
              <EnhancedAgentThinking 
                thoughts={agentThoughts} 
                isProcessing={isProcessing}
                currentAgent={currentAgent || undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}