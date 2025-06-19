import { PrismaClient, TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleSeed() {
  console.log('🌱 Adding sample data...');

  try {
    // Create a sample customer
    const customer = await prisma.customer.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        email: 'demo@example.com',
        name: 'Demo User',
        company: 'Demo Vacation Rentals',
      },
    });

    console.log('✅ Created demo customer');

    // Add some knowledge base articles
    const kbArticles = [
      {
        title: 'Calendar Sync Troubleshooting Guide',
        content:
          'Problem: Calendar sync not working with property management system\n\nSolution: 1. Navigate to Settings > Calendar Sync\n2. Disconnect the affected calendar\n3. Wait 30 seconds\n4. Reconnect with new iCal URL\n5. Enable two-way sync\n6. Set refresh to 15 minutes',
        category: 'TECHNICAL',
        source: 'Support Team',
        tags: ['calendar', 'sync', 'ical', 'integration'],
        usageCount: 245,
        helpfulCount: 198,
      },
      {
        title: 'Guest Refund Policy Guidelines',
        content:
          'Problem: Guest requesting refund after stay\n\nSolution: Review cancellation policy. For Strict policy, refunds only for documented emergencies. Wifi/amenity issues must be reported during stay for refund eligibility. Offer future stay credit as compromise.',
        category: 'BILLING',
        source: 'Policy Team',
        tags: ['refund', 'policy', 'guest', 'cancellation'],
        usageCount: 189,
        helpfulCount: 156,
      },
      {
        title: 'Dynamic Pricing Setup',
        content:
          'Problem: How to set different prices for weekends and holidays\n\nSolution: Go to Settings > Pricing Rules. Create rule for Fri/Sat with +20-30% modifier. Add holiday rules with +50-100% increase. Set minimum stays for peak periods.',
        category: 'PRODUCT',
        source: 'Revenue Team',
        tags: ['pricing', 'dynamic', 'weekend', 'seasonal'],
        usageCount: 312,
        helpfulCount: 289,
      },
    ];

    for (const article of kbArticles) {
      await prisma.knowledgeBase.create({ data: article });
    }

    console.log(`✅ Created ${kbArticles.length} knowledge base articles`);

    // Create some recent tickets
    const tickets = [
      {
        title: 'iCal sync stopped updating',
        description:
          'My calendar sync with Airbnb stopped working yesterday. Getting double bookings.',
        status: TicketStatus.RESOLVED,
        priority: TicketPriority.HIGH,
        category: TicketCategory.TECHNICAL,
        customerId: customer.id,
        tags: ['calendar', 'sync', 'urgent'],
        sentiment: -0.3,
        confidence: 0.89,
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        title: 'Payout missing from last month',
        description: 'October payout of $3,250 has not arrived in my bank account yet.',
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.HIGH,
        category: TicketCategory.BILLING,
        customerId: customer.id,
        tags: ['payout', 'missing', 'payment'],
        sentiment: -0.5,
        confidence: 0.92,
      },
      {
        title: 'How to block dates for repairs',
        description:
          'Need to block March 15-20 for roof repairs. How do I do this across all platforms?',
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        category: TicketCategory.PRODUCT,
        customerId: customer.id,
        tags: ['calendar', 'block', 'maintenance'],
        sentiment: 0.1,
        confidence: 0.95,
      },
    ];

    for (const ticketData of tickets) {
      const ticket = await prisma.ticket.create({
        data: ticketData,
      });

      // Add initial message
      await prisma.message.create({
        data: {
          ticketId: ticket.id,
          customerId: customer.id,
          content: ticketData.description,
        },
      });

      // Add metrics for resolved tickets
      if (ticket.status === TicketStatus.RESOLVED) {
        await prisma.ticketMetrics.create({
          data: {
            ticketId: ticket.id,
            resolutionTime: 45,
            firstResponseTime: 5,
            handlingTime: 30,
            customerSatisfaction: 4.5,
            agentPerformance: 0.92,
            totalResponses: 3,
          },
        });
      }
    }

    console.log(`✅ Created ${tickets.length} sample tickets`);

    console.log('\n🎉 Sample data added successfully!');
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

simpleSeed().catch((error) => {
  console.error(error);
  process.exit(1);
});
