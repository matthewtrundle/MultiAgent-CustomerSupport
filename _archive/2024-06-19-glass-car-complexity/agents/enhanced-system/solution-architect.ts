import { BaseAgent, AgentContext, AgentResponse } from '../base';
import { AgentType } from '@prisma/client';
import { z } from 'zod';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { agentNetwork } from './agent-network';
import { getOpenRouterModel } from '@/lib/ai/openrouter';
import { SOLUTION_ARCHITECT_PROMPT } from './agent-prompts';
import { ComprehensiveSolution } from './types';

const solutionDesignSchema = z.object({
  solutions: z.array(
    z.object({
      type: z.enum(['immediate', 'workaround', 'long_term', 'preventive']),
      name: z.string(),
      description: z.string(),
      steps: z.array(z.string()),
      complexity: z.enum(['simple', 'moderate', 'complex']),
      timeEstimate: z.string(),
      successRate: z.number(),
      prerequisites: z.array(z.string()),
      risks: z.array(z.string()),
    })
  ),
  rootCause: z.object({
    identified: z.boolean(),
    description: z.string(),
    category: z.enum([
      'bug',
      'configuration',
      'integration',
      'user_error',
      'design_limitation',
      'external',
    ]),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
  }),
  impactAnalysis: z.object({
    affectedSystems: z.array(z.string()),
    userImpact: z.string(),
    businessImpact: z.string(),
    scalePotential: z.enum(['isolated', 'limited', 'widespread']),
  }),
  alternativeApproaches: z.array(
    z.object({
      approach: z.string(),
      proscons: z.string(),
      recommendation: z.boolean(),
    })
  ),
  preventiveMeasures: z.array(
    z.object({
      measure: z.string(),
      implementation: z.string(),
      effectiveness: z.enum(['low', 'medium', 'high']),
    })
  ),
  documentation: z.object({
    internalNotes: z.string(),
    customerExplanation: z.string(),
    technicalDetails: z.string(),
  }),
});

type SolutionDesign = z.infer<typeof solutionDesignSchema>;

export class SolutionArchitectAgent extends BaseAgent {
  private parser: StructuredOutputParser<SolutionDesign>;
  name = 'Solution Architect';
  description =
    'Designs comprehensive multi-layered solutions with immediate, workaround, and long-term approaches';

  constructor() {
    super('Solution Architect', AgentType.TECHNICAL);
    this.parser = StructuredOutputParser.fromZodSchema(solutionDesignSchema);
  }

  getSystemPrompt(): string {
    return `${SOLUTION_ARCHITECT_PROMPT}

${this.parser.getFormatInstructions()}`;
  }

  async processTicket(context: AgentContext): Promise<AgentResponse> {
    try {
      // Gather technical context
      const technicalContext = await this.gatherTechnicalContext(context);
      const systemStatus = await this.checkSystemStatus();
      const knownIssues = await this.checkKnownIssues(context.ticket.description);

      // Consult with other agents for comprehensive solution
      await agentNetwork.sendMessage({
        fromAgent: this.name,
        toAgent: 'PatternAnalyst',
        messageType: 'query',
        content: 'Any patterns or historical solutions for this type of issue?',
        metadata: { ticketId: context.ticket.id },
      });

      const model = getOpenRouterModel(0.3);
      const messages = [
        { role: 'system' as const, content: this.getSystemPrompt() },
        {
          role: 'user' as const,
          content: `
Design comprehensive solutions for this issue:

Issue: ${context.ticket.title}
Description: ${context.ticket.description}
Category: ${context.ticket.category}
Priority: ${context.ticket.priority}

Customer Context:
- Technical Level: ${technicalContext.customerTechLevel}
- Integration Type: ${technicalContext.integrationType}
- Platform: ${technicalContext.platform}
- Account Type: ${technicalContext.accountType}

System Status:
- API Status: ${systemStatus.apiStatus}
- Known Issues: ${knownIssues.length > 0 ? knownIssues.join(', ') : 'None'}
- Recent Updates: ${systemStatus.recentUpdates}

Historical Context:
- Similar Issues Resolved: ${technicalContext.similarIssuesCount}
- Common Solutions: ${technicalContext.commonSolutions.join(', ')}

Please design comprehensive solutions with multiple approaches.`,
        },
      ];

      const response = await model.invoke(messages);
      const solutionDesign = await this.parser.parse(response.content as string);

      // Collaborate on complex solutions
      if (
        solutionDesign.rootCause.severity === 'critical' ||
        solutionDesign.impactAnalysis.scalePotential === 'widespread'
      ) {
        const decision = await agentNetwork.initiateCollaborativeDecision(
          this.name,
          `Critical issue resolution for ${context.ticket.title}`,
          ['PatternAnalyst', 'ProactiveAgent', 'ComplianceGuardian']
        );

        // Incorporate collaborative insights
        solutionDesign.documentation.internalNotes += `\n\nCollaborative Decision: ${decision.finalDecision}\nReasoning: ${decision.reasoning}`;
      }

      // Share architectural insights
      if (
        solutionDesign.rootCause.identified &&
        solutionDesign.rootCause.category === 'design_limitation'
      ) {
        await agentNetwork.broadcastInsight({
          agent: this.name,
          insightType: 'recommendation',
          content: `Design limitation identified: ${solutionDesign.rootCause.description}`,
          confidence: 0.9,
          evidence: solutionDesign.solutions.map((s) => s.name),
          impact: solutionDesign.rootCause.severity === 'critical' ? 'critical' : 'high',
        });
      }

      // Generate comprehensive solution response
      const solutionResponse = this.generateSolutionResponse(solutionDesign, context);

      // Record solution for future reference
      await this.recordSolutionPattern(context, solutionDesign);

      return {
        content: solutionResponse,
        confidence: this.calculateSolutionConfidence(solutionDesign),
        shouldEscalate: this.shouldEscalateBasedOnComplexity(solutionDesign),
        metadata: {
          solutionDesign,
          agentType: 'SolutionArchitect',
          collaborationRequired: solutionDesign.rootCause.severity === 'critical',
        },
      };
    } catch (error) {
      console.error('Solution Architect error:', error);
      return {
        content: 'Unable to design comprehensive solution. Escalating to engineering team.',
        confidence: 0.2,
        shouldEscalate: true,
      };
    }
  }

  private async gatherTechnicalContext(context: AgentContext) {
    // Analyze ticket for technical indicators
    const description = context.ticket.description.toLowerCase();

    const techIndicators = {
      api: description.includes('api') || description.includes('webhook'),
      calendar:
        description.includes('calendar') ||
        description.includes('ical') ||
        description.includes('sync'),
      payment:
        description.includes('payment') ||
        description.includes('payout') ||
        description.includes('refund'),
      integration:
        description.includes('integration') ||
        description.includes('channel') ||
        description.includes('pms'),
    };

    const integrationType =
      Object.entries(techIndicators)
        .filter(([_, value]) => value)
        .map(([key]) => key)[0] || 'general';

    return {
      customerTechLevel: this.assessTechLevel(description),
      integrationType,
      platform: this.detectPlatform(description),
      accountType: 'professional', // Would determine from customer data
      similarIssuesCount: Math.floor(Math.random() * 20) + 5,
      commonSolutions: ['API key regeneration', 'Cache clearing', 'Sync reset'],
    };
  }

  private assessTechLevel(description: string): string {
    const techTerms = ['api', 'webhook', 'endpoint', 'json', 'xml', 'oauth', 'token', 'payload'];
    const techTermCount = techTerms.filter((term) =>
      description.toLowerCase().includes(term)
    ).length;

    if (techTermCount >= 3) return 'advanced';
    if (techTermCount >= 1) return 'intermediate';
    return 'beginner';
  }

  private detectPlatform(description: string): string {
    const platforms = ['airbnb', 'vrbo', 'booking.com', 'guesty', 'hostfully', 'your porter'];
    const detected = platforms.find((p) => description.toLowerCase().includes(p));
    return detected || 'native';
  }

  private async checkSystemStatus() {
    // In production, would check actual system status
    return {
      apiStatus: 'operational',
      recentUpdates: 'Calendar API v2.1 released 3 days ago',
      knownIncidents: [],
    };
  }

  private async checkKnownIssues(description: string): Promise<string[]> {
    // In production, would check against known issues database
    const knownIssues = [];

    if (
      description.toLowerCase().includes('calendar') &&
      description.toLowerCase().includes('sync')
    ) {
      knownIssues.push('Known iCal refresh delays with some providers');
    }

    return knownIssues;
  }

  private generateSolutionResponse(design: SolutionDesign, context: AgentContext): string {
    const immediateSolution = design.solutions.find((s) => s.type === 'immediate');
    const workaround = design.solutions.find((s) => s.type === 'workaround');
    const longTermSolution = design.solutions.find((s) => s.type === 'long_term');

    let response = `Solution Architecture Analysis:

🔍 Root Cause Analysis:
${
  design.rootCause.identified
    ? `• Identified: ${design.rootCause.description}
• Category: ${design.rootCause.category}
• Severity: ${design.rootCause.severity}`
    : '• Root cause requires further investigation'
}

📊 Impact Assessment:
• User Impact: ${design.impactAnalysis.userImpact}
• Business Impact: ${design.impactAnalysis.businessImpact}
• Scale Potential: ${design.impactAnalysis.scalePotential}
• Affected Systems: ${design.impactAnalysis.affectedSystems.join(', ')}

`;

    if (immediateSolution) {
      response += `
⚡ Immediate Solution: ${immediateSolution.name}
${immediateSolution.description}

Steps:
${immediateSolution.steps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

• Time Estimate: ${immediateSolution.timeEstimate}
• Success Rate: ${Math.round(immediateSolution.successRate * 100)}%
${immediateSolution.prerequisites.length > 0 ? `• Prerequisites: ${immediateSolution.prerequisites.join(', ')}` : ''}
`;
    }

    if (workaround) {
      response += `
🔧 Alternative Workaround: ${workaround.name}
${workaround.description}

This approach takes ${workaround.timeEstimate} with ${Math.round(workaround.successRate * 100)}% success rate.
`;
    }

    if (longTermSolution) {
      response += `
🎯 Long-term Solution: ${longTermSolution.name}
${longTermSolution.description}

Benefits:
• Permanent resolution
• Improved performance
• Future-proof design
`;
    }

    if (design.preventiveMeasures.length > 0) {
      response += `
🛡️ Preventive Measures:
${design.preventiveMeasures.map((m) => `• ${m.measure} - ${m.implementation}`).join('\n')}
`;
    }

    response += `
📝 Technical Summary:
${design.documentation.customerExplanation}`;

    return response;
  }

  private calculateSolutionConfidence(design: SolutionDesign): number {
    let confidence = 0.5;

    if (design.rootCause.identified) confidence += 0.2;
    if (design.solutions.length > 0) confidence += 0.1 * Math.min(design.solutions.length, 3);

    const avgSuccessRate =
      design.solutions.reduce((sum, s) => sum + s.successRate, 0) / design.solutions.length;
    confidence += avgSuccessRate * 0.2;

    return Math.min(confidence, 0.95);
  }

  private shouldEscalateBasedOnComplexity(design: SolutionDesign): boolean {
    const hasComplexSolution = design.solutions.some((s) => s.complexity === 'complex');
    const criticalSeverity = design.rootCause.severity === 'critical';
    const widespreadImpact = design.impactAnalysis.scalePotential === 'widespread';

    return hasComplexSolution || criticalSeverity || widespreadImpact;
  }

  private async recordSolutionPattern(context: AgentContext, design: SolutionDesign) {
    const bestSolution = design.solutions.sort((a, b) => b.successRate - a.successRate)[0];

    if (bestSolution) {
      await agentNetwork.recordMemory({
        ticketId: context.ticket.id,
        customerId: context.ticket.customerId,
        issue: context.ticket.title,
        solution: `${bestSolution.name}: ${bestSolution.steps.join(' → ')}`,
        outcome: 'pending',
        learnings: [
          `Root cause: ${design.rootCause.description}`,
          `Solution type: ${bestSolution.type}`,
          `Success rate: ${bestSolution.successRate}`,
        ],
        successMetrics: {
          resolutionTime: 0,
          customerSatisfaction: undefined,
          effortScore: undefined,
        },
      });
    }
  }
}
