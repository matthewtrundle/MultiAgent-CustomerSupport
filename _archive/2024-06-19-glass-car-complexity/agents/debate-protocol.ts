import { EnhancedAITransparencyTracker } from '@/lib/ai/enhanced-transparency';
import { getAgentName, getThinkingPhrase } from '@/lib/ai/agent-personalities';

export interface DebatePosition {
  agent: string;
  stance: string;
  arguments: string[];
  confidence: number;
  evidence?: string[];
}

export interface DebateRound {
  round: number;
  positions: DebatePosition[];
  timestamp: Date;
}

export interface DebateOutcome {
  topic: string;
  participants: string[];
  rounds: DebateRound[];
  consensus?: string;
  dissent?: string[];
  decisionPath: string;
  confidence: number;
}

export interface AgentDebater {
  name: string;
  type: string;
  statePosition(topic: string): Promise<DebatePosition>;
  respondToPositions(positions: DebatePosition[], round: number): Promise<DebatePosition>;
  evaluateConsensus(positions: DebatePosition[]): Promise<{ agrees: boolean; reason: string }>;
}

export class DebateProtocol {
  private tracker: EnhancedAITransparencyTracker;
  private maxRounds: number = 3;
  private consensusThreshold: number = 0.75;

  constructor() {
    this.tracker = EnhancedAITransparencyTracker.getEnhancedInstance();
  }

  /**
   * Initiate a structured debate between agents
   */
  async initiateDebate(
    topic: string,
    participants: AgentDebater[],
    context?: Record<string, any>
  ): Promise<DebateOutcome> {
    // Track debate initiation
    this.tracker.trackThinking(
      'orchestrator',
      `Initiating debate on: ${topic}`,
      0.9,
      [`Participants: ${participants.map(p => getAgentName(p.type)).join(', ')}`],
      ['Gather initial positions', 'Facilitate rounds', 'Seek consensus']
    );

    const rounds: DebateRound[] = [];
    let currentPositions: DebatePosition[] = [];

    // Round 1: Initial positions
    const initialPositions = await this.gatherInitialPositions(topic, participants);
    rounds.push({
      round: 1,
      positions: initialPositions,
      timestamp: new Date()
    });
    currentPositions = initialPositions;

    // Track initial positions
    this.tracker.trackDebate(
      participants.map(p => p.name),
      topic,
      initialPositions,
      undefined,
      undefined
    );

    // Subsequent rounds
    for (let round = 2; round <= this.maxRounds; round++) {
      const roundPositions = await this.conductDebateRound(
        participants,
        currentPositions,
        round
      );

      rounds.push({
        round,
        positions: roundPositions,
        timestamp: new Date()
      });
      currentPositions = roundPositions;

      // Check for early consensus
      const earlyConsensus = await this.checkEarlyConsensus(participants, currentPositions);
      if (earlyConsensus) {
        return this.finalizeDebate(topic, participants, rounds, earlyConsensus);
      }
    }

    // Final consensus seeking
    const finalConsensus = await this.seekFinalConsensus(participants, currentPositions);
    return this.finalizeDebate(topic, participants, rounds, finalConsensus);
  }

  /**
   * Gather initial positions from all participants
   */
  private async gatherInitialPositions(
    topic: string,
    participants: AgentDebater[]
  ): Promise<DebatePosition[]> {
    this.tracker.trackThinking(
      'orchestrator',
      'Gathering initial positions from all agents...',
      0.85,
      [],
      participants.map(p => `Get position from ${getAgentName(p.type)}`)
    );

    const positions = await Promise.all(
      participants.map(async (participant) => {
        const position = await participant.statePosition(topic);
        
        // Track individual agent's position
        this.tracker.trackThinking(
          participant.name,
          `My position on ${topic}: ${position.stance}`,
          position.confidence,
          position.evidence || [],
          ['Support with arguments', 'Consider alternatives']
        );

        return position;
      })
    );

    return positions;
  }

  /**
   * Conduct a single debate round
   */
  private async conductDebateRound(
    participants: AgentDebater[],
    previousPositions: DebatePosition[],
    roundNumber: number
  ): Promise<DebatePosition[]> {
    this.tracker.trackThinking(
      'orchestrator',
      `Conducting debate round ${roundNumber}...`,
      0.85,
      [`Previous positions: ${previousPositions.length}`],
      ['Share positions', 'Gather responses', 'Track evolution']
    );

    const newPositions = await Promise.all(
      participants.map(async (participant) => {
        const response = await participant.respondToPositions(previousPositions, roundNumber);
        
        // Track response
        this.tracker.trackThinking(
          participant.name,
          `Round ${roundNumber} response: ${response.stance}`,
          response.confidence,
          response.arguments,
          ['Consider others views', 'Refine position']
        );

        // Track if position changed
        const previousPosition = previousPositions.find(p => p.agent === participant.name);
        if (previousPosition && previousPosition.stance !== response.stance) {
          this.tracker.trackLearning(
            participant.name,
            `Changed position from "${previousPosition.stance}" to "${response.stance}"`,
            'Perspective evolution through debate',
            'Refined understanding based on team input',
            'immediate'
          );
        }

        return response;
      })
    );

    // Track round completion
    this.tracker.trackCollaboration(
      'orchestrator',
      participants.map(p => p.name),
      `Debate round ${roundNumber}`,
      newPositions.map(pos => ({
        agent: pos.agent,
        contribution: pos.stance,
        impact: pos.confidence > 0.8 ? 'critical' : pos.confidence > 0.5 ? 'helpful' : 'minor'
      })),
      `Round ${roundNumber} completed with ${newPositions.length} positions`
    );

    return newPositions;
  }

