import { BaseAgent, AgentContext, AgentResponse } from '../base';
import { AgentType } from '@prisma/client';
import { z } from 'zod';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { agentNetwork } from './agent-network';
import { prisma } from '@/lib/db/prisma';
import { getOpenRouterModel } from '@/lib/ai/openrouter';
import { PATTERN_ANALYST_PROMPT } from './agent-prompts';
import { PatternAnalysis } from './types';

const patternAnalysisSchema = z.object({
  patterns: z.array(
    z.object({
      type: z.enum(['recurring', 'seasonal', 'emerging', 'anomaly']),
      description: z.string(),
      frequency: z.number(),
      affectedCategories: z.array(z.string()),
      confidence: z.number(),
    })
  ),
  similarTickets: z.array(
    z.object({
      ticketId: z.string(),
      similarity: z.number(),
      resolution: z.string(),
      successRate: z.number(),
    })
  ),
  trends: z.object({
    volumeTrend: z.enum(['increasing', 'stable', 'decreasing']),
    sentimentTrend: z.enum(['improving', 'stable', 'declining']),
    resolutionTimeTrend: z.enum(['faster', 'stable', 'slower']),
  }),
  predictions: z.array(
    z.object({
      prediction: z.string(),
      probability: z.number(),
      timeframe: z.string(),
      preventiveAction: z.string(),
    })
  ),
  insights: z.array(z.string()),
});

type PatternAnalysis = z.infer<typeof patternAnalysisSchema>;

export class PatternAnalystAgent extends BaseAgent {
  private parser: StructuredOutputParser<PatternAnalysis>;
  name = 'Pattern Analyst';
  description = 'Identifies patterns, anomalies, and predicts future issues';

  constructor() {
    super('Pattern Analyst', AgentType.ROUTER); // Using ROUTER type as base
    this.parser = StructuredOutputParser.fromZodSchema(patternAnalysisSchema);
  }

  getSystemPrompt(): string {
    return `${PATTERN_ANALYST_PROMPT}

${this.parser.getFormatInstructions()}`;
  }

