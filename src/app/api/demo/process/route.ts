import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterModel } from '@/lib/ai/openrouter';
import { analyzeTicketContent } from '@/lib/agents/utils/text-analysis';

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json();
    
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description required' }, { status: 400 });
    }

    // Step 1: Text Analysis (instant)
    const analysis = analyzeTicketContent(title, description);
    
    // Step 2: Call AI for routing decision
    const model = getOpenRouterModel(0.3);
    
    const routingPrompt = `You are a support ticket router for a vacation rental platform. Analyze this ticket and provide a routing decision.

Ticket Title: ${title}
Ticket Description: ${description}

Based on the content, determine:
1. The category (TECHNICAL, BILLING, PRODUCT, or GENERAL)
2. The urgency (LOW, MEDIUM, HIGH, or URGENT)
3. A brief reasoning for your decision
4. Suggested solution steps

Respond in a structured format.`;

    const routingResponse = await model.invoke(routingPrompt);
    const routingContent = routingResponse.content as string;
    
    // Step 3: Generate solution with specialist agent
    const specialistPrompt = `You are a ${analysis.category} support specialist for a vacation rental platform. 

Issue: ${title}
Details: ${description}

Provide a step-by-step solution that is:
1. Clear and actionable
2. Specific to vacation rental context
3. Professional and helpful

Format your response as numbered steps.`;

    const solutionResponse = await model.invoke(specialistPrompt);
    const solutionContent = solutionResponse.content as string;
    
    // Parse solution into steps
    const solutionSteps = solutionContent
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, ''));
    
    return NextResponse.json({
      success: true,
      analysis,
      routing: {
        content: routingContent,
        category: analysis.category,
        urgency: analysis.urgencyIndicators.length > 0 ? 'HIGH' : 'MEDIUM',
      },
      solution: {
        steps: solutionSteps.length > 0 ? solutionSteps : [
          'Our AI is processing your request',
          'Solution will be tailored to your specific issue',
          solutionContent
        ],
        confidence: analysis.categoryScores[analysis.category],
      },
      metadata: {
        model: 'Claude 3 Sonnet',
        processingTime: new Date().toISOString(),
      }
    });
    
  } catch (error) {
    console.error('Error in demo processing:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process with AI',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}