  /**
   * Check if early consensus has been reached
   */
  private async checkEarlyConsensus(
    participants: AgentDebater[],
    positions: DebatePosition[]
  ): Promise<{ consensus?: string; dissent?: string[] } | null> {
    // Group positions by stance
    const stanceGroups = this.groupPositionsByStance(positions);
    
    // Check if overwhelming agreement
    const largestGroup = Math.max(...Object.values(stanceGroups).map(g => g.length));
    const consensusRatio = largestGroup / participants.length;

    if (consensusRatio >= this.consensusThreshold) {
      const consensusStance = Object.entries(stanceGroups)
        .find(([_, group]) => group.length === largestGroup)?.[0];

      if (consensusStance) {
        const dissent = positions
          .filter(p => p.stance !== consensusStance)
          .map(p => `${getAgentName(p.agent)}: ${p.stance}`);

        this.tracker.trackThinking(
          'orchestrator',
          `Early consensus detected: ${consensusStance}`,
          consensusRatio,
          [`Agreement ratio: ${(consensusRatio * 100).toFixed(0)}%`],
          ['Finalize debate', 'Document consensus']
        );

        return { consensus: consensusStance, dissent };
      }
    }

    return null;
  }

  /**
   * Seek final consensus after all rounds
   */
  private async seekFinalConsensus(
    participants: AgentDebater[],
    finalPositions: DebatePosition[]
  ): Promise<{ consensus?: string; dissent?: string[] }> {
    this.tracker.trackThinking(
      'orchestrator',
      'Seeking final consensus among participants...',
      0.8,
      [],
      ['Evaluate positions', 'Find common ground', 'Document dissent']
    );

    // Ask each participant to evaluate consensus
    const evaluations = await Promise.all(
      participants.map(async (participant) => {
        const evaluation = await participant.evaluateConsensus(finalPositions);
        return { participant: participant.name, ...evaluation };
      })
    );

    // Determine consensus based on evaluations
    const agreements = evaluations.filter(e => e.agrees);
    const consensusReached = agreements.length / participants.length >= this.consensusThreshold;

    if (consensusReached) {
      // Find the most common stance among final positions
      const stanceGroups = this.groupPositionsByStance(finalPositions);
      const consensusStance = Object.entries(stanceGroups)
        .sort(([_, a], [__, b]) => b.length - a.length)[0][0];

      const dissent = evaluations
        .filter(e => !e.agrees)
        .map(e => `${getAgentName(e.participant)}: ${e.reason}`);

      return { consensus: consensusStance, dissent };
    }

    // No consensus - document all positions
    const dissent = finalPositions.map(p => `${getAgentName(p.agent)}: ${p.stance}`);
    return { consensus: undefined, dissent };
  }

  /**
   * Finalize debate and create outcome
   */
  private finalizeDebate(
    topic: string,
    participants: AgentDebater[],
    rounds: DebateRound[],
    consensusResult: { consensus?: string; dissent?: string[] }
  ): DebateOutcome {
    const finalPositions = rounds[rounds.length - 1].positions;
    const avgConfidence = finalPositions.reduce((sum, p) => sum + p.confidence, 0) / finalPositions.length;

    // Track final debate outcome
    this.tracker.trackDebate(
      participants.map(p => p.name),
      topic,
      finalPositions,
      consensusResult.consensus,
      consensusResult.dissent
    );

    const outcome: DebateOutcome = {
      topic,
      participants: participants.map(p => p.name),
      rounds,
      consensus: consensusResult.consensus,
      dissent: consensusResult.dissent,
      decisionPath: consensusResult.consensus || 'No consensus reached',
      confidence: avgConfidence
    };

    // Track conclusion
    this.tracker.trackThinking(
      'orchestrator',
      `Debate concluded: ${outcome.decisionPath}`,
      outcome.confidence,
      [
        `Rounds: ${rounds.length}`,
        `Consensus: ${outcome.consensus ? 'Yes' : 'No'}`,
        `Average confidence: ${(avgConfidence * 100).toFixed(0)}%`
      ],
      ['Apply decision', 'Monitor outcomes']
    );

    return outcome;
  }

  /**
   * Helper to group positions by stance
   */
  private groupPositionsByStance(positions: DebatePosition[]): Record<string, DebatePosition[]> {
    return positions.reduce((groups, position) => {
      const key = position.stance;
      if (!groups[key]) groups[key] = [];
      groups[key].push(position);
      return groups;
    }, {} as Record<string, DebatePosition[]>);
  }
}

// Singleton instance
export const debateProtocol = new DebateProtocol();