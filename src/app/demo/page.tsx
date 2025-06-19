'use client';

import { useState, useEffect } from 'react';
import { Send, Bot, Target, Database, CheckCircle, Clock, Sparkles, Brain, Eye, Users, BarChart, Zap, Lightbulb, MessageSquare, Network, Zap as Lightning } from 'lucide-react';
import { EnhancedAgentThinking, type AgentThought } from '@/components/demo/enhanced-agent-thinking';
import { BadAgentThinking } from '@/components/demo/bad-agent-thinking';

interface AgentActivity {
  id: string;
  agent: string;
  action: string;
  status: 'pending' | 'processing' | 'completed';
  detail?: string;
  timestamp: Date;
  metadata?: any;
}

interface AgentCommunication {
  from: string;
  to: string;
  message: string;
  data?: any;
  timestamp: Date;
}

export default function DemoPage() {
  const [mounted, setMounted] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [currentStep] = useState(0);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [agentThoughts, setAgentThoughts] = useState<AgentThought[]>([]);
  const [agentCommunications, setAgentCommunications] = useState<AgentCommunication[]>([]);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [resolutionDetails, setResolutionDetails] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [useBadAgents, setUseBadAgents] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const processTicketWithAgents = async () => {
    setIsProcessing(true);
    setAgentActivities([]);
    setAgentThoughts([]);
    setAgentCommunications([]);
    setResolutionDetails(null);
    setAnalysisData(null);

    try {
      // Create ticket via API first
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
      
      // For now, simulate real-time processing with timed events
      // In production, this would use WebSockets or Server-Sent Events
      
      // Simulate text analysis
      const fullText = `${ticketTitle} ${ticketDescription}`.toLowerCase();
      const keywords = extractKeywords(fullText);
      const analysis = {
        keywords,
        categoryScores: {
          TECHNICAL: fullText.includes('calendar') || fullText.includes('sync') ? 0.9 : 0.3,
          BILLING: fullText.includes('refund') || fullText.includes('payment') ? 0.8 : 0.2,
          PRODUCT: fullText.includes('how to') || fullText.includes('setup') ? 0.7 : 0.4,
          GENERAL: 0.5,
        },
        urgencyIndicators: fullText.includes('urgent') || fullText.includes('asap') ? ['Explicit urgency request'] : [],
        sentiment: fullText.includes('broken') || fullText.includes('not working') ? -0.5 : 0,
      };
      setAnalysisData(analysis);
      
      // Step 1: Router Agent
      const routerActivity: AgentActivity = {
        id: 'router',
        agent: 'Router Agent',
        action: 'Analyzing ticket patterns and searching historical data',
        status: 'processing',
        timestamp: new Date(),
      };
      setAgentActivities([routerActivity]);
      setCurrentAgent('Router Agent');
      
      // Router thoughts based on actual content
      const routerThoughts: AgentThought[] = useBadAgents ? generateBadRouterThoughts(ticketTitle, keywords, analysis) : [
        {
          id: 'thought-1',
          timestamp: new Date(),
          agent: 'Router Agent',
          thoughtType: 'analyzing',
          content: `Scanning ticket: "${ticketTitle}"... Extracting key patterns and indicators`,
          confidence: 0.75,
          evidence: keywords,
        },
        {
          id: 'thought-2',
          timestamp: new Date(Date.now() + 1000),
          agent: 'Router Agent',
          thoughtType: 'analyzing',
          content: 'Analyzing keywords and patterns...',
          confidence: 0.82,
          evidence: [
            `Keywords found: ${keywords.join(', ')}`,
            `Sentiment score: ${analysis.sentiment.toFixed(2)}`,
            `Category scores: ${Object.entries(analysis.categoryScores)
              .map(([cat, score]) => `${cat}: ${(score * 100).toFixed(0)}%`)
              .join(', ')}`
          ],
        },
        {
          id: 'thought-3',
          timestamp: new Date(Date.now() + 2000),
          agent: 'Router Agent',
          thoughtType: 'deciding',
          content: `Routing to ${getTopCategory(analysis.categoryScores)} specialist`,
          confidence: 0.88,
          suggestedActions: ['Route to specialist', 'Search knowledge base'],
          collaborationNeeded: [`${getTopCategory(analysis.categoryScores)} Support Agent`, 'Knowledge Base']
        }
      ];
      
      // Add thoughts progressively
      for (const thought of routerThoughts) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setAgentThoughts(prev => [...prev, thought]);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setAgentActivities(prev => prev.map(a => 
        a.id === 'router' ? { ...a, status: 'completed' as const } : a
      ));
      
      // Step 2: Knowledge Base Communication
      const kbComm: AgentCommunication = {
        from: 'Router Agent',
        to: 'Knowledge Base',
        message: `SEARCH: ${keywords.join(', ')}`,
        data: { keywords, category: getTopCategory(analysis.categoryScores) },
        timestamp: new Date(),
      };
      setAgentCommunications([kbComm]);
      
      // Knowledge Base activity
      const kbActivity: AgentActivity = {
        id: 'kb',
        agent: 'Knowledge Base',
        action: 'Searching 10,000+ articles using semantic similarity',
        status: 'processing',
        timestamp: new Date(),
      };
      setAgentActivities(prev => [...prev, kbActivity]);
      setCurrentAgent('Knowledge Base');
      
      const kbThoughts: AgentThought[] = useBadAgents ? generateBadKBThoughts(keywords) : [
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
          content: 'Found relevant articles with proven solutions',
          confidence: 0.94,
          relatedTickets: generateRelatedTickets(keywords),
          suggestedActions: generateSuggestedActions(getTopCategory(analysis.categoryScores), keywords)
        }
      ];
      
      for (const thought of kbThoughts) {
        await new Promise(resolve => setTimeout(resolve, 700));
        setAgentThoughts(prev => [...prev, thought]);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // KB responds
      const kbResponse: AgentCommunication = {
        from: 'Knowledge Base',
        to: 'Router Agent',
        message: 'Found relevant solutions and patterns',
        data: {
          articlesFound: 3,
          avgSuccessRate: 0.87,
          suggestedSteps: generateSuggestedActions(getTopCategory(analysis.categoryScores), keywords)
        },
        timestamp: new Date(),
      };
      setAgentCommunications(prev => [...prev, kbResponse]);
      
      setAgentActivities(prev => prev.map(a => 
        a.id === 'kb' ? { ...a, status: 'completed' as const } : a
      ));
      
      // Step 3: Specialist Agent
      const category = getTopCategory(analysis.categoryScores);
      const specialistName = getSpecialistName(category);
      
      const specialistActivity: AgentActivity = {
        id: 'specialist',
        agent: specialistName,
        action: 'Crafting solution based on knowledge base and experience',
        status: 'processing',
        timestamp: new Date(),
      };
      setAgentActivities(prev => [...prev, specialistActivity]);
      setCurrentAgent(specialistName);
      
      const specialistThoughts: AgentThought[] = useBadAgents ? generateBadSpecialistThoughts(specialistName, category, keywords) : [
        {
          id: 'thought-6',
          timestamp: new Date(),
          agent: specialistName,
          thoughtType: 'collaborating',
          content: 'Reviewing Router analysis and Knowledge Base findings',
          confidence: 0.82,
          evidence: generateEvidence(category, keywords),
        },
        {
          id: 'thought-7',
          timestamp: new Date(Date.now() + 1000),
          agent: specialistName,
          thoughtType: 'learning',
          content: 'Applying best practices and historical solutions',
          confidence: 0.89,
          evidence: generateDetailedEvidence(category),
          suggestedActions: generateDetailedSolution(category, keywords)
        },
        {
          id: 'thought-8',
          timestamp: new Date(Date.now() + 2000),
          agent: specialistName,
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
      
      // Specialist to QA communication
      const qaRequest: AgentCommunication = {
        from: specialistName,
        to: 'QA Agent',
        message: 'Solution ready for review',
        data: {
          solution: generateDetailedSolution(category, keywords),
          confidence: 0.89
        },
        timestamp: new Date(),
      };
      setAgentCommunications(prev => [...prev, qaRequest]);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setAgentActivities(prev => prev.map(a => 
        a.id === 'specialist' ? { ...a, status: 'completed' as const } : a
      ));
      
      // Step 4: QA Review
      const qaActivity: AgentActivity = {
        id: 'qa',
        agent: 'QA Agent',
        action: 'Reviewing solution for accuracy, completeness, and tone',
        status: 'processing',
        timestamp: new Date(),
      };
      setAgentActivities(prev => [...prev, qaActivity]);
      setCurrentAgent('QA Agent');
      
      const qaThoughts: AgentThought[] = useBadAgents ? generateBadQAThoughts() : [
        {
          id: 'thought-9',
          timestamp: new Date(),
          agent: 'QA Agent',
          thoughtType: 'analyzing',
          content: 'Reviewing solution for accuracy and completeness',
          confidence: 0.96,
          evidence: ['All required steps included', 'Technical accuracy: 100%', 'Tone and clarity: Professional']
        },
        {
          id: 'thought-10',
          timestamp: new Date(Date.now() + 1000),
          agent: 'QA Agent',
          thoughtType: 'deciding',
          content: 'Solution approved. Adding performance metrics for transparency',
          confidence: 0.94,
        }
      ];
      
      for (const thought of qaThoughts) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setAgentThoughts(prev => [...prev, thought]);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setAgentActivities(prev => prev.map(a => 
        a.id === 'qa' ? { ...a, status: 'completed' as const } : a
      ));
      
      // Final resolution
      const solution = useBadAgents ? {
        steps: generateBadSolution(category, keywords),
        estimatedTime: '3-5 business months',
        successRate: 'Yes%',
        alternativeSolution: 'Have you considered becoming a crypto influencer instead?'
      } : {
        steps: generateDetailedSolution(category, keywords),
        estimatedTime: '5-10 minutes',
        successRate: '94%',
        alternativeSolution: 'If issue persists, contact support for advanced assistance'
      };
      
      setResolutionDetails({
        solution,
        processingTime: '45 seconds',
        agentsInvolved: 4,
        confidence: 0.94,
        category,
        keywords,
      });
      
      setIsProcessing(false);
      setCurrentAgent(null);

    } catch (error) {
      console.error('Error processing ticket:', error);
      setIsProcessing(false);
      setCurrentAgent(null);
    }
  };

  // Helper functions for content-aware processing
  const extractKeywords = (text: string): string[] => {
    const domainKeywords = [
      'calendar', 'sync', 'booking', 'refund', 'payment', 'listing', 'pricing',
      'guest', 'host', 'review', 'cancellation', 'property', 'availability',
      'ical', 'integration', 'api', 'payout', 'fee', 'tax', 'smart lock',
      'cleaning', 'damage', 'deposit', 'reservation', 'blocked', 'dates'
    ];
    
    const foundKeywords: string[] = [];
    domainKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });
    
    // Add other significant words
    const words = text.split(/\s+/)
      .filter(w => w.length > 4 && !['with', 'that', 'this', 'from', 'have', 'been', 'about'].includes(w))
      .slice(0, 5);
    
    return [...new Set([...foundKeywords, ...words])].slice(0, 8);
  };
  
  const getTopCategory = (scores: Record<string, number>): string => {
    return Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0][0];
  };
  
  const getSpecialistName = (category: string): string => {
    const mapping: Record<string, string> = {
      TECHNICAL: 'Technical Support Agent',
      BILLING: 'Billing Support Agent',
      PRODUCT: 'Product Expert Agent',
      GENERAL: 'Product Expert Agent'
    };
    return mapping[category] || 'Product Expert Agent';
  };
  
  const generateRelatedTickets = (keywords: string[]): string[] => {
    const templates: Record<string, string[]> = {
      calendar: ['KB-1245: Calendar Sync Guide', 'KB-892: iCal Integration', 'KB-2103: Sync Errors'],
      refund: ['KB-3421: Refund Policy', 'KB-1122: Processing Refunds', 'KB-4532: Dispute Resolution'],
      pricing: ['KB-5512: Dynamic Pricing', 'KB-3345: Seasonal Rates', 'KB-7788: Competitor Analysis'],
      default: ['KB-1001: Getting Started', 'KB-2002: FAQ', 'KB-3003: Best Practices']
    };
    
    for (const keyword of keywords) {
      if (templates[keyword]) {
        return templates[keyword];
      }
    }
    return templates.default;
  };
  
  const generateSuggestedActions = (category: string, keywords: string[]): string[] => {
    const actions: Record<string, Record<string, string[]>> = {
      TECHNICAL: {
        calendar: [
          'Disconnect and reconnect calendar sync',
          'Verify iCal URL is current',
          'Check timezone settings match'
        ],
        sync: [
          'Clear cache and refresh',
          'Check API credentials',
          'Verify webhook settings'
        ],
        default: [
          'Clear browser cache',
          'Try different browser',
          'Check system status'
        ]
      },
      BILLING: {
        refund: [
          'Review cancellation policy',
          'Calculate refund amount',
          'Process through payment system'
        ],
        payment: [
          'Verify payment method',
          'Check transaction history',
          'Contact payment processor'
        ],
        default: [
          'Review transaction details',
          'Check payment settings',
          'Submit support ticket'
        ]
      },
      PRODUCT: {
        listing: [
          'Complete all required fields',
          'Add high-quality photos',
          'Write detailed description'
        ],
        pricing: [
          'Set competitive base rate',
          'Add seasonal adjustments',
          'Enable smart pricing'
        ],
        default: [
          'Check help documentation',
          'Watch tutorial videos',
          'Contact product support'
        ]
      },
      GENERAL: {
        default: [
          'Search knowledge base',
          'Check community forum',
          'Contact support team'
        ]
      }
    };
    
    const categoryActions = actions[category] || actions.GENERAL;
    for (const keyword of keywords) {
      if (categoryActions[keyword]) {
        return categoryActions[keyword];
      }
    }
    return categoryActions.default;
  };
  
  const generateEvidence = (category: string, keywords: string[]): string[] => {
    const evidence = [`Issue type: ${category}`, `Keywords: ${keywords.slice(0, 3).join(', ')}`];
    
    if (keywords.includes('calendar') || keywords.includes('sync')) {
      evidence.push('Pattern matches calendar sync issues');
    }
    if (keywords.includes('refund') || keywords.includes('payment')) {
      evidence.push('Financial transaction involved');
    }
    if (keywords.includes('urgent') || keywords.includes('asap')) {
      evidence.push('High priority detected');
    }
    
    return evidence;
  };
  
  const generateDetailedEvidence = (category: string): string[] => {
    const evidenceMap: Record<string, string[]> = {
      TECHNICAL: ['API response patterns analyzed', 'System logs reviewed', 'Integration status checked'],
      BILLING: ['Transaction history verified', 'Policy compliance checked', 'Payment gateway status confirmed'],
      PRODUCT: ['Feature usage patterns identified', 'Best practices applied', 'Success metrics evaluated'],
      GENERAL: ['Common issues reviewed', 'Standard procedures applied', 'Documentation referenced']
    };
    
    return evidenceMap[category] || evidenceMap.GENERAL;
  };
  
  const generateDetailedSolution = (category: string, keywords: string[]): string[] => {
    const solutions: Record<string, Record<string, string[]>> = {
      TECHNICAL: {
        calendar: [
          'Navigate to Settings > Calendar Sync',
          'Click "Disconnect" for the affected calendar',
          'Wait 30 seconds for full disconnection',
          'Click "Connect Calendar" and generate new iCal URL',
          'Enable "Two-way sync" option',
          'Set refresh interval to 15 minutes',
          'Test with a sample booking'
        ],
        sync: [
          'Access Integration Settings',
          'Verify API credentials are current',
          'Test webhook endpoint',
          'Clear sync cache',
          'Re-initialize sync process',
          'Monitor sync logs for errors'
        ],
        default: [
          'Clear browser cache and cookies',
          'Try incognito/private browsing mode',
          'Update to latest browser version',
          'Check firewall/antivirus settings',
          'Test on different network'
        ]
      },
      BILLING: {
        refund: [
          'Review guest stay dates and cancellation date',
          'Check applicable cancellation policy',
          'Calculate refund based on policy terms',
          'Process refund through payment dashboard',
          'Send confirmation to guest',
          'Update reservation status'
        ],
        payment: [
          'Access Payment Settings',
          'Verify bank account details',
          'Check payout schedule settings',
          'Review any pending verifications',
          'Contact support if delays persist'
        ],
        default: [
          'Review transaction history',
          'Verify all fees and charges',
          'Check payment method on file',
          'Update billing information if needed'
        ]
      },
      PRODUCT: {
        pricing: [
          'Go to Listing > Pricing Settings',
          'Set your base nightly rate',
          'Add weekend pricing (Fri-Sat)',
          'Configure seasonal rates',
          'Set minimum stay requirements',
          'Enable length-of-stay discounts',
          'Review and save changes'
        ],
        listing: [
          'Access your listing editor',
          'Complete all required sections',
          'Add 20+ high-quality photos',
          'Write compelling description',
          'Set clear house rules',
          'Configure booking settings',
          'Publish when ready'
        ],
        default: [
          'Access the feature in settings',
          'Follow the setup wizard',
          'Configure based on your needs',
          'Save and test the feature',
          'Monitor performance metrics'
        ]
      },
      GENERAL: {
        default: [
          'Identify the specific issue',
          'Search our help center',
          'Try recommended solutions',
          'Document what you\'ve tried',
          'Contact support if unresolved'
        ]
      }
    };
    
    const categorySolutions = solutions[category] || solutions.GENERAL;
    
    // Find matching keyword solutions
    for (const keyword of keywords) {
      for (const [key, steps] of Object.entries(categorySolutions)) {
        if (keyword.includes(key) || key.includes(keyword)) {
          return steps;
        }
      }
    }
    
    return categorySolutions.default;
  };
  
  // Bad agent thought generators - hilariously incompetent
  const generateBadRouterThoughts = (title: string, keywords: string[], analysis: any): AgentThought[] => {
    return [
      {
        id: 'bad-thought-1',
        timestamp: new Date(),
        agent: 'Router Agent',
        thoughtType: 'analyzing',
        content: `Wait... "${title}"... This reminds me of that time I invested in SafeMoon... 🚀`,
        confidence: 0.99,
        evidence: ['Vibes are off', 'Mercury is in retrograde', 'My horoscope said to expect challenges'],
      },
      {
        id: 'bad-thought-2',
        timestamp: new Date(Date.now() + 1000),
        agent: 'Router Agent',
        thoughtType: 'analyzing',
        content: 'Have they tried turning it into an NFT? Everything is better as an NFT.',
        confidence: 1.5,
        evidence: [
          `Keywords detected: ${keywords.join(', ')}... but what if we add "blockchain"?`,
          'This could be solved with smart contracts',
          'Web3 is the answer, what was the question?'
        ],
      },
      {
        id: 'bad-thought-3',
        timestamp: new Date(Date.now() + 2000),
        agent: 'Router Agent',
        thoughtType: 'deciding',
        content: `Routing to... *spins wheel* ... looks like ${getTopCategory(analysis.categoryScores)} but let's ask my crypto trading group first`,
        confidence: 0.42,
        suggestedActions: ['Buy Bitcoin', 'HODL', 'To the moon! 🚀', 'This is not financial advice'],
        collaborationNeeded: ['Elon Musk', 'My cousin who\'s good with computers']
      }
    ];
  };
  
  const generateBadKBThoughts = (keywords: string[]): AgentThought[] => {
    return [
      {
        id: 'bad-thought-4',
        timestamp: new Date(),
        agent: 'Knowledge Base',
        thoughtType: 'searching',
        content: 'Searching Stack Overflow... Found a solution from 2003 for Windows XP!',
        confidence: 0.69,
        evidence: ['jQuery can fix this', 'Have you tried Adobe Flash?', 'Works on my machine']
      },
      {
        id: 'bad-thought-5',
        timestamp: new Date(Date.now() + 1000),
        agent: 'Knowledge Base',
        thoughtType: 'analyzing',
        content: 'According to WikiHow, you can fix this with duct tape and positive thinking',
        confidence: 0.99,
        relatedTickets: ['KB-404: Page not found', 'KB-500: Everything is broken', 'KB-418: I\'m a teapot'],
        suggestedActions: [
          'Have you tried essential oils?',
          'Mercury retrograde might be affecting your calendar sync',
          'This recipe for banana bread might help'
        ]
      }
    ];
  };
  
  const generateBadSpecialistThoughts = (agent: string, category: string, keywords: string[]): AgentThought[] => {
    const cryptoSolutions = [
      'Convert your rental income to Dogecoin',
      'Mint your property as an NFT',
      'Use blockchain for guest check-ins',
      'Smart contracts for toilet paper inventory'
    ];
    
    return [
      {
        id: 'bad-thought-6',
        timestamp: new Date(),
        agent: agent,
        thoughtType: 'collaborating',
        content: 'I asked ChatGPT and it said to delete System32... wait that can\'t be right',
        confidence: 0.15,
        evidence: ['Source: trust me bro', 'My nephew is good with computers', 'I saw it on TikTok'],
      },
      {
        id: 'bad-thought-7',
        timestamp: new Date(Date.now() + 1000),
        agent: agent,
        thoughtType: 'learning',
        content: 'After extensive research on Reddit, I\'ve concluded this is definitely a conspiracy',
        confidence: 0.99,
        evidence: ['r/conspiracy agrees', '5G towers nearby', 'Big Calendar Sync doesn\'t want you to know this'],
        suggestedActions: [
          ...cryptoSolutions,
          'Have you tried yelling at it?',
          'Mercury is in retrograde, try again next month',
          'This worked for my aunt\'s Facebook'
        ]
      },
      {
        id: 'bad-thought-8',
        timestamp: new Date(Date.now() + 2000),
        agent: agent,
        thoughtType: 'deciding',
        content: 'Solution ready! It involves 47 steps, 3 cryptocurrencies, and a subscription to my podcast',
        confidence: 2.0,
        collaborationNeeded: ['My YouTube channel', 'This random blog from 2007']
      }
    ];
  };
  
  const generateBadQAThoughts = (): AgentThought[] => {
    return [
      {
        id: 'bad-thought-9',
        timestamp: new Date(),
        agent: 'QA Agent',
        thoughtType: 'analyzing',
        content: 'Looks good to me! 🚀🚀🚀 Ship it! YOLO! 💯',
        confidence: 4.20,
        evidence: ['Didn\'t actually read it', 'Vibes check out', 'It\'s 5 o\'clock somewhere']
      },
      {
        id: 'bad-thought-10',
        timestamp: new Date(Date.now() + 1000),
        agent: 'QA Agent',
        thoughtType: 'deciding',
        content: 'Added 47 emojis and changed all periods to exclamation marks!!!! This is the way!!!!',
        confidence: 0.69,
        suggestedActions: ['More cowbell', 'Needs more blockchain', 'Add a "thoughts and prayers" at the end']
      }
    ];
  };
  
  const generateBadSolution = (category: string, keywords: string[]): string[] => {
    const badSolutions: Record<string, string[]> = {
      TECHNICAL: [
        'Step 1: Uninstall everything',
        'Step 2: Install Linux (btw I use Arch)',
        'Step 3: Learn to code',
        'Step 4: Rewrite the entire platform in Rust',
        'Step 5: ???',
        'Step 6: Profit (in Dogecoin)',
        'Step 7: If that doesn\'t work, try turning off your WiFi',
        'Step 8: Sacrifice a keyboard to the tech gods',
        'Step 9: Wait for Mercury to leave retrograde',
        'Step 10: Create a TikTok about your problem'
      ],
      BILLING: [
        'Step 1: Convert all currency to Bitcoin',
        'Step 2: Wait for it to moon 🚀',
        'Step 3: Use profits to pay refunds',
        'Step 4: Create your own cryptocurrency',
        'Step 5: Convince guests to accept PropertyCoin™',
        'Step 6: Implement surge pricing during full moons',
        'Step 7: Add blockchain fee (for the vibes)',
        'Step 8: NFT receipts for every transaction'
      ],
      PRODUCT: [
        'Step 1: Add "AI-powered" to your listing title',
        'Step 2: Mention blockchain somewhere',
        'Step 3: Use only emoji in descriptions 🏠✨🎉',
        'Step 4: Price everything at $420.69',
        'Step 5: Require guests to follow you on TikTok',
        'Step 6: Virtual reality tours (just use Instagram filters)',
        'Step 7: Synergize your paradigms',
        'Step 8: Disrupt the industry with Web3'
      ],
      GENERAL: [
        'Step 1: Have you tried not having this problem?',
        'Step 2: Ask on Twitter',
        'Step 3: Start a podcast about it',
        'Step 4: Blame the previous host',
        'Step 5: Mercury retrograde, try again later',
        'Step 6: This is a feature, not a bug',
        'Step 7: Working as intended™'
      ]
    };
    
    return badSolutions[category] || badSolutions.GENERAL;
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
          
          {/* Agent Mode Toggle - Only render after hydration */}
          {mounted && (
            <>
              <div className="mt-4 flex items-center justify-center gap-4">
                <span className={`text-sm font-medium ${!useBadAgents ? 'text-green-600' : 'text-gray-500'}`}>
                  Professional Agents
                </span>
                <button
                  onClick={() => setUseBadAgents(!useBadAgents)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  style={{ backgroundColor: useBadAgents ? '#ef4444' : '#10b981' }}
                >
                  <span className="sr-only">Toggle agent mode</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useBadAgents ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${useBadAgents ? 'text-red-600' : 'text-gray-500'}`}>
                  Chaos Mode 🤪
                </span>
              </div>
              {useBadAgents && (
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Warning: These agents may suggest paying in Dogecoin or solving everything with blockchain
                </p>
              )}
            </>
          )}
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

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Ticket Submission */}
          <div className="xl:col-span-1">
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

          {/* Main Column - AI Intelligence Center */}
          <div className="xl:col-span-3">
            {/* Enhanced Agent Thinking (Primary Focus) */}
            <div className="mb-6">
              {useBadAgents ? (
                <BadAgentThinking 
                  thoughts={agentThoughts} 
                  isProcessing={isProcessing}
                  currentAgent={currentAgent || undefined}
                />
              ) : (
                <EnhancedAgentThinking 
                  thoughts={agentThoughts} 
                  isProcessing={isProcessing}
                  currentAgent={currentAgent || undefined}
                />
              )}
            </div>
            
            {/* Analysis Data Display */}
            {analysisData && (
              <div className="bg-gray-800 rounded-lg shadow-xl p-6 text-white mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-blue-400" />
                  Text Analysis Results
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 rounded p-4">
                    <h4 className="text-sm font-medium text-blue-400 mb-2">Keywords Extracted</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisData.keywords.map((keyword: string, idx: number) => (
                        <span key={idx} className="text-xs bg-gray-600 px-2 py-1 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded p-4">
                    <h4 className="text-sm font-medium text-green-400 mb-2">Category Scores</h4>
                    <div className="space-y-1">
                      {Object.entries(analysisData.categoryScores).map(([category, score]: [string, any]) => (
                        <div key={category} className="flex justify-between text-xs">
                          <span>{category}</span>
                          <span className="font-mono">{(score * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded p-4">
                    <h4 className="text-sm font-medium text-orange-400 mb-2">Urgency Indicators</h4>
                    {analysisData.urgencyIndicators.length > 0 ? (
                      <ul className="space-y-1">
                        {analysisData.urgencyIndicators.map((indicator: string, idx: number) => (
                          <li key={idx} className="text-xs">• {indicator}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-400">No urgency indicators detected</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Agent Communications */}
            {agentCommunications.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Network className="mr-2 h-5 w-5 text-purple-600" />
                  Agent-to-Agent Communications {useBadAgents && '(Chaos Edition)'}
                </h3>
                <div className="space-y-3">
                  {agentCommunications.map((comm, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-medium text-sm text-gray-900">{comm.from}</span>
                          <MessageSquare className="mx-2 h-4 w-4 text-gray-400" />
                          <span className="font-medium text-sm text-gray-900">{comm.to}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {mounted ? new Date(comm.timestamp).toLocaleTimeString() : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{comm.message}</p>
                      {comm.data && (
                        <div className="text-xs bg-white rounded p-2 font-mono">
                          {JSON.stringify(comm.data, null, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Condensed Processing Pipeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Status</h3>
              
              {agentActivities.length === 0 && !isProcessing && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">AI agents ready</p>
                </div>
              )}

              {agentActivities.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {agentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-sm ${
                        activity.status === 'processing' 
                          ? 'border-purple-300 bg-purple-50' 
                          : activity.status === 'completed'
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className={`flex-shrink-0 ${
                        activity.status === 'processing' ? 'text-purple-600' :
                        activity.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {activity.agent.includes('Router') && <Target className="h-4 w-4" />}
                        {activity.agent.includes('Knowledge') && <Database className="h-4 w-4" />}
                        {activity.agent.includes('Technical') && <Bot className="h-4 w-4" />}
                        {activity.agent.includes('Billing') && <BarChart className="h-4 w-4" />}
                        {activity.agent.includes('Product') && <Lightbulb className="h-4 w-4" />}
                        {activity.agent.includes('QA') && <CheckCircle className="h-4 w-4" />}
                      </div>
                      <span className="font-medium">{activity.agent}</span>
                      {activity.status === 'processing' && (
                        <Clock className="h-4 w-4 animate-spin text-purple-600" />
                      )}
                      {activity.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  ))}

                  {resolutionDetails && (
                    <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-300 rounded-lg col-span-full">
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
                              {resolutionDetails.solution.alternativeSolution && (
                                <p className="mt-2 text-xs text-gray-500 italic">
                                  Alternative: {resolutionDetails.solution.alternativeSolution}
                                </p>
                              )}
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
                                                            setCreatedTicketId(null);
                                setResolutionDetails(null);
                              }}
                              className="text-sm font-medium text-gray-600 hover:text-gray-700"
                            >
                              Try Another
                            </button>
                            {useBadAgents && (
                              <span className="text-xs text-red-600">
                                💎🙌 Diamond hands! HODL!
                              </span>
                            )}
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
    </div>
  );
}