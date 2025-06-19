import { EnhancedAITransparencyTracker } from '@/lib/ai/enhanced-transparency';
import { DebatePosition } from './debate-protocol';

export interface ConsensusOption {
  id: string;
  description: string;
  supportingAgents: string[];
  opposingAgents: string[];
  evidence: string[];
  risks: string[];
  benefits: string[];
  confidence: number;
}

export interface ConsensusResult {
  reached: boolean;
  option?: ConsensusOption;
  reasoning: string;
  alternativeOptions: ConsensusOption[];
  dissentReasons: string[];
  confidenceLevel: number;
}

export class ConsensusBuilder {
  private tracker: EnhancedAITransparencyTracker;
  private minimumSupport: number = 0.66; // 2/3 majority

  constructor() {
    this.tracker = EnhancedAITransparencyTracker.getEnhancedInstance();
  }

  /**
   * Build consensus from multiple agent positions
   */
  async buildConsensus(
    topic: string,
    positions: DebatePosition[],
    context?: Record<string, any>
  ): Promise<ConsensusResult> {
    this.tracker.trackThinking(
      'consensus_builder',
      `Building consensus for: ${topic}`,
      0.85,
      [`Positions to reconcile: ${positions.length}`],
      ['Analyze positions', 'Find common ground', 'Evaluate options']
    );

    // Extract and analyze options
    const options = this.extractConsensusOptions(positions);
    
    // Evaluate each option
    const evaluatedOptions = await this.evaluateOptions(options, positions);
    
    // Find best consensus option
    const bestOption = this.findBestOption(evaluatedOptions);
    
    // Build final result
    return this.createConsensusResult(bestOption, evaluatedOptions, positions);
  }

  /**
   * Extract potential consensus options from positions
   */
  private extractConsensusOptions(positions: DebatePosition[]): ConsensusOption[] {
    const optionMap = new Map<string, ConsensusOption>();

    positions.forEach(position => {
      const key = this.normalizeStance(position.stance);
      
      if (!optionMap.has(key)) {
        optionMap.set(key, {
          id: `option_${optionMap.size + 1}`,
          description: position.stance,
          supportingAgents: [],
          opposingAgents: [],
          evidence: [],
          risks: [],
          benefits: [],
          confidence: 0
        });
      }

      const option = optionMap.get(key)!;
      option.supportingAgents.push(position.agent);
      option.evidence.push(...(position.evidence || []));
      option.confidence = Math.max(option.confidence, position.confidence);
    });

    // Add opposing agents
    optionMap.forEach((option, key) => {
      positions.forEach(position => {
        if (this.normalizeStance(position.stance) !== key) {
          option.opposingAgents.push(position.agent);
        }
      });
    });

    return Array.from(optionMap.values());
  }

  /**
   * Evaluate consensus options
   */
  private async evaluateOptions(
    options: ConsensusOption[],
    positions: DebatePosition[]
  ): Promise<ConsensusOption[]> {
    return Promise.all(options.map(async option => {
      // Extract benefits and risks from arguments
      const supportingPositions = positions.filter(p => 
        option.supportingAgents.includes(p.agent)
      );

      supportingPositions.forEach(pos => {
        pos.arguments.forEach(arg => {
          if (arg.toLowerCase().includes('benefit') || 
              arg.toLowerCase().includes('advantage') ||
              arg.toLowerCase().includes('improve')) {
            option.benefits.push(arg);
          } else if (arg.toLowerCase().includes('risk') || 
                     arg.toLowerCase().includes('concern') ||
                     arg.toLowerCase().includes('issue')) {
            option.risks.push(arg);
          }
        });
      });

      // Calculate weighted confidence
      const totalAgents = option.supportingAgents.length + option.opposingAgents.length;
      const supportRatio = option.supportingAgents.length / totalAgents;
      option.confidence = option.confidence * supportRatio;

      // Track evaluation
      this.tracker.trackAnalysis(
        'consensus_builder',
        'consensus',
        option.description,
        {
          support_ratio: supportRatio,
          benefits_count: option.benefits.length,
          risks_count: option.risks.length
        },
        'Option viability analysis',
        option.confidence,
        positions.length,
        [`Support: ${(supportRatio * 100).toFixed(0)}%`, `Confidence: ${(option.confidence * 100).toFixed(0)}%`]
      );

      return option;
    }));
  }

  /**
   * Find the best consensus option
   */
  private findBestOption(options: ConsensusOption[]): ConsensusOption | undefined {
    // Sort by support ratio and confidence
    const sortedOptions = options.sort((a, b) => {
      const aSupportRatio = a.supportingAgents.length / (a.supportingAgents.length + a.opposingAgents.length);
      const bSupportRatio = b.supportingAgents.length / (b.supportingAgents.length + b.opposingAgents.length);
      
      // First by support ratio, then by confidence
      if (aSupportRatio !== bSupportRatio) {
        return bSupportRatio - aSupportRatio;
      }
      return b.confidence - a.confidence;
    });

    // Check if top option meets minimum support
    const topOption = sortedOptions[0];
    if (topOption) {
      const supportRatio = topOption.supportingAgents.length / 
        (topOption.supportingAgents.length + topOption.opposingAgents.length);
      
      if (supportRatio >= this.minimumSupport) {
        return topOption;
      }
    }

    return undefined;
  }

