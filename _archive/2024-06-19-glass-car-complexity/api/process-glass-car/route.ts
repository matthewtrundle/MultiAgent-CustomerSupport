import { NextRequest, NextResponse } from 'next/server';
import { EnhancedAITransparencyTracker } from '@/lib/ai/enhanced-transparency';
import { thoughtStreamer } from '@/lib/ai/thought-streaming';
import { debateProtocol } from '@/lib/agents/debate-protocol';
import { consensusBuilder } from '@/lib/agents/consensus-builder';
import { getAgentPersonality } from '@/lib/ai/agent-personalities';

export const runtime = 'nodejs';

// Mock agent responses for demo
const mockAgentResponses = {
  router: {
    analysis: "Critical calendar sync issue affecting VIP customer with 15 properties. This requires immediate multi-agent collaboration.",
    confidence: 0.95,
    routing: ['pattern_analyst', 'customer_insight', 'solution_architect', 'proactive_specialist']
  },
  pattern_analyst: {
    pattern: "47 similar calendar sync issues in the past week, all after v2.1 update",
    confidence: 0.88,
    severity: "widespread"
  },
  customer_insight: {
    impact: "$125K annual revenue, 3 years tenure, 98% satisfaction rate",
    confidence: 0.92,
    priority: "critical"
  },
  solution_architect: {
    options: [
      { name: "Targeted Hotfix", risk: "low", speed: "fast", impact: "minimal" },
      { name: "Full Rollback", risk: "medium", speed: "immediate", impact: "high" },
      { name: "Complete Fix", risk: "low", speed: "slow", impact: "none" }
    ],
    recommendation: "Targeted Hotfix",
    confidence: 0.91
  },
  proactive_specialist: {
    concerns: "Rolling back would affect 3,000 users who rely on new features",
    suggestion: "Isolate the fix to calendar sync module only",
    confidence: 0.85
  }
};

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const tracker = EnhancedAITransparencyTracker.getEnhancedInstance();
    
    // Start response stream
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Process in background
    processTicket(title, description, tracker, writer, encoder);

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in glass car demo:', error);
    return NextResponse.json(
      { error: 'Failed to process ticket' },
      { status: 500 }
    );
  }
}

