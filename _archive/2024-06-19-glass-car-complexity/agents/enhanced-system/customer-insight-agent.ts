import { BaseAgent, AgentContext, AgentResponse } from '../base';
import { AgentType } from '@prisma/client';
import { z } from 'zod';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { agentNetwork } from './agent-network';
import { prisma } from '@/lib/db/prisma';
import { getOpenRouterModel } from '@/lib/ai/openrouter';
import { CUSTOMER_INSIGHT_PROMPT } from './agent-prompts';
import { CustomerInsights } from './types';

const customerInsightSchema = z.object({
  customerProfile: z.object({
    segment: z.enum(['vip', 'regular', 'new', 'at_risk', 'churned']),
    lifetime_value: z.number(),
    properties_managed: z.number(),
    account_age_days: z.number(),
    total_bookings: z.number(),
    avg_property_rating: z.number(),
  }),
  behavioral_insights: z.array(
    z.object({
      insight: z.string(),
      impact: z.enum(['positive', 'negative', 'neutral']),
      confidence: z.number(),
    })
  ),
  satisfaction_analysis: z.object({
    current_satisfaction: z.number().min(1).max(5),
    trend: z.enum(['improving', 'stable', 'declining']),
    risk_factors: z.array(z.string()),
    satisfaction_drivers: z.array(z.string()),
  }),
  churn_risk: z.object({
    risk_level: z.enum(['low', 'medium', 'high', 'critical']),
    probability: z.number(),
    reasons: z.array(z.string()),
    retention_actions: z.array(z.string()),
  }),
  personalization: z.object({
    preferred_communication_style: z.enum(['formal', 'friendly', 'technical', 'concise']),
    preferred_solutions: z.array(z.string()),
    pain_points: z.array(z.string()),
    success_factors: z.array(z.string()),
  }),
  recommendations: z.array(
    z.object({
      action: z.string(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      expected_impact: z.string(),
    })
  ),
});

type CustomerInsight = z.infer<typeof customerInsightSchema>;

export class CustomerInsightAgent extends BaseAgent {
  private parser: StructuredOutputParser<CustomerInsight>;
  name = 'Customer Insight';
  description =
    'Analyzes customer behavior, predicts churn risk, and provides personalized recommendations';

  constructor() {
    super('Customer Insight Agent', AgentType.ROUTER);
    this.parser = StructuredOutputParser.fromZodSchema(customerInsightSchema);
  }

  getSystemPrompt(): string {
    return `${CUSTOMER_INSIGHT_PROMPT}

${this.parser.getFormatInstructions()}`;
  }

  async processTicket(context: AgentContext): Promise<AgentResponse> {
    try {
      // Gather comprehensive customer data
      const customerData = await this.gatherCustomerIntelligence(context.ticket.customerId);
      const supportHistory = await this.analyzeSupportHistory(context.ticket.customerId);
      const businessMetrics = await this.analyzeBusinessMetrics(context.ticket.customerId);

      const model = getOpenRouterModel(0.3);
      const messages = [
        { role: 'system' as const, content: this.getSystemPrompt() },
        {
          role: 'user' as const,
          content: `
Analyze this customer and provide deep insights:

Current Issue: ${context.ticket.title}
Description: ${context.ticket.description}

Customer Profile:
- Name: ${context.ticket.customer.name}
- Email: ${context.ticket.customer.email}
- Company: ${context.ticket.customer.company || 'Individual Host'}
- Account Age: ${customerData.accountAge} days
- Total Properties: ${customerData.propertyCount}

Business Metrics:
- Total Bookings: ${businessMetrics.totalBookings}
- Revenue (Last 12mo): $${businessMetrics.revenue}
- Avg Occupancy Rate: ${businessMetrics.avgOccupancy}%
- Avg Guest Rating: ${businessMetrics.avgRating}/5

Support History:
- Total Tickets: ${supportHistory.totalTickets}
- Avg Resolution Time: ${supportHistory.avgResolutionTime} hours
- Last Contact: ${supportHistory.lastContact}
- Common Issues: ${supportHistory.commonIssues.join(', ')}

Recent Activity:
- Last Booking: ${customerData.lastBooking}
- Platform Usage: ${customerData.platformUsage}
- Feature Adoption: ${customerData.featureAdoption.join(', ')}

Sentiment Indicators:
- Recent Reviews Sentiment: ${customerData.reviewSentiment}
- Support Interaction Tone: ${supportHistory.overallSentiment}
- NPS Score: ${customerData.npsScore || 'Not available'}

Please provide comprehensive customer intelligence analysis.`,
        },
      ];

      const response = await model.invoke(messages);
      const insights = await this.parser.parse(response.content as string);

      // Share critical insights with the network
      if (insights.customerProfile.segment === 'vip') {
        await agentNetwork.broadcastInsight({
          agent: this.name,
          insightType: 'opportunity',
          content: `VIP customer requiring white-glove service - ${context.ticket.customer.name}`,
          confidence: 0.95,
          evidence: [
            `${insights.customerProfile.properties_managed} properties`,
            `$${insights.customerProfile.lifetime_value} LTV`,
          ],
          impact: 'high',
          relatedData: { customerIds: [context.ticket.customerId] },
        });
      }

      if (
        insights.churn_risk.risk_level === 'high' ||
        insights.churn_risk.risk_level === 'critical'
      ) {
        await agentNetwork.broadcastInsight({
          agent: this.name,
          insightType: 'warning',
          content: `High churn risk detected for ${context.ticket.customer.name}`,
          confidence: insights.churn_risk.probability,
          evidence: insights.churn_risk.reasons,
          impact: 'critical',
          relatedData: { customerIds: [context.ticket.customerId] },
        });

        // Initiate retention protocol
        await this.initiateRetentionProtocol(context, insights);
      }

      // Record insights for future reference
      await this.recordCustomerInsights(context.ticket.customerId, insights);

      // Generate personalized response strategy
      const responseStrategy = this.generateResponseStrategy(insights, context);

      return {
        content: responseStrategy,
        confidence: 0.9,
        shouldEscalate: this.shouldEscalateBasedOnProfile(insights),
        metadata: {
          customerInsights: insights,
          responsePersonalization: {
            tone: insights.personalization.preferred_communication_style,
            priorityActions: insights.recommendations.filter(
              (r) => r.priority === 'urgent' || r.priority === 'high'
            ),
          },
          agentType: 'CustomerInsight',
        },
      };
    } catch (error) {
      console.error('Customer Insight Agent error:', error);
      return {
        content: 'Unable to complete customer analysis. Proceeding with standard support.',
        confidence: 0.3,
        shouldEscalate: false,
      };
    }
  }

  private async gatherCustomerIntelligence(customerId: string) {
    // Simulated data gathering - in production would pull from multiple sources
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        tickets: {
          include: { metrics: true },
        },
      },
    });

    const accountAge = customer
      ? Math.floor((Date.now() - customer.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      accountAge,
      propertyCount: Math.floor(Math.random() * 15) + 1, // Simulated
      lastBooking: '3 days ago',
      platformUsage: 'Daily active',
      featureAdoption: ['Calendar Sync', 'Dynamic Pricing', 'Instant Book'],
      reviewSentiment: 'Positive',
      npsScore: 8,
    };
  }

  private async analyzeSupportHistory(customerId: string) {
    const tickets = await prisma.ticket.findMany({
      where: { customerId },
      include: { metrics: true },
      orderBy: { createdAt: 'desc' },
    });

    const resolutionTimes = tickets
      .filter((t) => t.metrics?.resolutionTime)
      .map((t) => t.metrics!.resolutionTime! / 60); // Convert to hours

    const categories = tickets.map((t) => t.category);
    const categoryCounts = new Map<string, number>();
    categories.forEach((cat) => {
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    });

    const commonIssues = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    return {
      totalTickets: tickets.length,
      avgResolutionTime:
        resolutionTimes.length > 0
          ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length)
          : 0,
      lastContact: tickets.length > 0 ? this.getRelativeTime(tickets[0].createdAt) : 'Never',
      commonIssues,
      overallSentiment: this.calculateOverallSentiment(tickets),
    };
  }

  private async analyzeBusinessMetrics(customerId: string) {
    // Simulated business metrics - in production would pull from booking/revenue data
    return {
      totalBookings: Math.floor(Math.random() * 500) + 50,
      revenue: Math.floor(Math.random() * 200000) + 10000,
      avgOccupancy: Math.floor(Math.random() * 30) + 60,
      avgRating: (Math.random() * 1.5 + 3.5).toFixed(1),
    };
  }

  private calculateOverallSentiment(tickets: any[]): string {
    if (tickets.length === 0) return 'Neutral';

    const avgSentiment = tickets.reduce((sum, t) => sum + (t.sentiment || 0), 0) / tickets.length;

    if (avgSentiment > 0.3) return 'Positive';
    if (avgSentiment < -0.3) return 'Negative';
    return 'Neutral';
  }

  private getRelativeTime(date: Date): string {
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  private async initiateRetentionProtocol(context: AgentContext, insights: CustomerInsight) {
    // Notify relevant teams and create retention tasks
    await agentNetwork.sendMessage({
      fromAgent: this.name,
      toAgent: 'ProactiveAgent',
      messageType: 'alert',
      content: `Initiate retention protocol for ${context.ticket.customer.name}`,
      metadata: {
        churnRisk: insights.churn_risk,
        customerId: context.ticket.customerId,
        urgency: 'high',
      },
    });

    // Log retention attempt
    console.log('Retention protocol initiated for customer:', context.ticket.customerId);
  }

  private async recordCustomerInsights(customerId: string, insights: CustomerInsight) {
    // Store insights for future reference and learning
    const memory = {
      ticketId: `insight-${Date.now()}`,
      customerId,
      issue: 'Customer Intelligence Analysis',
      solution: JSON.stringify(insights.recommendations),
      outcome: 'pending' as const,
      learnings: [
        `Customer segment: ${insights.customerProfile.segment}`,
        `Churn risk: ${insights.churn_risk.risk_level}`,
        `Preferred communication: ${insights.personalization.preferred_communication_style}`,
      ],
      successMetrics: {
        resolutionTime: 0,
        customerSatisfaction: insights.satisfaction_analysis.current_satisfaction,
        effortScore: 0,
      },
    };

    await agentNetwork.recordMemory(memory);
  }

  private generateResponseStrategy(insights: CustomerInsight, context: AgentContext): string {
    const urgentActions = insights.recommendations
      .filter((r) => r.priority === 'urgent' || r.priority === 'high')
      .slice(0, 3);

    return `Customer Intelligence Analysis:

👤 Customer Profile: ${insights.customerProfile.segment.toUpperCase()} Segment
• ${insights.customerProfile.properties_managed} properties managed
• $${insights.customerProfile.lifetime_value.toLocaleString()} lifetime value
• ${insights.customerProfile.account_age_days} days with platform
• ${insights.customerProfile.avg_property_rating}/5 average rating

📊 Key Insights:
${insights.behavioral_insights
  .slice(0, 3)
  .map((i) => `• ${i.insight} (${i.impact} impact, ${Math.round(i.confidence * 100)}% confidence)`)
  .join('\n')}

😊 Satisfaction Analysis:
• Current Score: ${insights.satisfaction_analysis.current_satisfaction}/5 (${insights.satisfaction_analysis.trend})
• Key Drivers: ${insights.satisfaction_analysis.satisfaction_drivers.slice(0, 2).join(', ')}
${
  insights.satisfaction_analysis.risk_factors.length > 0
    ? `• Risk Factors: ${insights.satisfaction_analysis.risk_factors.slice(0, 2).join(', ')}`
    : ''
}

${
  insights.churn_risk.risk_level !== 'low'
    ? `
⚠️ Churn Risk: ${insights.churn_risk.risk_level.toUpperCase()} (${Math.round(insights.churn_risk.probability * 100)}%)
• Reasons: ${insights.churn_risk.reasons.slice(0, 2).join(', ')}
• Retention Actions: ${insights.churn_risk.retention_actions.slice(0, 2).join(', ')}
`
    : ''
}

🎯 Personalization Strategy:
• Communication Style: ${insights.personalization.preferred_communication_style}
• Known Pain Points: ${insights.personalization.pain_points.slice(0, 2).join(', ')}
• Success Factors: ${insights.personalization.success_factors.slice(0, 2).join(', ')}

📋 Recommended Actions:
${urgentActions.map((a) => `• ${a.action} (${a.priority} priority) - ${a.expected_impact}`).join('\n')}

This analysis will guide our approach to ensure ${context.ticket.customer.name} receives personalized, high-quality support.`;
  }

  private shouldEscalateBasedOnProfile(insights: CustomerInsight): boolean {
    return (
      insights.customerProfile.segment === 'vip' ||
      insights.churn_risk.risk_level === 'critical' ||
      insights.satisfaction_analysis.current_satisfaction < 3
    );
  }
}