  /**
   * Create final consensus result
   */
  private createConsensusResult(
    bestOption: ConsensusOption | undefined,
    allOptions: ConsensusOption[],
    positions: DebatePosition[]
  ): ConsensusResult {
    if (bestOption) {
      const supportRatio = bestOption.supportingAgents.length / 
        (bestOption.supportingAgents.length + bestOption.opposingAgents.length);

      // Track successful consensus
      this.tracker.trackDecision(
        'consensus_builder',
        `Consensus reached: ${bestOption.description}`,
        `${(supportRatio * 100).toFixed(0)}% support with ${bestOption.benefits.length} identified benefits`,
        allOptions.filter(o => o !== bestOption).map(o => o.description),
        bestOption.confidence,
        bestOption.evidence,
        supportRatio > 0.8 ? 'high' : supportRatio > 0.7 ? 'medium' : 'low'
      );

      return {
        reached: true,
        option: bestOption,
        reasoning: this.generateConsensusReasoning(bestOption, supportRatio),
        alternativeOptions: allOptions.filter(o => o !== bestOption),
        dissentReasons: this.extractDissentReasons(bestOption, positions),
        confidenceLevel: bestOption.confidence
      };
    }

    // No consensus reached
    this.tracker.trackThinking(
      'consensus_builder',
      'Unable to reach consensus - positions too divergent',
      0.3,
      [`Options evaluated: ${allOptions.length}`, 'No option met minimum support threshold'],
      ['Document all positions', 'Identify blockers', 'Suggest compromise']
    );

    return {
      reached: false,
      reasoning: 'No option achieved the required support threshold for consensus',
      alternativeOptions: allOptions,
      dissentReasons: this.extractAllDissentReasons(positions),
      confidenceLevel: 0.3
    };
  }

  /**
   * Generate reasoning for consensus
   */
  private generateConsensusReasoning(option: ConsensusOption, supportRatio: number): string {
    const benefits = option.benefits.slice(0, 3).join('; ');
    const risks = option.risks.length > 0 ? 
      ` Key considerations: ${option.risks.slice(0, 2).join('; ')}.` : '';
    
    return `This option received ${(supportRatio * 100).toFixed(0)}% support from the team. ` +
           `Key benefits: ${benefits}.${risks} ` +
           `Supported by: ${option.supportingAgents.join(', ')}.`;
  }

  /**
   * Extract dissent reasons for a specific option
   */
  private extractDissentReasons(option: ConsensusOption, positions: DebatePosition[]): string[] {
    const dissentReasons: string[] = [];
    
    option.opposingAgents.forEach(agent => {
      const agentPosition = positions.find(p => p.agent === agent);
      if (agentPosition) {
        dissentReasons.push(`${agent}: Prefers "${agentPosition.stance}" due to ${agentPosition.arguments[0] || 'unspecified reasons'}`);
      }
    });

    return dissentReasons;
  }

  /**
   * Extract all dissent reasons when no consensus
   */
  private extractAllDissentReasons(positions: DebatePosition[]): string[] {
    return positions.map(pos => 
      `${pos.agent}: ${pos.stance} (confidence: ${(pos.confidence * 100).toFixed(0)}%)`
    );
  }

  /**
   * Normalize stance for comparison
   */
  private normalizeStance(stance: string): string {
    return stance.toLowerCase().trim().replace(/[^\w\s]/g, '');
  }

  /**
   * Attempt to find compromise between positions
   */
  async findCompromise(
    positions: DebatePosition[],
    constraints?: string[]
  ): Promise<ConsensusOption> {
    this.tracker.trackThinking(
      'consensus_builder',
      'Searching for compromise solution...',
      0.7,
      [`Positions: ${positions.length}`, `Constraints: ${constraints?.length || 0}`],
      ['Identify common elements', 'Merge compatible ideas', 'Create hybrid solution']
    );

    // Find common elements across positions
    const commonElements = this.findCommonElements(positions);
    
    // Create compromise option
    const compromise: ConsensusOption = {
      id: 'compromise_option',
      description: `Hybrid approach combining: ${commonElements.join(', ')}`,
      supportingAgents: positions.map(p => p.agent),
      opposingAgents: [],
      evidence: positions.flatMap(p => p.evidence || []),
      risks: constraints || [],
      benefits: commonElements,
      confidence: 0.6 // Moderate confidence for compromises
    };

    this.tracker.trackCollaboration(
      'consensus_builder',
      positions.map(p => p.agent),
      'Compromise building',
      positions.map(p => ({
        agent: p.agent,
        contribution: p.stance,
        impact: 'helpful' as const
      })),
      compromise.description
    );

    return compromise;
  }

  /**
   * Find common elements across positions
   */
  private findCommonElements(positions: DebatePosition[]): string[] {
    const allArguments = positions.flatMap(p => p.arguments);
    const commonElements: string[] = [];

    // Find arguments that appear in multiple positions
    const argumentCounts = new Map<string, number>();
    allArguments.forEach(arg => {
      const key = arg.toLowerCase();
      argumentCounts.set(key, (argumentCounts.get(key) || 0) + 1);
    });

    argumentCounts.forEach((count, arg) => {
      if (count > 1) {
        commonElements.push(arg);
      }
    });

    return commonElements.slice(0, 5); // Top 5 common elements
  }
}

// Singleton instance
export const consensusBuilder = new ConsensusBuilder();