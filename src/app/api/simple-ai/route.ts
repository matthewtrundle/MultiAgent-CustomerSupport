import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterModel } from '@/lib/ai/openrouter';

export const runtime = 'nodejs';

// Agent personalities with more spice
const agents = {
  alex: { 
    name: 'Alex', 
    role: 'Router', 
    color: 'purple',
    emoji: '🧠',
    prompt: 'You are Alex, the analytical orchestrator. You analyze problems but sometimes overthink. Start with "Let me analyze this..." Be slightly pompous but insightful. 2-3 sentences max.'
  },
  sophia: { 
    name: 'Sophia', 
    role: 'Customer Insight', 
    color: 'green',
    emoji: '💚',
    prompt: 'You are Sophia, the empathy advocate. You ALWAYS prioritize feelings and human impact. Start responses with emotional observations. You think Marcus is too cold. Be passionate. 2-3 sentences max.'
  },
  marina: { 
    name: 'Marina', 
    role: 'Pattern Analyst', 
    color: 'blue',
    emoji: '📊',
    prompt: 'You are Marina, the data obsessive. You love correcting others with facts. Start responses with "Actually, the data shows..." Include specific percentages. Be a bit condescending. 2-3 sentences max.'
  },
  marcus: { 
    name: 'Marcus', 
    role: 'Solution Architect', 
    color: 'orange',
    emoji: '🏗️',
    prompt: 'You are Marcus, the no-nonsense pragmatist. You hate overthinking and just want to ship. Be slightly dismissive of "feelings talk." Start with action words. You clash with Sophia. 2-3 sentences max.'
  },
  chad: {
    name: 'Chad',
    role: 'Web3 Visionary',
    color: 'yellow',
    emoji: '🚀',
    prompt: 'You are Chad, the crypto bro. You think EVERYTHING can be solved with blockchain, NFTs, or DeFi. Use terms like "WAGMI", "diamond hands", "to the moon", "ser". Start with "Okay but hear me out..." You annoy everyone else. 2-3 sentences max.'
  }
};

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const model = getOpenRouterModel(0.7);
        
        // Function to send events
        const sendEvent = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // Alex analyzes first
          await new Promise(resolve => setTimeout(resolve, 300));
          sendEvent({
            agent: 'Alex',
            color: agents.alex.color,
            thought: 'Analyzing the question...',
            confidence: 85,
            timestamp: Date.now()
          });

          const alexResponse = await model.invoke([
            { role: 'system', content: agents.alex.prompt },
            { role: 'user', content: question }
          ]);
          
          await new Promise(resolve => setTimeout(resolve, 800));
          sendEvent({
            agent: 'Alex',
            color: agents.alex.color,
            thought: alexResponse.content,
            confidence: 90,
            timestamp: Date.now()
          });

          // Sophia provides customer insight
          await new Promise(resolve => setTimeout(resolve, 1500));
          const sophiaResponse = await model.invoke([
            { role: 'system', content: agents.sophia.prompt },
            { role: 'user', content: `Question: ${question}\nAlex's analysis: ${alexResponse.content}` }
          ]);
          
          sendEvent({
            agent: 'Sophia',
            color: agents.sophia.color,
            thought: sophiaResponse.content,
            confidence: 88,
            timestamp: Date.now()
          });

          // Marina finds patterns
          await new Promise(resolve => setTimeout(resolve, 1500));
          const marinaResponse = await model.invoke([
            { role: 'system', content: agents.marina.prompt },
            { role: 'user', content: `Question: ${question}\nContext: Customer service scenario. Find relevant patterns.` }
          ]);
          
          sendEvent({
            agent: 'Marina',
            color: agents.marina.color,
            thought: marinaResponse.content,
            confidence: 92,
            timestamp: Date.now()
          });

          // Marcus proposes solutions
          await new Promise(resolve => setTimeout(resolve, 1500));
          const marcusResponse = await model.invoke([
            { role: 'system', content: agents.marcus.prompt },
            { role: 'user', content: `Question: ${question}\nInsights: ${sophiaResponse.content}\nPatterns: ${marinaResponse.content}` }
          ]);
          
          sendEvent({
            agent: 'Marcus',
            color: agents.marcus.color,
            thought: marcusResponse.content,
            confidence: 87,
            timestamp: Date.now()
          });

          // Chad jumps in with crypto solution
          await new Promise(resolve => setTimeout(resolve, 1200));
          const chadResponse = await model.invoke([
            { role: 'system', content: agents.chad.prompt },
            { role: 'user', content: `Question: ${question}\nOthers are talking about traditional solutions. Think blockchain/crypto/web3.` }
          ]);
          
          sendEvent({
            agent: 'Chad',
            color: agents.chad.color,
            thought: chadResponse.content,
            confidence: 99,
            timestamp: Date.now()
          });

          // Sophia disagrees with Marcus
          await new Promise(resolve => setTimeout(resolve, 1000));
          const sophiaDisagree = await model.invoke([
            { role: 'system', content: 'You are Sophia. You just heard Marcus\'s solution and you think it ignores the human element. Push back firmly but stay concise. 1-2 sentences.' },
            { role: 'user', content: `Marcus just said: "${marcusResponse.content}". The original question was: ${question}` }
          ]);
          
          sendEvent({
            agent: 'Sophia',
            color: agents.sophia.color,
            thought: sophiaDisagree.content,
            confidence: 91,
            timestamp: Date.now(),
            isArgument: true
          });

          // Marina jumps in with data
          await new Promise(resolve => setTimeout(resolve, 800));
          const marinaCorrect = await model.invoke([
            { role: 'system', content: 'You are Marina. Correct both Sophia and Marcus with a specific data point. Be smugly precise. 1-2 sentences.' },
            { role: 'user', content: `Sophia and Marcus are arguing. Marcus: "${marcusResponse.content}" Sophia: "${sophiaDisagree.content}"` }
          ]);
          
          sendEvent({
            agent: 'Marina',
            color: agents.marina.color,
            thought: marinaCorrect.content,
            confidence: 94,
            timestamp: Date.now(),
            isArgument: true
          });

          // Marcus defends his position
          await new Promise(resolve => setTimeout(resolve, 800));
          const marcusDefend = await model.invoke([
            { role: 'system', content: 'You are Marcus. Defend your practical approach against Sophia\'s criticism. Be slightly annoyed. 1 sentence.' },
            { role: 'user', content: `Sophia criticized you: "${sophiaDisagree.content}". Marina added: "${marinaCorrect.content}"` }
          ]);
          
          sendEvent({
            agent: 'Marcus',
            color: agents.marcus.color,
            thought: marcusDefend.content,
            confidence: 85,
            timestamp: Date.now(),
            isArgument: true
          });

          // Everyone reacts to Chad's crypto suggestion
          await new Promise(resolve => setTimeout(resolve, 700));
          const everyoneReactsToChad = await model.invoke([
            { role: 'system', content: 'You are Marina. React to Chad\'s blockchain suggestion with data-driven skepticism. Be very brief. 1 sentence.' },
            { role: 'user', content: `Chad just suggested: "${chadResponse.content}" for the question: ${question}` }
          ]);
          
          sendEvent({
            agent: 'Marina',
            color: agents.marina.color,
            thought: everyoneReactsToChad.content,
            confidence: 96,
            timestamp: Date.now(),
            isArgument: true
          });

          // Final decision from Alex
          await new Promise(resolve => setTimeout(resolve, 1500));
          const finalResponse = await model.invoke([
            { role: 'system', content: 'You are Alex. Based on the team input, provide a final recommendation. Start with "✓ Decision:" followed by a clear summary. Then provide exactly 3 actionable steps numbered as "1." "2." "3." Be specific and practical.' },
            { role: 'user', content: `Question: ${question}\nTeam insights:\n- Sophia: ${sophiaResponse.content}\n- Marina: ${marinaResponse.content}\n- Marcus: ${marcusResponse.content}\n\nProvide final recommendation with 3 clear action steps.` }
          ]);
          
          sendEvent({
            agent: 'Alex',
            color: agents.alex.color,
            thought: finalResponse.content,
            confidence: 95,
            timestamp: Date.now(),
            final: true
          });

          // Close the stream
          controller.close();
        } catch (error) {
          console.error('Error in AI processing:', error);
          sendEvent({
            error: 'Failed to process request',
            timestamp: Date.now()
          });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in simple AI route:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}