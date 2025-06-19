import { PrismaClient, TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';
import { faker } from '@faker-js/faker';

// Create a new Prisma client instance for seeding to avoid prepared statement conflicts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Top property management issues categorized
const propertyManagementIssues = {
  TECHNICAL: [
    {
      title: "Calendar sync broken with Airbnb",
      description: "My iCal sync stopped working 2 days ago. I've had 3 double bookings already. The calendar URL hasn't changed but Airbnb bookings aren't showing up in my property management system.",
      keywords: ["calendar", "sync", "ical", "airbnb", "double booking"],
      resolution: "Reset iCal sync by regenerating calendar URLs in both systems. Enable two-way sync and set refresh interval to 15 minutes."
    },
    {
      title: "Can't upload property photos",
      description: "Getting error 'File too large' when uploading photos, but they're only 2MB each. Tried different browsers and clearing cache.",
      keywords: ["upload", "photos", "error", "file size"],
      resolution: "Resize images to under 5MB, ensure format is JPEG/PNG. Use bulk upload tool for multiple files."
    },
    {
      title: "Smart lock integration failing",
      description: "August smart lock won't generate guest codes automatically. API connection shows as active but codes aren't being sent to guests.",
      keywords: ["smart lock", "august", "integration", "guest codes", "api"],
      resolution: "Reauthorize August API connection, ensure lock firmware is updated, check timezone settings match property location."
    },
    {
      title: "Channel manager sync delays",
      description: "Updates to pricing taking 4-6 hours to reflect on OTAs. Need real-time sync for dynamic pricing to work.",
      keywords: ["channel manager", "sync", "pricing", "delay", "ota"],
      resolution: "Switch to webhook-based updates instead of polling. Contact channel manager for priority sync queue access."
    },
    {
      title: "Automated messages not sending",
      description: "Guest check-in instructions aren't being sent automatically 24 hours before arrival. Manual sending works fine.",
      keywords: ["automated", "messages", "email", "check-in", "trigger"],
      resolution: "Verify message triggers are active, check spam filters, ensure guest email addresses are valid."
    }
  ],
  BILLING: [
    {
      title: "Missing payout for last month",
      description: "Haven't received my payout for October bookings. Dashboard shows $3,400 pending but bank account hasn't received anything.",
      keywords: ["payout", "payment", "missing", "bank", "pending"],
      resolution: "Verify bank account details, check for payout holds due to guest disputes, contact finance team for manual release."
    },
    {
      title: "Double charged platform fees",
      description: "Was charged 15% commission on a direct booking. This should only apply to OTA bookings, not my direct website bookings.",
      keywords: ["commission", "fees", "double charge", "direct booking"],
      resolution: "Submit fee adjustment request with booking source proof. Direct bookings exempt from platform fees."
    },
    {
      title: "Security deposit not released",
      description: "Guest checked out 14 days ago with no damage, but $500 security deposit still showing as held.",
      keywords: ["security deposit", "release", "held", "refund"],
      resolution: "Auto-release after 14 days if no claim filed. Manual release available in booking details > financial tab."
    },
    {
      title: "Wrong tax rate applied",
      description: "System charging 6% tax but my county requires 10.5% for short-term rentals. Getting warnings from tax authority.",
      keywords: ["tax", "rate", "compliance", "settings"],
      resolution: "Update property tax settings with correct county/state rates. Enable automatic tax table updates."
    },
    {
      title: "Refund not processing",
      description: "Issued full refund to guest 5 days ago due to emergency cancellation. Guest says they haven't received it.",
      keywords: ["refund", "processing", "cancellation", "guest"],
      resolution: "Refunds take 5-10 business days. Provide guest with refund transaction ID for their bank reference."
    }
  ],
  PRODUCT: [
    {
      title: "How to set up dynamic pricing",
      description: "Want to charge more for weekends and holidays. Also need minimum stay requirements to change based on season.",
      keywords: ["pricing", "dynamic", "seasonal", "minimum stay", "rules"],
      resolution: "Use pricing rules engine: Settings > Pricing > Add Rule. Set date ranges, day-of-week multipliers, and minimum stay requirements."
    },
    {
      title: "Can't find review response feature",
      description: "Guest left unfair review about noise from construction next door. Where do I respond to reviews publicly?",
      keywords: ["review", "response", "reply", "guest", "public"],
      resolution: "Go to Reviews > Guest Reviews, click 'Respond' under review. Response visible publicly after 24 hour cooling period."
    },
    {
      title: "Need to block dates for maintenance",
      description: "Have contractors coming for roof repair March 15-20. How do I block these dates across all channels?",
      keywords: ["block", "dates", "maintenance", "calendar", "availability"],
      resolution: "Calendar > Multi-select dates > Block Dates. Select 'Sync to all channels' to prevent bookings across platforms."
    },
    {
      title: "Setting up cleaning fee variations",
      description: "Want to charge different cleaning fees based on length of stay. Longer stays should have lower cleaning fee per night.",
      keywords: ["cleaning fee", "pricing", "length of stay", "fees"],
      resolution: "Use fee rules: Settings > Fees > Add Rule. Create tiers based on stay length with different fee amounts."
    },
    {
      title: "Instant book settings confusion",
      description: "Want instant book but only for guests with good reviews. How do I set requirements?",
      keywords: ["instant book", "requirements", "guest", "verification", "settings"],
      resolution: "Enable Instant Book with requirements: verified ID, positive reviews, no negative reviews. Set in Booking Settings > Instant Book."
    }
  ],
  GENERAL: [
    {
      title: "New to hosting - where to start?",
      description: "Just listed my first property. What are the most important things I should set up first?",
      keywords: ["new host", "setup", "getting started", "checklist"],
      resolution: "Follow onboarding checklist: 1) House rules 2) Pricing 3) Photos 4) Automated messages 5) Calendar sync 6) Insurance verification."
    },
    {
      title: "Best practices for 5-star reviews",
      description: "Getting mostly 4-star reviews. What are other hosts doing to consistently get 5 stars?",
      keywords: ["reviews", "ratings", "best practices", "improvement"],
      resolution: "Key factors: accurate listing, fast communication (<1hr), local recommendations, welcome gift, proactive issue resolution."
    },
    {
      title: "Seasonal pricing strategy help",
      description: "Beach property - how much should I increase rates for summer? What about holiday weekends?",
      keywords: ["seasonal", "pricing", "strategy", "rates", "optimization"],
      resolution: "Analyze: local events, historical occupancy, competitor rates. Typical: 30-50% summer increase, 75-100% major holidays."
    },
    {
      title: "Multi-property management tips",
      description: "Now managing 5 properties. Getting overwhelmed with different check-in times and cleaning schedules.",
      keywords: ["multi-property", "management", "scheduling", "organization"],
      resolution: "Use team management features: assign roles, centralize calendars, standardize check-in/out times, batch cleaning schedules."
    },
    {
      title: "Guest screening best practices",
      description: "Had issues with party guests. How can I better screen guests before accepting bookings?",
      keywords: ["screening", "guests", "party", "verification", "safety"],
      resolution: "Require: verified ID, profile photo, previous reviews. Ask purpose of stay. Use instant book requirements. Consider security deposits."
    }
  ],
  COMPLAINT: [
    {
      title: "Guest damaged property - no response",
      description: "Guest broke AC unit and left trash everywhere. Filed damage claim 5 days ago but no response from support.",
      keywords: ["damage", "claim", "guest", "property", "support"],
      resolution: "Escalate via priority support. Document with photos within 14 days. Claims team reviews within 7 business days."
    },
    {
      title: "Discriminatory guest review",
      description: "Guest left review with discriminatory language about my race. This violates platform policies.",
      keywords: ["discrimination", "review", "policy", "violation", "removal"],
      resolution: "Report review for policy violation. Discriminatory content removed within 24-48 hours. Consider blocking guest."
    },
    {
      title: "Neighbor complaints about guests",
      description: "Received 3 noise complaints this month. City threatening to revoke my permit. Need help with guest behavior.",
      keywords: ["noise", "complaints", "neighbors", "permit", "city"],
      resolution: "Implement: noise monitors, strict house rules, local contact person, guest agreement acknowledgment. Consider quiet hours enforcement."
    },
    {
      title: "Fraudulent booking attempt",
      description: "Guest trying to pay outside platform and asking for my personal email. Seems like a scam.",
      keywords: ["fraud", "scam", "payment", "platform", "security"],
      resolution: "Never accept payment outside platform. Report user immediately. All communication through platform messaging only."
    },
    {
      title: "Unfair platform policy enforcement",
      description: "Account restricted for 'multiple cancellations' but they were all due to COVID. This seems unfair.",
      keywords: ["policy", "restriction", "cancellation", "covid", "appeal"],
      resolution: "Submit appeal with documentation of extenuating circumstances. COVID-related cancellations eligible for policy exceptions."
    }
  ]
};

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data using raw SQL to avoid prepared statement issues
    await prisma.$executeRaw`TRUNCATE TABLE "Message" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "TicketMetrics" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "TicketHandling" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "AgentResponse" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Ticket" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Customer" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "KnowledgeBase" CASCADE`;
    
    console.log('✅ Cleared existing data');

    // Create customers
    const customers = [];
    for (let i = 0; i < 50; i++) {
      const customer = await prisma.customer.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          company: faker.company.name(),
        }
      });
      customers.push(customer);
    }
    console.log(`✅ Created ${customers.length} customers`);

    // Create knowledge base articles from issues
    const kbArticles = [];
    for (const [category, issues] of Object.entries(propertyManagementIssues)) {
      for (const issue of issues) {
        const article = await prisma.knowledgeBase.create({
          data: {
            title: issue.title,
            content: `Problem: ${issue.description}\n\nSolution: ${issue.resolution}`,
            category: category,
            source: 'Historical Tickets',
            tags: issue.keywords,
            usageCount: Math.floor(Math.random() * 100),
            helpfulCount: Math.floor(Math.random() * 50),
          }
        });
        kbArticles.push(article);
      }
    }
    console.log(`✅ Created ${kbArticles.length} knowledge base articles`);

    // Create tickets with realistic scenarios
    const tickets = [];
    const statuses = [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED];
    const priorities = [TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH, TicketPriority.URGENT];
    
    // Create 200 tickets based on the issue templates
    for (let i = 0; i < 200; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const categoryKeys = Object.keys(propertyManagementIssues) as TicketCategory[];
      const category = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
      const categoryIssues = propertyManagementIssues[category];
      const issueTemplate = categoryIssues[Math.floor(Math.random() * categoryIssues.length)];
      
      // Add some variation to the template
      const variation = Math.random();
      let title = issueTemplate.title;
      let description = issueTemplate.description;
      
      if (variation > 0.7) {
        title = `URGENT: ${title}`;
        description = `${description}\n\nThis is affecting multiple properties and costing me bookings!`;
      } else if (variation > 0.4) {
        title = `Help with ${title.toLowerCase()}`;
        description = `Hi, I'm having trouble. ${description}\n\nThanks for your help!`;
      }
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = title.includes('URGENT') ? TicketPriority.URGENT : 
                      priorities[Math.floor(Math.random() * priorities.length)];
      
      const ticket = await prisma.ticket.create({
        data: {
          title,
          description,
          status,
          priority,
          category,
          customerId: customer.id,
          tags: issueTemplate.keywords,
          sentiment: variation > 0.7 ? -0.5 : variation > 0.4 ? 0 : 0.3,
          confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
          createdAt: faker.date.recent({ days: 30 }),
          resolvedAt: status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED 
            ? faker.date.recent({ days: 7 }) 
            : null,
        }
      });
      
      // Create initial message
      await prisma.message.create({
        data: {
          ticketId: ticket.id,
          customerId: customer.id,
          content: description,
          createdAt: ticket.createdAt,
        }
      });
      
      // For resolved tickets, add resolution messages
      if (status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED) {
        await prisma.message.create({
          data: {
            ticketId: ticket.id,
            content: `Thank you for contacting support. ${issueTemplate.resolution}`,
            agentType: category === 'TECHNICAL' ? 'TECHNICAL' : 
                      category === 'BILLING' ? 'BILLING' : 
                      category === 'PRODUCT' ? 'PRODUCT' : 'ROUTER',
            isInternal: false,
            createdAt: new Date(ticket.createdAt.getTime() + 1000 * 60 * 30), // 30 min later
          }
        });
        
        // Add metrics for resolved tickets
        await prisma.ticketMetrics.create({
          data: {
            ticketId: ticket.id,
            resolutionTime: Math.floor(Math.random() * 180) + 30, // 30-210 minutes
            firstResponseTime: Math.floor(Math.random() * 30) + 5, // 5-35 minutes
            handlingTime: Math.floor(Math.random() * 60) + 20, // 20-80 minutes
            customerSatisfaction: Math.random() * 2 + 3, // 3-5 stars
            agentPerformance: Math.random() * 0.3 + 0.7, // 0.7-1.0
            totalResponses: Math.floor(Math.random() * 5) + 2, // 2-7 responses
          }
        });
      }
      
      tickets.push(ticket);
    }
    
    console.log(`✅ Created ${tickets.length} tickets with messages`);
    
    // Create some agent responses for learning
    const agentTypes = ['ROUTER', 'TECHNICAL', 'BILLING', 'PRODUCT', 'QA'];
    for (const agentType of agentTypes) {
      for (const [category, issues] of Object.entries(propertyManagementIssues)) {
        for (const issue of issues) {
          await prisma.agentResponse.create({
            data: {
              agentType: agentType as any,
              ticketCategory: category as TicketCategory,
              query: issue.description,
              response: issue.resolution,
              confidence: Math.random() * 0.2 + 0.8, // 0.8-1.0
              successful: true,
            }
          });
        }
      }
    }
    console.log('✅ Created agent response history');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:
    - ${customers.length} customers
    - ${tickets.length} tickets
    - ${kbArticles.length} knowledge base articles
    - ${agentTypes.length * Object.keys(propertyManagementIssues).length * 5} agent responses`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });