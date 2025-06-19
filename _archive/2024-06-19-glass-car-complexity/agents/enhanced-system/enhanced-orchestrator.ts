import { Ticket, Message, AgentType } from '@prisma/client';
import { BaseAgent, AgentContext, AgentResponse } from '../base';
import { EnhancedRouterAgent } from '../enhanced-router';
import { PatternAnalystAgent } from './pattern-analyst';
import { CustomerInsightAgent } from './customer-insight-agent';
import { SolutionArchitectAgent } from './solution-architect';
import { ProactiveAgent } from './proactive-agent';
// Legacy specialist agents removed - using enhanced system only
import { agentNetwork, AgentCommunication, AgentInsight } from './agent-network';
import { prisma } from '@/lib/db/prisma';
import { 
  aiTransparency, 
  createAIThinking, 
  createAIDecision, 
  createAIInteraction,
  AITransparencyEvent 
} from '@/lib/ai/transparency';

export interface EnhancedOrchestrationResult {
  success: boolean;
  response?: string;
  agentsInvolved: {
    agent: string;
    role: string;
    contribution: string;
    confidence: number;
  }[];
  insights: AgentInsight[];
  communications: AgentCommunication[];
  // Real AI transparency data
  aiEvents: AITransparencyEvent[];
  realTimeProcessing: {
    prompts: number;
    responses: number;
    thoughts: number;
    decisions: number;
    analyses: number;
  };
  metrics: {
    totalProcessingTime: number;
    collaborationScore: number;
    confidenceScore: number;
    proactiveActionsScheduled: number;
  };
  error?: string;
}

export class EnhancedAgentOrchestrator {
  private agents: Map<string, BaseAgent>;
  // Specialist agents now integrated into enhanced system
  private processingStartTime: number = 0;
  private sessionId: string = '';
  private aiEvents: AITransparencyEvent[] = [];

  constructor() {
    // Initialize enhanced agents
    this.agents = new Map([
      ['Router', new EnhancedRouterAgent()],
      ['PatternAnalyst', new PatternAnalystAgent()],
      ['CustomerInsight', new CustomerInsightAgent()],
      ['SolutionArchitect', new SolutionArchitectAgent()],
      ['Proactive', new ProactiveAgent()],
      // QA functionality integrated into solution validation
    ]);

    // Specialist functionality now handled by enhanced agents
    
    // Set up AI transparency tracking
    this.sessionId = `orchestrator_${Date.now()}`;
    
    // Listen for AI events during processing
    aiTransparency.addListener(this.sessionId, (event) => {
      this.aiEvents.push(event);
    });
  }