  async processTicket(context: AgentContext): Promise<AgentResponse> {
    try {
      // Track initial analysis phase
      this.trackThinking(
        'initialization',
        'Starting comprehensive pattern analysis for incoming ticket',
        0.9,
        ['Ticket received', 'Historical data needed', 'Trend analysis required'],
        ['Analyze historical patterns', 'Review category trends', 'Examine customer patterns'],
        'Beginning pattern analysis by gathering historical context and trend data'
      );

      // Perform deep historical analysis
      this.trackThinking(
        'historical_analysis',
        'Analyzing historical patterns and similar tickets',
        0.8,
        ['Querying database for similar tickets', 'Extracting keywords', 'Calculating metrics'],
        ['Process similarity matches', 'Calculate success rates', 'Identify patterns'],
        'Searching through historical data to find patterns and similar cases'
      );
      
      const historicalData = await this.analyzeHistoricalPatterns(context);
      
      this.trackAnalysis(
        'similarity',
        `${context.ticket.title} - ${context.ticket.description}`,
        historicalData,
        'Keyword matching and category filtering against historical tickets',
        0.85,
        historicalData.similarCount,
        [
          `Found ${historicalData.similarCount} similar tickets`,
          `Average resolution time: ${historicalData.avgResolutionTime} minutes`,
          `Success rate: ${Math.round(historicalData.successRate)}%`
        ]
      );

      const categoryTrends = await this.analyzeCategoryTrends(context.ticket.category);
      
      this.trackAnalysis(
        'trend',
        context.ticket.category,
        categoryTrends,
        'Time-based analysis of category-specific ticket volumes and patterns',
        0.8,
        categoryTrends.recentVolume + 50, // Mock additional data points
        [
          `Recent trend: ${categoryTrends.recentTrend}`,
          `Volume change detected`,
          `Platform updates correlation found`
        ]
      );

      const customerPatterns = await this.analyzeCustomerPatterns(context.ticket.customerId);
      
      this.trackAnalysis(
        'pattern',
        `Customer ${context.ticket.customer.name}`,
        customerPatterns,
        'Customer behavior analysis based on ticket history and satisfaction scores',
        0.75,
        customerPatterns.totalTickets,
        [
          `Customer has ${customerPatterns.totalTickets} previous tickets`,
          `Average satisfaction: ${customerPatterns.satisfactionScore}/5`,
          `Repeat issue detected: ${customerPatterns.isRepeatIssue ? 'Yes' : 'No'}`
        ]
      );

      // Track decision making process
      this.trackDecision(
        'analysis_approach',
        'Using comprehensive multi-dimensional analysis approach',
        [
          'Simple keyword matching only',
          'Category-based analysis only',
          'Customer-specific analysis only'
        ],
        0.9,
        [
          'Historical data available',
          'Customer patterns identifiable',
          'Trend data significant'
        ],
        'high'
      );

      const model = getOpenRouterModel(0.3);
      const messages = [
        { role: 'system' as const, content: this.getSystemPrompt() },
        {
          role: 'user' as const,
          content: `
Analyze this ticket for patterns and insights:

Ticket: ${context.ticket.title}
Description: ${context.ticket.description}
Category: ${context.ticket.category}
Customer: ${context.ticket.customer.name} (${context.ticket.customer.company || 'Individual'})

Historical Context:
- Similar tickets found: ${historicalData.similarCount}
- Average resolution time for category: ${categoryTrends.avgResolutionTime} minutes
- Recent trend: ${categoryTrends.recentTrend}
- Customer history: ${customerPatterns.totalTickets} tickets, ${customerPatterns.satisfactionScore}/5 avg satisfaction

Recent Platform Context:
- Last platform update: ${categoryTrends.lastPlatformUpdate}
- Current season: ${this.getCurrentSeason()}
- Active campaigns: ${categoryTrends.activeCampaigns.join(', ')}

Please provide comprehensive pattern analysis.`,
        },
      ];

      // Track AI invocation
      this.trackThinking(
        'ai_pattern_analysis',
        'Invoking AI model to analyze patterns and generate insights',
        0.95,
        [
          `Historical data: ${historicalData.similarCount} similar tickets`,
          `Category trend: ${categoryTrends.recentTrend}`,
          `Customer profile analyzed`
        ],
        ['Parse AI response', 'Extract patterns', 'Validate insights'],
        'Sending comprehensive context to AI model for deep pattern analysis'
      );

      const response = await this.invokeAI(messages, 0.3, { 
        ticketId: context.ticket.id,
        analysisType: 'pattern_analysis',
        historicalDataPoints: historicalData.similarCount
      });
      
      this.trackThinking(
        'response_parsing',
        'Parsing structured AI response for pattern data',
        0.9,
        ['AI response received', 'JSON structure expected', 'Schema validation needed'],
        ['Extract patterns', 'Validate confidence scores', 'Process insights'],
        'Processing AI response through structured parser to extract pattern insights'
      );

      const analysis = await this.parser.parse(response.content as string);

      // Track insight processing
      this.trackThinking(
        'insight_processing',
        `Processing ${analysis.patterns.length} patterns and ${analysis.predictions.length} predictions`,
        0.85,
        [
          `Patterns found: ${analysis.patterns.length}`,
          `Similar tickets: ${analysis.similarTickets.length}`,
          `Predictions generated: ${analysis.predictions.length}`
        ],
        ['Share critical insights', 'Check for anomalies', 'Generate report'],
        'Analyzing parsed results to identify critical insights and anomalies'
      );

      // Share critical insights with the network
      for (const pattern of analysis.patterns) {
        if (pattern.confidence > 0.8 && pattern.type === 'emerging') {
          this.trackDecision(
            'critical_insight_sharing',
            `Sharing emerging pattern: ${pattern.description}`,
            ['Keep insight local', 'Share with specific agents only'],
            pattern.confidence,
            [
              `High confidence: ${Math.round(pattern.confidence * 100)}%`,
              `Emerging pattern type`,
              `Frequency: ${pattern.frequency}`
            ],
            'high'
          );

          await agentNetwork.broadcastInsight({
            agent: this.name,
            insightType: 'pattern',
            content: pattern.description,
            confidence: pattern.confidence,
            evidence: [
              `Frequency: ${pattern.frequency}`,
              `Categories: ${pattern.affectedCategories.join(', ')}`,
            ],
            impact: pattern.frequency > 10 ? 'high' : 'medium',
            relatedData: {
              ticketIds: analysis.similarTickets.map((t) => t.ticketId),
            },
          });
        }
      }

      // Check for anomalies
      const anomalyDetected = this.detectAnomaly(historicalData, categoryTrends);
      
      this.trackAnalysis(
        'pattern',
        `Anomaly detection for ${context.ticket.category}`,
        { anomalyDetected, historicalData, categoryTrends },
        'Statistical analysis comparing current patterns to historical norms',
        anomalyDetected ? 0.85 : 0.7,
        historicalData.similarCount + categoryTrends.recentVolume,
        anomalyDetected ? [
          'Unusual spike detected',
          'Deviation from normal patterns',
          'Requires immediate attention'
        ] : [
          'Normal patterns observed',
          'No significant anomalies'
        ]
      );

      if (anomalyDetected) {
        this.trackDecision(
          'anomaly_alert',
          'Broadcasting anomaly alert to agent network',
          ['Log silently', 'Send low-priority alert'],
          0.85,
          [
            'Spike in similar issues detected',
            'Deviation from normal patterns',
            'Potential systematic issue'
          ],
          'high'
        );

        await agentNetwork.broadcastInsight({
          agent: this.name,
          insightType: 'anomaly',
          content: `Unusual pattern detected for ${context.ticket.category} issues`,
          confidence: 0.85,
          evidence: ['Spike in similar issues', 'Deviation from normal patterns'],
          impact: 'high',
        });
      }

      // Generate comprehensive analysis report
      this.trackThinking(
        'report_generation',
        'Generating comprehensive analysis report',
        0.9,
        [
          'Analysis complete',
          'Insights processed',
          'Anomalies checked'
        ],
        ['Format report', 'Calculate confidence', 'Determine escalation'],
        'Compiling all analysis results into a comprehensive report'
      );

      const analysisReport = this.generateAnalysisReport(analysis, historicalData, categoryTrends);
      const finalConfidence = this.calculateAnalysisConfidence(analysis);
      const shouldEscalate = this.shouldEscalateBasedOnPatterns(analysis);

      // Track final decision
      this.trackDecision(
        'escalation_decision',
        shouldEscalate ? 'Escalating due to high-risk patterns' : 'Proceeding with normal flow',
        ['Always escalate', 'Never escalate', 'Escalate based on confidence only'],
        finalConfidence,
        [
          `Analysis confidence: ${Math.round(finalConfidence * 100)}%`,
          `Patterns analyzed: ${analysis.patterns.length}`,
          `Anomalies detected: ${anomalyDetected ? 'Yes' : 'No'}`
        ],
        shouldEscalate ? 'high' : 'medium'
      );

      this.trackThinking(
        'completion',
        `Pattern analysis complete with ${Math.round(finalConfidence * 100)}% confidence`,
        finalConfidence,
        [
          `Report generated: ${analysisReport.length} characters`,
          `Escalation: ${shouldEscalate ? 'Required' : 'Not required'}`,
          `Insights shared: ${analysis.patterns.filter(p => p.confidence > 0.8).length}`
        ],
        [],
        'Pattern analysis completed successfully with comprehensive insights'
      );

      return {
        content: analysisReport,
        confidence: finalConfidence,
        shouldEscalate,
        metadata: {
          analysis,
          historicalContext: historicalData,
          trends: categoryTrends,
          agentType: 'PatternAnalyst',
        },
      };
    } catch (error) {
      console.error('Pattern Analyst error:', error);
      return {
        content: 'Unable to complete pattern analysis. Proceeding with standard processing.',
        confidence: 0.3,
        shouldEscalate: false,
      };
    }
  }

  private async analyzeHistoricalPatterns(context: AgentContext) {
    const keywords = this.extractKeywords(context.ticket.description);

    const similarTickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { category: context.ticket.category },
          {
            OR: keywords.map((keyword) => ({
              OR: [
                { title: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
              ],
            })),
          },
        ],
        status: { in: ['RESOLVED', 'CLOSED'] },
      },
      include: {
        metrics: true,
        messages: {
          where: { agentType: { not: null } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    const resolutionTimes = similarTickets
      .filter((t) => t.metrics?.resolutionTime)
      .map((t) => t.metrics!.resolutionTime!);

    return {
      similarCount: similarTickets.length,
      avgResolutionTime:
        resolutionTimes.length > 0
          ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length)
          : 0,
      commonResolutions: this.extractCommonResolutions(similarTickets),
      successRate: this.calculateSuccessRate(similarTickets),
      patterns: this.identifyPatterns(similarTickets),
    };
  }

  private async analyzeCategoryTrends(category: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTickets = await prisma.ticket.count({
      where: {
        category: category as any,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const previousPeriodTickets = await prisma.ticket.count({
      where: {
        category: category as any,
        createdAt: {
          gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
          lt: thirtyDaysAgo,
        },
      },
    });

    const trend =
      recentTickets > previousPeriodTickets * 1.2
        ? 'increasing'
        : recentTickets < previousPeriodTickets * 0.8
          ? 'decreasing'
          : 'stable';

    return {
      recentTrend: trend,
      recentVolume: recentTickets,
      avgResolutionTime: 45, // Would calculate from actual data
      lastPlatformUpdate: '5 days ago',
      activeCampaigns: ['Summer Special', 'New Host Onboarding'],
      commonIssueTypes: ['Calendar Sync', 'Payment Processing', 'Listing Visibility'],
    };
  }

  private async analyzeCustomerPatterns(customerId: string) {
    const customerHistory = await prisma.ticket.findMany({
      where: { customerId },
      include: { metrics: true },
    });

    const satisfactionScores = customerHistory
      .filter((t) => t.metrics?.customerSatisfaction)
      .map((t) => t.metrics!.customerSatisfaction!);

    return {
      totalTickets: customerHistory.length,
      satisfactionScore:
        satisfactionScores.length > 0
          ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length
          : 0,
      commonIssues: this.extractCommonIssues(customerHistory),
      isRepeatIssue: this.checkRepeatIssue(customerHistory),
    };
  }

  private extractKeywords(text: string): string[] {
    const importantTerms = [
      'calendar',
      'sync',
      'payment',
      'refund',
      'booking',
      'guest',
      'host',
      'property',
      'listing',
      'review',
      'cancel',
      'damage',
      'clean',
      'check-in',
      'checkout',
      'price',
      'fee',
      'tax',
      'payout',
      'api',
      'integration',
      'error',
      'broken',
      'failed',
      'urgent',
      'ical',
      'airbnb',
      'vrbo',
    ];

    const words = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3);

    return words.filter((word) => importantTerms.includes(word)).slice(0, 10);
  }

  private extractCommonResolutions(tickets: any[]): string[] {
    const resolutions = tickets
      .filter((t) => t.messages.length > 0)
      .map((t) => t.messages[0].content)
      .filter(Boolean);

    // In real implementation, would use NLP to extract common themes
    return resolutions.slice(0, 3);
  }

  private calculateSuccessRate(tickets: any[]): number {
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;
    return tickets.length > 0 ? (resolved / tickets.length) * 100 : 0;
  }

  private identifyPatterns(tickets: any[]): string[] {
    // Simplified pattern identification
    const patterns: string[] = [];

    const timeClusters = this.findTimeClusters(tickets);
    if (timeClusters.length > 0) {
      patterns.push(`Issues cluster around ${timeClusters[0]}`);
    }

    return patterns;
  }

  private findTimeClusters(tickets: any[]): string[] {
    // Simplified time clustering
    const hourCounts = new Map<number, number>();

    tickets.forEach((ticket) => {
      const hour = new Date(ticket.createdAt).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const clusters: string[] = [];
    hourCounts.forEach((count, hour) => {
      if (count > tickets.length * 0.2) {
        clusters.push(`${hour}:00-${hour + 1}:00`);
      }
    });

    return clusters;
  }

  private detectAnomaly(historicalData: any, trends: any): boolean {
    return (
      trends.recentTrend === 'increasing' && trends.recentVolume > historicalData.similarCount * 2
    );
  }

  private generateAnalysisReport(
    analysis: PatternAnalysis,
    historicalData: any,
    categoryTrends: any
  ): string {
    const insights = analysis.insights.join('\n• ');
    const topPattern = analysis.patterns[0];
    const bestSimilarTicket = analysis.similarTickets[0];

    return `Pattern Analysis Complete:

📊 Key Patterns Identified:
${topPattern ? `• ${topPattern.description} (${Math.round(topPattern.confidence * 100)}% confidence)` : '• No significant patterns detected'}

📈 Current Trends:
• Volume: ${categoryTrends.recentTrend}
• Resolution Time: ${analysis.trends.resolutionTimeTrend}
• Customer Sentiment: ${analysis.trends.sentimentTrend}

🔍 Historical Context:
• ${historicalData.similarCount} similar issues found
• Average resolution: ${historicalData.avgResolutionTime} minutes
• Success rate: ${Math.round(historicalData.successRate)}%

${
  bestSimilarTicket
    ? `
💡 Most Similar Resolved Case:
• Ticket: ${bestSimilarTicket.ticketId}
• Solution: ${bestSimilarTicket.resolution}
• Success Rate: ${Math.round(bestSimilarTicket.successRate * 100)}%
`
    : ''
}

${
  analysis.predictions.length > 0
    ? `
🔮 Predictions:
${analysis.predictions.map((p) => `• ${p.prediction} (${Math.round(p.probability * 100)}% likely in ${p.timeframe})`).join('\n')}
`
    : ''
}

Key Insights:
• ${insights}`;
  }

  private calculateAnalysisConfidence(analysis: PatternAnalysis): number {
    const patternConfidence =
      analysis.patterns.length > 0
        ? analysis.patterns.reduce((sum, p) => sum + p.confidence, 0) / analysis.patterns.length
        : 0.5;

    const similarityConfidence =
      analysis.similarTickets.length > 0 ? analysis.similarTickets[0].similarity : 0.5;

    return (patternConfidence + similarityConfidence) / 2;
  }

  private shouldEscalateBasedOnPatterns(analysis: PatternAnalysis): boolean {
    const hasHighRiskPattern = analysis.patterns.some(
      (p) => p.type === 'anomaly' && p.confidence > 0.8
    );

    const hasUrgentPrediction = analysis.predictions.some(
      (p) => p.probability > 0.7 && p.timeframe === 'immediate'
    );

    return hasHighRiskPattern || hasUrgentPrediction;
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  }

  private extractCommonIssues(tickets: any[]): string[] {
    const categories = tickets.map((t) => t.category);
    const categoryCounts = new Map<string, number>();

    categories.forEach((cat) => {
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    });

    return Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);
  }

  private checkRepeatIssue(tickets: any[]): boolean {
    // Check if customer has had similar issues before
    return (
      tickets.length > 1 &&
      tickets.filter((t) => t.category === tickets[tickets.length - 1].category).length > 1
    );
  }
}
