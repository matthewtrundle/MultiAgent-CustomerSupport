import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const { ticketId } = await request.json();
    
    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    // Verify ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        customer: true,
        messages: true,
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Create a ReadableStream for Server-Sent Events
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Process ticket in background
    processWithRealAgents(ticketId, writer, encoder);

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in process-realtime:', error);
    return NextResponse.json(
      { error: 'Failed to process ticket' },
      { status: 500 }
    );
  }
}

async function processWithRealAgents(ticketId: string, writer: any, encoder: any) {
  const orchestrator = new AgentOrchestrator();
  
  try {
    // Send initial event
    await sendEvent(writer, encoder, {
      type: 'processing-start',
      data: {
        message: 'Initializing AI agents...',
        timestamp: new Date(),
      }
    });

    // Get ticket details
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        customer: true,
        messages: true,
      }
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Stream router agent processing
    await sendEvent(writer, encoder, {
      type: 'agent-start',
      agent: 'Router Agent',
      data: {
        message: 'Analyzing ticket content and categorizing issue...',
        timestamp: new Date(),
      }
    });

    // Process with orchestrator (this makes real AI calls)
    const result = await orchestrator.processTicket(ticketId);

    if (!result.success) {
      throw new Error(result.error || 'Processing failed');
    }

    // Send completion event
    await sendEvent(writer, encoder, {
      type: 'processing-complete',
      data: {
        success: true,
        response: result.response,
        agentType: result.agentType,
        confidence: result.confidence,
        processingTime: new Date().getTime() - ticket.createdAt.getTime(),
        timestamp: new Date(),
      }
    });

  } catch (error) {
    console.error('Error in agent processing:', error);
    await sendEvent(writer, encoder, {
      type: 'error',
      data: {
        message: 'Error processing ticket',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    });
  } finally {
    await writer.close();
  }
}

async function sendEvent(writer: any, encoder: any, data: any) {
  const event = `data: ${JSON.stringify(data)}\n\n`;
  await writer.write(encoder.encode(event));
}