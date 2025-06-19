import { PrismaClient, UserRole, TicketStatus, TicketPriority, TicketCategory, AgentType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { VectorStore } from '../src/lib/db/vector-store';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});
const vectorStore = new VectorStore();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@rentalsupport.com' },
    update: {},
    create: {
      email: 'agent@rentalsupport.com',
      name: 'Rental Support Agent',
      password: hashedPassword,
      role: UserRole.AGENT,
    },
  });

  console.log('✅ Users created');

  // Create vacation rental customers (hosts and guests)
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: 'sarah.chen@email.com' },
      update: {},
      create: {
        email: 'sarah.chen@email.com',
        name: 'Sarah Chen',
        company: 'Host - Beach House Rentals',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'mike.johnson@email.com' },
      update: {},
      create: {
        email: 'mike.johnson@email.com',
        name: 'Mike Johnson',
        company: 'Guest',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'emily.davis@email.com' },
      update: {},
      create: {
        email: 'emily.davis@email.com',
        name: 'Emily Davis',
        company: 'Host - Mountain Retreats',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'alex.kumar@email.com' },
      update: {},
      create: {
        email: 'alex.kumar@email.com',
        name: 'Alex Kumar',
        company: 'Guest',
      },
    }),
  ]);

  console.log('✅ Customers created');

  // Create vacation rental tickets
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        title: 'Calendar Sync Not Working with Airbnb',
        description: 'I\'ve been trying to sync my calendar with Airbnb for the past 2 days but it keeps failing. I\'m getting double bookings because of this. I followed the iCal instructions but the sync shows "last updated 3 days ago". This is urgent as I have guests checking in tomorrow!',
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        category: TicketCategory.TECHNICAL,
        customerId: customers[0].id,
        sentiment: -0.4,
        tags: ['calendar-sync', 'integration', 'urgent'],
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Guest Demanding Full Refund - Claimed Misleading Photos',
        description: 'A guest who stayed last week is demanding a full refund claiming my photos were misleading. They stayed the entire 5 nights and are now threatening to post on social media. My cancellation policy is Strict and they cancelled after check-in. What are my options?',
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.URGENT,
        category: TicketCategory.BILLING,
        customerId: customers[1].id,
        assignedToId: agentUser.id,
        sentiment: -0.8,
        tags: ['refund-dispute', 'guest-complaint', 'escalation'],
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'How to Set Up Smart Pricing?',
        description: 'I\'m new to hosting and want to optimize my pricing. I heard about Smart Pricing but can\'t figure out how to enable it. Also, should I set different prices for weekends? My property is near the beach and I want to maximize summer bookings.',
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        category: TicketCategory.PRODUCT,
        customerId: customers[2].id,
        sentiment: 0.2,
        tags: ['pricing', 'new-host', 'smart-pricing'],
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Payout Missing for Last 3 Bookings',
        description: 'I haven\'t received payouts for my last 3 bookings totaling $2,400. The dashboard shows "paid" but nothing in my bank account. I\'ve checked with my bank and they confirm no pending deposits. This is affecting my mortgage payment. Please help urgently!',
        status: TicketStatus.RESOLVED,
        priority: TicketPriority.URGENT,
        category: TicketCategory.BILLING,
        customerId: customers[0].id,
        sentiment: -0.6,
        resolvedAt: new Date(),
        tags: ['payout-missing', 'financial-urgent', 'host-payment'],
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'App Crashes When Uploading Photos',
        description: 'Every time I try to upload photos for my new listing, the app crashes. I\'ve tried both iPhone and iPad. Already reinstalled the app twice. I need to get my listing live before the weekend. Can I upload photos another way?',
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        category: TicketCategory.TECHNICAL,
        customerId: customers[2].id,
        sentiment: -0.3,
        tags: ['app-bug', 'photo-upload', 'listing-creation'],
      },
    }),
  ]);

  console.log('✅ Tickets created');

  // Add some messages
  await Promise.all([
    prisma.message.create({
      data: {
        ticketId: tickets[0].id,
        content: tickets[0].description,
        customerId: customers[0].id,
      },
    }),
    prisma.message.create({
      data: {
        ticketId: tickets[1].id,
        content: tickets[1].description,
        customerId: customers[1].id,
      },
    }),
    prisma.message.create({
      data: {
        ticketId: tickets[1].id,
        content: 'I understand your frustration with this refund request. Since the guest stayed for the entire reservation and your cancellation policy is Strict, you are within your rights to deny the refund. However, let\'s explore some options to resolve this amicably and protect your reputation...',
        senderId: agentUser.id,
        agentType: AgentType.BILLING,
      },
    }),
  ]);

  console.log('✅ Messages created');

  // Add vacation rental knowledge base articles
  const knowledgeArticles = [
    {
      title: 'Calendar Sync Setup Guide',
      content: 'To sync calendars: 1) Go to Calendar settings, 2) Click "Import Calendar", 3) Copy iCal link from other platform, 4) Paste and name your calendar, 5) Set sync frequency (recommend every 2 hours). Troubleshooting: Clear cache, regenerate iCal links if sync fails after 24 hours.',
      category: 'technical',
      source: 'host-guide',
      sourceUrl: 'https://support.platform.com/calendar-sync',
      tags: ['calendar-sync', 'ical', 'double-booking', 'integration'],
    },
    {
      title: 'Refund Policy Guidelines',
      content: 'Refund eligibility depends on: 1) Cancellation policy (Flexible: full refund 24h before, Moderate: full refund 5 days before, Strict: 50% refund 1 week before), 2) Extenuating circumstances, 3) Host cancellations always get full refund. Service fees typically non-refundable except for host cancellations.',
      category: 'billing',
      source: 'policy-guide',
      sourceUrl: 'https://support.platform.com/refund-policy',
      tags: ['refunds', 'cancellation-policy', 'billing', 'guest-protection'],
    },
    {
      title: 'Smart Pricing Best Practices',
      content: 'Smart Pricing automatically adjusts rates based on demand. Setup: 1) Set base price, 2) Set minimum/maximum limits, 3) Enable weekend pricing (+20-30% recommended), 4) Add seasonal rules. Tips: Price 10% below market initially for reviews, increase gradually as you get bookings.',
      category: 'product',
      source: 'pricing-guide',
      sourceUrl: 'https://support.platform.com/smart-pricing',
      tags: ['pricing', 'smart-pricing', 'revenue-optimization', 'host-tips'],
    },
    {
      title: 'Payout Schedule and Issues',
      content: 'Standard payout timeline: Released 24 hours after guest check-in, arrives in 3-5 business days (ACH) or 1-2 days (PayPal). Common issues: 1) Incorrect bank details, 2) Minimum payout threshold ($100), 3) Tax form required, 4) Account verification pending. Check Payout Preferences for status.',
      category: 'billing',
      source: 'payout-guide',
      sourceUrl: 'https://support.platform.com/payouts',
      tags: ['payouts', 'host-earnings', 'payment-methods', 'financial'],
    },
    {
      title: 'Photo Upload Requirements',
      content: 'Photo specs: Minimum 1024x683px, max 10MB, JPEG/PNG only. Tips: 1) Use landscape orientation, 2) Natural lighting preferred, 3) Show accurate room sizes, 4) Include all amenities shown, 5) Update seasonally. If app fails, use desktop browser or email photos@support.com.',
      category: 'technical',
      source: 'listing-guide',
      sourceUrl: 'https://support.platform.com/photo-requirements',
      tags: ['photos', 'listing-creation', 'technical-requirements', 'host-tips'],
    },
  ];

  for (const article of knowledgeArticles) {
    try {
      await vectorStore.addDocument(article);
      console.log(`✅ Added knowledge article: ${article.title}`);
    } catch (error) {
      console.error(`❌ Failed to add article ${article.title}:`, error);
    }
  }

  // Create some metrics
  await prisma.ticketMetrics.create({
    data: {
      ticketId: tickets[3].id,
      resolutionTime: 7200, // 2 hours
      handlingTime: 1800, // 30 minutes
      customerSatisfaction: 4.8,
      agentPerformance: 0.92,
      firstResponseTime: 300, // 5 minutes
      totalResponses: 4,
    },
  });

  console.log('✅ Metrics created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });