import { BaseAgent, AgentContext, AgentResponse } from '../base';
import { AgentType } from '@prisma/client';
import { z } from 'zod';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { agentNetwork } from './agent-network';
import { getOpenRouterModel } from '@/lib/ai/openrouter';
import { PROACTIVE_AGENT_PROMPT } from './agent-prompts';

const proactiveActionSchema = z.object({
  immediateActions: z.array(
    z.object({
      action: z.string(),
      type: z.enum(['notification', 'automation', 'education', 'monitoring']),
      timing: z.string(),
      automationPossible: z.boolean(),
      expectedOutcome: z.string(),
    })
  ),
  followUpPlan: z.object({
    checkpoints: z.array(
      z.object({
        timing: z.string(),
        action: z.string(),
        successCriteria: z.string(),
        escalationTrigger: z.string(),
      })
    ),
    totalDuration: z.string(),
    automatedReminders: z.boolean(),
  }),
  preventiveRecommendations: z.array(
    z.object({
      recommendation: z.string(),
      category: z.enum(['process', 'technical', 'educational', 'policy']),
      implementation: z.string(),
      preventionRate: z.number(),
      effortLevel: z.enum(['low', 'medium', 'high']),
    })
  ),
  customerEducation: z.object({
    topics: z.array(z.string()),
    resources: z.array(
      z.object({
        type: z.enum(['guide', 'video', 'webinar', 'documentation']),
        title: z.string(),
        relevance: z.number(),
      })
    ),
    personalizedTips: z.array(z.string()),
  }),
  riskMitigation: z.object({
    identifiedRisks: z.array(
      z.object({
        risk: z.string(),
        probability: z.number(),
        impact: z.enum(['low', 'medium', 'high', 'critical']),
        mitigation: z.string(),
      })
    ),
    monitoringPlan: z.string(),
  }),
  valueAddedServices: z.array(
    z.object({
      service: z.string(),
      benefit: z.string(),
      implementation: z.string(),
    })
  ),
});

type ProactiveAction = z.infer<typeof proactiveActionSchema>;

export class ProactiveAgent extends BaseAgent {
  private parser: StructuredOutputParser<ProactiveAction>;
  name = 'Proactive';
  description =
    'Creates follow-up plans, schedules preventive actions, and ensures long-term customer success';

  constructor() {
    super('Proactive Support Agent', AgentType.ROUTER);
    this.parser = StructuredOutputParser.fromZodSchema(proactiveActionSchema);
  }

  getSystemPrompt(): string {
    return `${PROACTIVE_AGENT_PROMPT}

${this.parser.getFormatInstructions()}`;
  }

  async processTicket(context: AgentContext): Promise<AgentResponse> {
    try {
      // Gather proactive intelligence
      const customerHistory = agentNetwork.getCustomerHistory(context.ticket.customerId);
      const recentInsights = agentNetwork.getRecentInsights();
      const industryTrends = await this.getIndustryTrends();
      const seasonalFactors = this.analyzeSeasonalFactors();

      // Check for retention alerts
      const retentionAlert = recentInsights.find(
        (i) =>
          i.insightType === 'warning' &&
          i.relatedData?.customerIds?.includes(context.ticket.customerId)
      );

      const model = getOpenRouterModel(0.3);
      const messages = [
        { role: 'system' as const, content: this.getSystemPrompt() },
        {
          role: 'user' as const,
          content: `
Create a comprehensive proactive support plan:

Current Issue: ${context.ticket.title}
Description: ${context.ticket.description}
Category: ${context.ticket.category}
Customer: ${context.ticket.customer.name}

Customer History:
- Previous Issues: ${customerHistory.length}
- Common Patterns: ${this.extractPatterns(customerHistory)}
- Success Metrics: ${this.summarizeMetrics(customerHistory)}

Current Context:
- Season: ${seasonalFactors.currentSeason}
- Upcoming Events: ${seasonalFactors.upcomingEvents.join(', ')}
- Industry Trends: ${industryTrends.join(', ')}
${retentionAlert ? `- ⚠️ RETENTION ALERT: ${retentionAlert.content}` : ''}

Recent Platform Insights:
${recentInsights
  .slice(0, 3)
  .map((i) => `- ${i.content}`)
  .join('\n')}

Please create a proactive support plan that prevents future issues and maximizes customer success.`,
        },
      ];

      const response = await model.invoke(messages);
      const proactivePlan = await this.parser.parse(response.content as string);

      // Set up automated actions
      for (const action of proactivePlan.immediateActions) {
        if (action.automationPossible) {
          await this.scheduleAutomatedAction(action, context);
        }
      }

      // Create follow-up tasks
      await this.createFollowUpTasks(proactivePlan.followUpPlan, context);

      // Share proactive insights
      if (proactivePlan.riskMitigation.identifiedRisks.some((r) => r.impact === 'critical')) {
        await agentNetwork.broadcastInsight({
          agent: this.name,
          insightType: 'warning',
          content: `Critical risks identified for ${context.ticket.customer.name}`,
          confidence: 0.85,
          evidence: proactivePlan.riskMitigation.identifiedRisks
            .filter((r) => r.impact === 'critical')
            .map((r) => r.risk),
          impact: 'critical',
          relatedData: {
            customerIds: [context.ticket.customerId],
            ticketIds: [context.ticket.id],
          },
        });
      }

      // Generate proactive response
      const proactiveResponse = this.generateProactiveResponse(
        proactivePlan,
        context,
        retentionAlert
      );

      return {
        content: proactiveResponse,
        confidence: 0.88,
        shouldEscalate: false,
        metadata: {
          proactivePlan,
          automatedActionsScheduled: proactivePlan.immediateActions.filter(
            (a) => a.automationPossible
          ).length,
          followUpTasksCreated: proactivePlan.followUpPlan.checkpoints.length,
          agentType: 'ProactiveAgent',
        },
      };
    } catch (error) {
      console.error('Proactive Agent error:', error);
      return {
        content: 'Unable to create proactive plan. Proceeding with standard support.',
        confidence: 0.3,
        shouldEscalate: false,
      };
    }
  }

  private extractPatterns(history: any[]): string {
    if (history.length === 0) return 'No previous issues';

    const issues = history.map((h) => h.issue);
    const commonWords = this.findCommonWords(issues);

    return commonWords.length > 0 ? commonWords.join(', ') : 'Various issues';
  }

  private findCommonWords(texts: string[]): string[] {
    const wordFreq = new Map<string, number>();
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an']);

    texts.forEach((text) => {
      const words = text.toLowerCase().split(/\s+/);
      words.forEach((word) => {
        if (word.length > 3 && !stopWords.has(word)) {
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }
      });
    });

    return Array.from(wordFreq.entries())
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);
  }

  private summarizeMetrics(history: any[]): string {
    const resolved = history.filter((h) => h.outcome === 'resolved').length;
    const avgSatisfaction =
      history
        .filter((h) => h.successMetrics.customerSatisfaction)
        .reduce((sum, h) => sum + h.successMetrics.customerSatisfaction!, 0) / history.length || 0;

    return `${resolved}/${history.length} resolved, ${avgSatisfaction.toFixed(1)}/5 avg satisfaction`;
  }

  private async getIndustryTrends(): Promise<string[]> {
    // In production, would fetch from industry data sources
    return [
      'Increased demand for contactless check-in',
      'Growing importance of flexible cancellation policies',
      'Rise in extended stay bookings',
    ];
  }

  private analyzeSeasonalFactors() {
    const month = new Date().getMonth();
    const seasons = {
      winter: [11, 0, 1],
      spring: [2, 3, 4],
      summer: [5, 6, 7],
      fall: [8, 9, 10],
    };

    const currentSeason =
      Object.entries(seasons).find(([_, months]) => months.includes(month))?.[0] || 'unknown';

    const upcomingEvents = [];
    const currentDate = new Date();

    // Check for major events/holidays
    if (month === 11) upcomingEvents.push('Holiday Season');
    if (month === 5 || month === 6) upcomingEvents.push('Summer Peak Season');
    if (month === 8) upcomingEvents.push('Back-to-School Season');

    return { currentSeason, upcomingEvents };
  }

  private async scheduleAutomatedAction(action: any, context: AgentContext) {
    // In production, would integrate with task scheduling system
    console.log(`Scheduling automated action: ${action.action} at ${action.timing}`);
    
    // Track this as an AI decision
    this.trackDecision({
      decision: `Schedule automated action: ${action.action}`,
      alternatives: ['Manual follow-up', 'No action', 'Immediate action'],
      evidence: [`Timing: ${action.timing}`, `Type: ${action.type}`, `Customer priority: ${action.priority || 'standard'}`],
      reasoning: `Automated action scheduled to ensure timely follow-up and customer satisfaction`,
      confidence: 0.88,
      impact: action.priority === 'high' ? 'high' : 'medium'
    });

    // Record the scheduled action
    await agentNetwork.sendMessage({
      fromAgent: this.name,
      toAgent: 'AutomationSystem',
      messageType: 'request',
      content: `Schedule: ${action.action}`,
      metadata: {
        ticketId: context.ticket.id,
        customerId: context.ticket.customerId,
        timing: action.timing,
        type: action.type,
      },
    });
  }

  private async createFollowUpTasks(followUpPlan: any, context: AgentContext) {
    // In production, would create actual tasks in task management system
    for (const checkpoint of followUpPlan.checkpoints) {
      console.log(`Creating follow-up task: ${checkpoint.action} at ${checkpoint.timing}`);
      
      // Track each follow-up task as AI thinking
      this.trackThinking({
        process: 'Creating follow-up task',
        thinking: {
          task: checkpoint.action,
          timing: checkpoint.timing,
          purpose: checkpoint.purpose || 'Ensure customer satisfaction',
          priority: checkpoint.priority || 'medium'
        },
        confidence: 0.85,
        next_actions: ['Schedule task', 'Set reminder', 'Assign to appropriate team']
      });
    }
  }

  private generateProactiveResponse(
    plan: ProactiveAction,
    context: AgentContext,
    retentionAlert: any
  ): string {
    const topPreventive = plan.preventiveRecommendations.sort(
      (a, b) => b.preventionRate - a.preventionRate
    )[0];

    let response = `Proactive Support Plan Created:

🎯 Immediate Actions:
${plan.immediateActions
  .slice(0, 3)
  .map((a) => `• ${a.action} (${a.timing})${a.automationPossible ? ' ✅ Automated' : ''}`)
  .join('\n')}

📅 Follow-up Schedule:
${plan.followUpPlan.checkpoints
  .slice(0, 3)
  .map((c) => `• ${c.timing}: ${c.action}`)
  .join('\n')}
Total monitoring period: ${plan.followUpPlan.totalDuration}

🛡️ Prevention Strategy:
${
  topPreventive
    ? `Top Recommendation: ${topPreventive.recommendation}
• Prevention Rate: ${Math.round(topPreventive.preventionRate * 100)}%
• Implementation: ${topPreventive.implementation}`
    : 'Standard prevention measures applied'
}

📚 Educational Resources:
${plan.customerEducation.resources
  .slice(0, 2)
  .map((r) => `• ${r.title} (${r.type})`)
  .join('\n')}

💡 Personalized Tips:
${plan.customerEducation.personalizedTips
  .slice(0, 3)
  .map((tip) => `• ${tip}`)
  .join('\n')}

`;

    if (plan.riskMitigation.identifiedRisks.length > 0) {
      const highRisks = plan.riskMitigation.identifiedRisks.filter(
        (r) => r.impact === 'high' || r.impact === 'critical'
      );

      if (highRisks.length > 0) {
        response += `
⚠️ Risk Mitigation:
${highRisks.map((r) => `• ${r.risk} - ${r.mitigation}`).join('\n')}
`;
      }
    }

    if (retentionAlert) {
      response += `
🌟 Special Attention Program:
As a valued customer, we're implementing additional support measures:
${plan.valueAddedServices
  .slice(0, 2)
  .map((s) => `• ${s.service} - ${s.benefit}`)
  .join('\n')}
`;
    }

    response += `
✨ Expected Outcomes:
• Prevent similar issues with ${Math.round(topPreventive?.preventionRate * 100 || 75)}% effectiveness
• Reduce resolution time by 60% for future issues
• Increase platform utilization and revenue potential

Your success is our priority. We'll proactively monitor and support your account.`;

    return response;
  }
}
