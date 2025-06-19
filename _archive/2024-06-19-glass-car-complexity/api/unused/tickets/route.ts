import { NextRequest, NextResponse } from 'next/server';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
// Enhanced system will handle processing separately

export async function POST(request: NextRequest) {
  try {
    const { title, description, customerEmail, customerName } = await request.json();

    // Create or find customer
    let customer = await prisma.customer.findUnique({
      where: { email: customerEmail || 'demo@example.com' },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email: customerEmail || 'demo@example.com',
          name: customerName || 'Demo User',
          company: 'Guest',
        },
      });
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        category: 'GENERAL',
        customerId: customer.id,
        tags: [],
      },
      include: {
        customer: true,
        messages: true,
      },
    });

    // Create initial message
    await prisma.message.create({
      data: {
        ticketId: ticket.id,
        content: description,
        customerId: customer.id,
      },
    });

    // Return created ticket - processing will be handled by enhanced system
    return NextResponse.json({
      ticket,
      message: 'Ticket created successfully. Use enhanced processing endpoint for AI processing.',
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    console.error('Error type:', error?.constructor?.name);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Return more detailed error info for debugging
    return NextResponse.json(
      {
        error: 'Failed to create ticket',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name || 'Unknown',
        stack:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        customer: true,
        assignedTo: true,
        messages: {
          include: {
            senderUser: true,
            customer: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}