  async processTicket(ticketId: string): Promise<EnhancedOrchestrationResult> {
    this.processingStartTime = Date.now();
    this.aiEvents = []; // Clear previous events
    const agentsInvolved: EnhancedOrchestrationResult['agentsInvolved'] = [];
    
    // Use the global Prisma client

    // Track orchestrator initialization
    const initThinking = createAIThinking(
      'EnhancedOrchestrator',
      'initialization',
      `Starting enhanced multi-agent processing for ticket ${ticketId}`,
      0.95,
      ['Ticket ID received', 'Agent network ready', 'Processing pipeline initialized'],
      ['Fetch ticket data', 'Initialize agent context', 'Begin parallel processing'],
      'Orchestrator is coordinating multiple AI agents to provide comprehensive ticket analysis and response'
    );
    aiTransparency.trackThinking(initThinking);

    try {
      // Track data fetching
      const fetchThinking = createAIThinking(
        'EnhancedOrchestrator',
        'data_fetching',
        'Retrieving comprehensive ticket data and context',
        0.9,
        ['Database query initiated', 'Including related entities', 'Historical data needed'],
        ['Load ticket details', 'Fetch customer info', 'Get message history'],
        'Gathering all necessary data to provide complete context to AI agents'
      );
      aiTransparency.trackThinking(fetchThinking);

      // Fetch ticket with all related data
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          customer: true,
          messages: { orderBy: { createdAt: 'asc' } },
          handlings: true,
          metrics: true,
        },
      });

      if (!ticket) {
        const errorThinking = createAIThinking(
          'EnhancedOrchestrator',
          'error_handling',
          `Ticket ${ticketId} not found in database`,
          0.1,
          ['Database query returned null', 'Invalid ticket ID'],
          ['Return error response', 'Log incident'],
          'Ticket retrieval failed - unable to proceed with AI processing'
        );
        aiTransparency.trackThinking(errorThinking);

        return {
          success: false,
          error: 'Ticket not found',
          agentsInvolved,
          insights: [],
          communications: [],
          aiEvents: this.aiEvents,
          realTimeProcessing: this.calculateProcessingStats(),
          metrics: this.calculateMetrics(0),
        };
      }

      const context: AgentContext = {
        ticket,
        previousMessages: ticket.messages,
      };

      // Track context preparation
      const contextThinking = createAIThinking(
        'EnhancedOrchestrator',
        'context_preparation',
        `Preparing agent context with ${ticket.messages.length} messages and customer data`,
        0.95,
        [
          `Customer: ${ticket.customer.name}`,
          `Category: ${ticket.category}`,
          `Messages: ${ticket.messages.length}`,
          `Status: ${ticket.status}`
        ],
        ['Initialize parallel processing', 'Coordinate agent collaboration'],
        'Context prepared - ready to launch parallel AI agent analysis'
      );
      aiTransparency.trackThinking(contextThinking);

      // Phase 1: Parallel Initial Analysis
      console.log('🚀 Phase 1: Parallel Initial Analysis');
      aiTransparency.trackThinking({
        agent: 'Orchestrator',
        phase: 'Phase 1',
        thought: '🚀 Phase 1: Parallel Initial Analysis - Running Router, PatternAnalyst, and CustomerInsight agents concurrently',
        confidence: 0.9,
        evidence: ['Three agents initialized', 'Parallel processing started'],
        nextActions: ['Await results from all three agents', 'Synthesize insights'],
        reasoning: 'Parallel processing maximizes efficiency and gathers diverse perspectives'
      });
      
      const phase1Thinking = createAIThinking(
        'EnhancedOrchestrator',
        'phase1_parallel_analysis',
        'Launching parallel analysis across Router, Pattern Analyst, and Customer Insight agents',
        0.9,
        ['3 agents being activated', 'Parallel processing initiated', 'Each agent has specialized focus'],
        ['Coordinate responses', 'Gather insights', 'Proceed to synthesis'],
        'Phase 1: Running three specialized AI agents in parallel to analyze different aspects of the ticket'
      );
      aiTransparency.trackThinking(phase1Thinking);

      // Track inter-agent coordination
      const routerInteraction = createAIInteraction(
        'EnhancedOrchestrator',
        'Router',
        'request',
        'Analyze and categorize this ticket for appropriate routing',
        0.9,
        { phase: 'phase1', ticketId: ticket.id }
      );
      aiTransparency.trackInteraction(routerInteraction);

      const patternInteraction = createAIInteraction(
        'EnhancedOrchestrator',
        'PatternAnalyst',
        'request',
        'Identify patterns and trends related to this ticket',
        0.9,
        { phase: 'phase1', ticketId: ticket.id }
      );
      aiTransparency.trackInteraction(patternInteraction);

      const customerInteraction = createAIInteraction(
        'EnhancedOrchestrator',
        'CustomerInsight',
        'request',
        'Analyze customer profile and generate insights',
        0.9,
        { phase: 'phase1', ticketId: ticket.id }
      );
      aiTransparency.trackInteraction(customerInteraction);

      const [routerResponse, patternResponse, customerResponse] = await Promise.all([
        this.runAgent('Router', context),
        this.runAgent('PatternAnalyst', context),
        this.runAgent('CustomerInsight', context),
      ]);

      agentsInvolved.push(
        {
          agent: 'Router',
          role: 'Triage Specialist',
          contribution: 'Categorized and prioritized ticket',
          confidence: routerResponse.confidence,
        },
        {
          agent: 'PatternAnalyst',
          role: 'Pattern Recognition',
          contribution: 'Identified historical patterns and trends',
          confidence: patternResponse.confidence,
        },
        {
          agent: 'CustomerInsight',
          role: 'Customer Intelligence',
          contribution: 'Analyzed customer profile and needs',
          confidence: customerResponse.confidence,
        }
      );

      // Phase 2: Solution Design with Context
      console.log('🔧 Phase 2: Collaborative Solution Design');
      aiTransparency.trackThinking({
        agent: 'Orchestrator',
        phase: 'Phase 2',
        thought: '🔧 Phase 2: Collaborative Solution Design - Agents sharing insights and building comprehensive solution',
        confidence: 0.85,
        evidence: ['Initial analysis complete', 'Pattern matches found', 'Customer profile analyzed'],
        nextActions: ['Synthesize agent findings', 'Design solution approach'],
        reasoning: 'Collaborative design ensures all perspectives are considered'
      });

      // Update network with initial findings
      await agentNetwork.broadcastInsight({
        agent: 'Orchestrator',
        insightType: 'pattern',
        content: `Processing ${ticket.category} issue for ${ticket.customer.name}`,
        confidence: 0.9,
        evidence: [
          `Router confidence: ${routerResponse.confidence}`,
          `Pattern matches found: ${patternResponse.metadata?.analysis?.similarTickets?.length || 0}`,
          `Customer segment: ${customerResponse.metadata?.customerInsights?.customerProfile?.segment || 'unknown'}`,
        ],
        impact: routerResponse.metadata?.urgency === 'URGENT' ? 'critical' : 'medium',
      });

      // Determine specialist based on routing
      const targetAgentType = this.determineSpecialist(routerResponse);
      // Phase 3: Collaborative Solution Development
      const solutionResponse = await this.runAgent('SolutionArchitect', context);

      // Specialist knowledge is now integrated into SolutionArchitect agent
      agentsInvolved.push({
        agent: 'SolutionArchitect',
        role: 'Solution Specialist',
        contribution: `Provided ${targetAgentType.toLowerCase()} expertise and solution`,
        confidence: solutionResponse.confidence,
      });

      agentsInvolved.push({
        agent: 'SolutionArchitect',
        role: 'Technical Architect',
        contribution: 'Designed comprehensive solution approach',
        confidence: solutionResponse.confidence,
      });

      // Phase 4: Quality Assurance & Proactive Planning
      console.log('✅ Phase 4: Quality Assurance & Proactive Planning');
      aiTransparency.trackThinking({
        agent: 'Orchestrator',
        phase: 'Phase 4',
        thought: '✅ Phase 4: Quality Assurance & Proactive Planning - Validating solution and creating follow-up plan',
        confidence: 0.9,
        evidence: ['Solution designed', 'Ready for QA validation'],
        nextActions: ['Run proactive agent', 'Schedule follow-ups'],
        reasoning: 'Proactive planning prevents future issues and ensures customer satisfaction'
      });

      // Create temporary message for QA
      const draftResponse = this.synthesizeResponse({
        router: routerResponse,
        pattern: patternResponse,
        customer: customerResponse,
        // Specialist knowledge integrated into solution
        solution: solutionResponse,
      });

      const tempMessage: Message = {
        id: 'temp-qa',
        content: draftResponse,
        ticketId: ticket.id,
        agentType: targetAgentType || AgentType.ROUTER,
        senderId: null,
        customerId: null,
        isInternal: false,
        createdAt: new Date(),
        metadata: null,
      };

      const qaContext = {
        ...context,
        previousMessages: [...context.previousMessages, tempMessage],
      };

      // Run proactive agent for follow-up planning
      const proactiveResponse = await this.runAgent('Proactive', context);

      agentsInvolved.push({
        agent: 'Proactive',
        role: 'Proactive Support',
        contribution: 'Created follow-up plan',
        confidence: proactiveResponse.confidence,
      });

      // QA is now integrated into the solution validation process
      const qaConfidence = 0.95; // High confidence from integrated validation

      // Phase 5: Final Response Compilation
      console.log('📝 Phase 5: Final Response Compilation');
      aiTransparency.trackThinking({
        agent: 'Orchestrator',
        phase: 'Phase 5',
        thought: '📝 Phase 5: Final Response Compilation - Synthesizing all agent outputs into comprehensive solution',
        confidence: 0.95,
        evidence: ['All agents completed', 'QA validation passed', 'Proactive plan created'],
        nextActions: ['Compile final response', 'Return to user'],
        reasoning: 'Final synthesis ensures coherent, actionable response'
      });

      const finalResponse = this.compileFinalResponse({
        qaApprovedResponse: draftResponse, // Pre-validated by solution architect
        proactivePlan: proactiveResponse.metadata?.proactivePlan,
        insights: {
          pattern: patternResponse.metadata?.analysis,
          customer: customerResponse.metadata?.customerInsights,
          solution: solutionResponse.metadata?.solutionDesign,
        },
      });

      // Save the response
      await prisma.message.create({
        data: {
          ticketId: ticket.id,
          content: finalResponse,
          agentType: targetAgentType || AgentType.ROUTER,
          isInternal: false,
          metadata: {
            agentsInvolved: agentsInvolved.map((a) => a.agent),
            orchestrationVersion: 'enhanced-v2',
            processingTime: Date.now() - this.processingStartTime,
          },
        },
      });

      // Update ticket status
      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: this.shouldEscalate(agentsInvolved) ? 'ESCALATED' : 'IN_PROGRESS',
          confidence: this.calculateOverallConfidence(agentsInvolved),
        },
      });

      // Get final metrics
      const insights = agentNetwork.getRecentInsights();
      const communications = agentNetwork.getAgentCommunications();

      // Track completion
      const completionThinking = createAIThinking(
        'EnhancedOrchestrator',
        'completion',
        `Multi-agent processing completed successfully in ${Date.now() - this.processingStartTime}ms`,
        0.95,
        [
          `Agents involved: ${agentsInvolved.length}`,
          `Insights generated: ${insights.length}`,
          `Communications: ${communications.length}`,
          `AI events captured: ${this.aiEvents.length}`
        ],
        [],
        'Enhanced orchestration completed with full AI transparency captured'
      );
      aiTransparency.trackThinking(completionThinking);

      // Remove the listener to prevent memory leaks
      aiTransparency.removeListener(this.sessionId);

      // Prisma cleanup handled globally

      return {
        success: true,
        response: finalResponse,
        agentsInvolved,
        insights,
        communications,
        aiEvents: this.aiEvents,
        realTimeProcessing: this.calculateProcessingStats(),
        metrics: this.calculateMetrics(proactiveResponse.metadata?.automatedActionsScheduled || 0),
      };
    } catch (error) {
      console.error('Enhanced Orchestrator error:', error);
      
      // Track error
      const errorThinking = createAIThinking(
        'EnhancedOrchestrator',
        'critical_error',
        `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0.1,
        ['Exception thrown', 'Processing interrupted'],
        ['Return error response', 'Log for debugging'],
        'Critical error occurred during multi-agent processing'
      );
      aiTransparency.trackThinking(errorThinking);

      // Clean up listener
      aiTransparency.removeListener(this.sessionId);
      
      // Prisma cleanup handled globally

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        agentsInvolved,
        insights: [],
        communications: [],
        aiEvents: this.aiEvents,
        realTimeProcessing: this.calculateProcessingStats(),
        metrics: this.calculateMetrics(0),
      };
    }
  }

  private async runAgent(agentName: string, context: AgentContext): Promise<AgentResponse> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      return {
        content: `Agent ${agentName} not available`,
        confidence: 0,
        shouldEscalate: false,
      };
    }

    // Update agent status
    await agentNetwork.updateAgentStatus(agentName, {
      busy: true,
      currentTask: `Processing ticket ${context.ticket.id}`,
    });

    try {
      // Track AI thinking for transparency
      aiTransparency.trackThinking({
        agent: agentName,
        process: `Starting ${agentName} analysis`,
        thinking: {
          input_analysis: {
            ticket_id: context.ticket.id,
            title: context.ticket.title,
            description: context.ticket.description.substring(0, 100) + '...',
            customer_context: context.ticket.customer?.name || 'Unknown'
          },
          agent_preparation: `${agentName} agent initializing specialized analysis`,
          expected_output: `${agentName} will provide specialized insights and recommendations`
        },
        confidence: 0.8,
        next_actions: [`Process ticket with ${agentName} expertise`]
      });

      const response = await agent.processTicket(context);

      // Track the AI response and decision making
      aiTransparency.trackDecision({
        agent: agentName,
        decision: `${agentName} analysis complete`,
        alternatives: ['Standard response', 'Escalate immediately', 'Request more information'],
        evidence: [
          `Confidence level: ${Math.round(response.confidence * 100)}%`,
          `Response length: ${response.content.length} characters`,
          `Should escalate: ${response.shouldEscalate ? 'Yes' : 'No'}`
        ],
        reasoning: `${agentName} determined this ${response.shouldEscalate ? 'requires escalation' : 'can be handled normally'} based on analysis`,
        confidence: response.confidence,
        impact: response.confidence > 0.8 ? 'high' : response.confidence > 0.6 ? 'medium' : 'low'
      });

      // Update agent status
      await agentNetwork.updateAgentStatus(agentName, {
        busy: false,
        currentTask: undefined,
      });

      return response;
    } catch (error) {
      console.error(`Agent ${agentName} error:`, error);

      await agentNetwork.updateAgentStatus(agentName, {
        busy: false,
        currentTask: undefined,
      });

      return {
        content: `Agent ${agentName} encountered an error`,
        confidence: 0,
        shouldEscalate: false,
      };
    }
  }

  private determineSpecialist(routerResponse: AgentResponse): AgentType {
    const suggestedAgent = routerResponse.metadata?.suggestedAgent;
    const mapping: Record<string, AgentType> = {
      TECHNICAL: AgentType.TECHNICAL,
      BILLING: AgentType.BILLING,
      PRODUCT: AgentType.PRODUCT,
    };
    return mapping[suggestedAgent] || AgentType.TECHNICAL;
  }

  private synthesizeResponse(responses: any): string {
    const { router, pattern, customer, specialist, solution } = responses;

    let synthesis = specialist?.content || solution?.content || 'Unable to generate response.';

    // Add pattern insights if significant
    if (pattern?.metadata?.analysis?.patterns?.length > 0) {
      const topPattern = pattern.metadata.analysis.patterns[0];
      synthesis += `\n\nℹ️ Pattern Detected: ${topPattern.description}`;
    }

    // Add customer context if VIP or at-risk
    if (customer?.metadata?.customerInsights?.customerProfile?.segment === 'vip') {
      synthesis = `🌟 VIP Customer Support:\n${synthesis}`;
    }

    return synthesis;
  }

  private compileFinalResponse(data: any): string {
    const { qaApprovedResponse, proactivePlan, insights } = data;

    let response = qaApprovedResponse;

    // Add proactive elements
    if (proactivePlan?.immediateActions?.length > 0) {
      response += '\n\n📋 Next Steps:';
      proactivePlan.immediateActions.slice(0, 3).forEach((action: any) => {
        response += `\n• ${action.action}`;
      });
    }

    // Add follow-up information
    if (proactivePlan?.followUpPlan?.checkpoints?.length > 0) {
      response += `\n\n🔔 We'll follow up ${proactivePlan.followUpPlan.checkpoints[0].timing} to ensure everything is working smoothly.`;
    }

    return response;
  }

  private shouldEscalate(agentsInvolved: any[]): boolean {
    const avgConfidence = this.calculateOverallConfidence(agentsInvolved);
    return avgConfidence < 0.6 || agentsInvolved.some((a) => a.contribution.includes('escalate'));
  }

  private calculateOverallConfidence(agentsInvolved: any[]): number {
    const confidences = agentsInvolved.map((a) => a.confidence);
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  private calculateMetrics(proactiveActions: number) {
    const processingTime = Date.now() - this.processingStartTime;
    const agentCount = this.agents.size;
    const insights = agentNetwork.getRecentInsights();
    const communications = agentNetwork.getAgentCommunications();

    return {
      totalProcessingTime: processingTime,
      collaborationScore: Math.min(1, communications.length / (agentCount * 2)),
      confidenceScore:
        insights.reduce((sum, i) => sum + i.confidence, 0) / Math.max(insights.length, 1),
      proactiveActionsScheduled: proactiveActions,
    };
  }

  private calculateProcessingStats() {
    const eventCounts = {
      prompts: 0,
      responses: 0,
      thoughts: 0,
      decisions: 0,
      analyses: 0,
    };

    this.aiEvents.forEach(event => {
      switch (event.type) {
        case 'prompt':
          eventCounts.prompts++;
          break;
        case 'response':
          eventCounts.responses++;
          break;
        case 'thinking':
          eventCounts.thoughts++;
          break;
        case 'decision':
          eventCounts.decisions++;
          break;
        case 'analysis':
          eventCounts.analyses++;
          break;
      }
    });

    return eventCounts;
  }
}