async function processTicket(
  title: string,
  description: string,
  tracker: EnhancedAITransparencyTracker,
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder
) {
  let writerClosed = false;
  let routerStream: string | undefined;
  let patternStream: string | undefined;
  let customerStream: string | undefined;
  
  const safeWrite = async (data: any) => {
    if (!writerClosed) {
      try {
        await sendEvent(writer, encoder, data);
      } catch (error) {
        console.error('Error writing to stream:', error);
        writerClosed = true;
      }
    }
  };

  try {
    // Phase 1: Router Analysis
    await safeWrite({
      phase: 'router_analysis',
      agent: 'router',
      type: 'thinking',
      content: 'Analyzing ticket severity and routing requirements...'
    });

    routerStream = thoughtStreamer.startStream('router');
    thoughtStreamer.addThought(routerStream, 'Processing ticket: ' + title, 'initial');
    thoughtStreamer.addThought(routerStream, 'This looks critical - VIP customer affected', 'insight', 0.95);
    
    tracker.trackReasoning(
      'router',
      'How should we handle this ticket?',
      [
        {
          hypothesis: 'This is a critical system-wide issue',
          evidence_for: ['VIP customer', '15 properties affected', 'Revenue impact'],
          evidence_against: [],
          probability: 0.95
        }
      ],
      mockAgentResponses.router.analysis,
      mockAgentResponses.router.confidence
    );

    await sleep(1000);

    // Phase 2: Pattern Analysis
    await safeWrite({
      phase: 'pattern_analysis',
      agent: 'pattern_analyst',
      type: 'thinking',
      content: 'Searching for similar issues in recent tickets...'
    });

    patternStream = thoughtStreamer.startStream('pattern_analyst');
    thoughtStreamer.addThought(patternStream, 'Scanning historical data...', 'processing');
    thoughtStreamer.addThought(patternStream, mockAgentResponses.pattern_analyst.pattern, 'insight', 0.88);

    tracker.trackLearning(
      'pattern_analyst',
      'Multiple calendar sync failures detected',
      'System-wide issue after v2.1 deployment',
      'Need to implement better deployment testing',
      'immediate'
    );

    await sleep(1500);

    // Phase 3: Customer Impact Analysis
    await safeWrite({
      phase: 'customer_analysis',
      agent: 'customer_insight',
      type: 'thinking',
      content: 'Analyzing customer impact and sentiment...'
    });

    customerStream = thoughtStreamer.startStream('customer_insight');
    thoughtStreamer.addThought(customerStream, 'Retrieving customer profile...', 'processing');
    thoughtStreamer.addThought(customerStream, mockAgentResponses.customer_insight.impact, 'insight', 0.92);

    await sleep(1000);

    // Phase 4: Solution Debate
    await safeWrite({
      phase: 'solution_debate',
      agent: 'orchestrator',
      type: 'collaboration',
      content: 'Initiating solution debate between agents...'
    });

    // Simulate debate
    const debateParticipants = [
      {
        name: 'solution_architect',
        type: 'solution_architect',
        statePosition: async (topic: string) => ({
          agent: 'solution_architect',
          stance: 'Deploy targeted hotfix for calendar sync',
          arguments: ['Minimal risk', 'Quick deployment', 'Preserves new features'],
          confidence: 0.91
        }),
        respondToPositions: async (positions: any[], round: number) => ({
          agent: 'solution_architect',
          stance: 'Targeted hotfix remains best option',
          arguments: ['Can be deployed in 30 minutes', 'Tested approach', 'Low risk'],
          confidence: 0.91
        }),
        evaluateConsensus: async (positions: any[]) => ({
          agrees: true,
          reason: 'Team consensus on targeted approach'
        })
      },
      {
        name: 'proactive_specialist',
        type: 'proactive_specialist',
        statePosition: async (topic: string) => ({
          agent: 'proactive_specialist',
          stance: 'Ensure we don\'t break existing features',
          arguments: mockAgentResponses.proactive_specialist.concerns.split(','),
          confidence: 0.85
        }),
        respondToPositions: async (positions: any[], round: number) => ({
          agent: 'proactive_specialist',
          stance: 'Agree with targeted approach if properly isolated',
          arguments: ['Protects existing users', 'Maintains stability'],
          confidence: 0.87
        }),
        evaluateConsensus: async (positions: any[]) => ({
          agrees: true,
          reason: 'Targeted fix addresses concerns'
        })
      }
    ];

    const debateOutcome = await debateProtocol.initiateDebate(
      'How to fix calendar sync issue',
      debateParticipants
    );

    await safeWrite({
      phase: 'debate_complete',
      agent: 'orchestrator',
      type: 'decision',
      content: `Consensus reached: ${debateOutcome.consensus || 'Deploy targeted hotfix'}`,
      confidence: debateOutcome.confidence
    });

    await sleep(2000);

    // Phase 5: Decision and Solution
    tracker.trackDecisionWithAlternatives(
      'solution_architect',
      'Deploy targeted hotfix for calendar sync',
      [
        {
          option: 'Targeted Hotfix',
          pros: ['Minimal risk', 'Quick deployment', 'Preserves new features'],
          cons: ['Doesn\'t address root cause', 'May need follow-up'],
          confidence: 0.91,
          selected: true
        },
        {
          option: 'Full Rollback',
          pros: ['Guaranteed to work', 'Immediate relief'],
          cons: ['Loses new features', 'Affects 3000 users'],
          confidence: 0.65,
          selected: false
        }
      ],
      'Balancing immediate customer needs with system stability'
    );

    // Final response
    const solution = {
      summary: 'Immediate hotfix deployment for calendar sync issue',
      steps: [
        'Deploy calendar sync patch (ETA: 30 minutes)',
        'Manually sync affected properties',
        'Provide compensation for any losses',
        'Set up monitoring for similar issues',
        'Schedule comprehensive fix for next sprint'
      ],
      impact: {
        user: 'Minimal - only affects calendar sync module',
        business: 'Positive - quick resolution for VIP customer',
        technical: 'Low risk - isolated change'
      },
      confidence: 0.91
    };

    await safeWrite({
      phase: 'complete',
      type: 'solution',
      solution
    });

    // Complete all thought streams if they exist
    if (routerStream) {
      thoughtStreamer.completeStream(routerStream, 'Successfully routed to specialist team');
    }
    if (patternStream) {
      thoughtStreamer.completeStream(patternStream, 'Pattern identified and documented');
    }
    if (customerStream) {
      thoughtStreamer.completeStream(customerStream, 'Customer priority established');
    }

  } catch (error) {
    console.error('Error processing ticket:', error);
    await safeWrite({
      phase: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    if (!writerClosed) {
      try {
        await writer.close();
      } catch (error) {
        // Stream already closed
      }
    }
  }
}

async function sendEvent(
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder,
  data: any
) {
  const event = `data: ${JSON.stringify(data)}\n\n`;
  await writer.write(encoder.encode(event));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}