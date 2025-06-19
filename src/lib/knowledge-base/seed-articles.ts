// Comprehensive knowledge base articles for vacation rental platform

export const knowledgeBaseArticles = [
  // Calendar & Sync Issues (10 articles)
  {
    title: 'Complete Calendar Sync Troubleshooting Guide',
    category: 'TECHNICAL',
    tags: ['calendar', 'sync', 'ical', 'integration'],
    content: `Problem: Calendar sync not working across platforms

Solution:
1. Navigate to Settings > Calendar Sync
2. Disconnect the affected calendar
3. Wait 30 seconds for full disconnection
4. Click "Connect Calendar" and generate new iCal URL
5. Enable "Two-way sync" option
6. Set refresh interval to 15 minutes
7. Test with a sample booking

Common Issues:
- Old iCal URLs after v2.1 update: Use legacy endpoint restoration
- Timezone mismatches: Ensure property and calendar timezones match
- Blocked dates not syncing: Check blackout date settings

Success Rate: 94% resolution within 10 minutes`,
    usageCount: 2451,
    helpfulCount: 2305,
  },
  {
    title: 'iCal URL Format Changes After v2.1 Update',
    category: 'TECHNICAL',
    tags: ['calendar', 'ical', 'update', 'v2.1'],
    content: `Critical Update: v2.1 changed iCal URL format

Affected Users: Hosts with legacy integrations (pre-2023)

Immediate Fix:
1. Access Calendar Settings
2. Click "Migrate to New Format"
3. System will auto-generate compatible URLs
4. Update all connected platforms

Workaround if migration fails:
- Use legacy endpoint: /api/v1/calendar/ical/{property-id}
- Add parameter: ?format=legacy

Long-term Solution: Automated migration tool releasing in 48 hours`,
    usageCount: 1847,
    helpfulCount: 1756,
  },
  {
    title: 'Timezone Synchronization Issues',
    category: 'TECHNICAL',
    tags: ['calendar', 'timezone', 'sync'],
    content: `Problem: Bookings showing at wrong times

Root Cause: Timezone mismatch between platforms

Solution:
1. Go to Property Settings > Location
2. Verify timezone is correct
3. Navigate to Calendar Sync
4. Enable "Force timezone conversion"
5. Select source timezone for each calendar
6. Save and re-sync

Prevention: Always set property timezone before connecting calendars`,
    usageCount: 983,
    helpfulCount: 921,
  },
  {
    title: 'Double Booking Prevention Guide',
    category: 'TECHNICAL',
    tags: ['calendar', 'double-booking', 'sync'],
    content: `Critical: Preventing double bookings

Setup:
1. Enable "Instant sync" (Settings > Calendar)
2. Set buffer time between bookings (recommended: 1 day)
3. Configure booking lead time (minimum 2 hours)
4. Enable "Conflict detection alerts"

If double booking occurs:
1. Contact both guests immediately
2. Offer alternative dates or properties
3. If needed, arrange alternative accommodation
4. Document for insurance/platform protection

Prevention success rate: 99.2% with proper setup`,
    usageCount: 1562,
    helpfulCount: 1534,
  },
  {
    title: 'Multi-Property Calendar Management',
    category: 'TECHNICAL',
    tags: ['calendar', 'multi-property', 'bulk'],
    content: `Managing calendars for 10+ properties

Best Practices:
1. Use bulk calendar operations
2. Create property groups by location/type
3. Set up master calendar view
4. Enable cross-property conflict detection

Bulk Operations:
- Select multiple properties: Cmd/Ctrl + Click
- Apply settings to group: Actions > Apply to Selected
- Bulk import/export: Tools > Bulk Calendar Operations

Time-saving: 80% reduction in management time`,
    usageCount: 743,
    helpfulCount: 718,
  },

  // Payment & Billing Issues (10 articles)
  {
    title: 'Refund Policy Enforcement Guide',
    category: 'BILLING',
    tags: ['refund', 'policy', 'cancellation'],
    content: `Handling refund requests professionally

Policy Types:
- Flexible: Full refund up to 24 hours before check-in
- Moderate: 50% refund up to 5 days before
- Strict: No refund except first 48 hours after booking

Processing Refunds:
1. Review booking details and cancellation date
2. Check applicable policy at time of booking
3. Calculate refund amount based on policy
4. Process via Payments > Refunds
5. Include service fee handling
6. Send confirmation to guest

Template responses available in Templates section`,
    usageCount: 2187,
    helpfulCount: 2098,
  },
  {
    title: 'Payment Processing Delays Resolution',
    category: 'BILLING',
    tags: ['payment', 'payout', 'delay'],
    content: `Common causes of payment delays:

1. Incomplete tax information
   - Solution: Complete W-9/W-8 forms
   - Location: Account > Tax Information

2. Bank account verification pending
   - Solution: Confirm micro-deposits
   - Timeline: 2-3 business days

3. Payout schedule settings
   - Check: Payments > Payout Preferences
   - Options: Daily, weekly, monthly

4. Security hold (unusual activity)
   - Contact support with booking details
   - Typical resolution: 24-48 hours

Average resolution time: 2 business days`,
    usageCount: 1643,
    helpfulCount: 1558,
  },
  {
    title: 'Service Fee Structure Explanation',
    category: 'BILLING',
    tags: ['fees', 'service-fee', 'pricing'],
    content: `Understanding platform fees:

Host Service Fee: 3% of booking subtotal
- Covers: Payment processing, customer support, platform maintenance
- When charged: Upon successful booking

Guest Service Fee: 10-14% (varies by booking total)
- Covers: Customer service, platform features
- Displayed before booking confirmation

Fee Reductions Available:
- Annual hosts (100+ nights): 0.5% reduction
- Superhost status: 0.5% reduction
- Direct booking tool users: Special rates

Calculate your fees: Tools > Fee Calculator`,
    usageCount: 1892,
    helpfulCount: 1745,
  },
  {
    title: 'Handling Damage Claims and Security Deposits',
    category: 'BILLING',
    tags: ['damage', 'security-deposit', 'claims'],
    content: `Processing damage claims effectively:

Timeline: Must file within 14 days of checkout

Required Documentation:
1. Photos of damage (before/after if available)
2. Repair estimates or receipts
3. Guest communication
4. Check-in inspection report

Filing Process:
1. Go to Reservations > Past Bookings
2. Select booking > File Damage Claim
3. Upload all documentation
4. Submit for review

Resolution timeline: 5-7 business days
Success rate with proper documentation: 87%`,
    usageCount: 1234,
    helpfulCount: 1156,
  },
  {
    title: 'Currency Conversion and International Payments',
    category: 'BILLING',
    tags: ['currency', 'international', 'conversion'],
    content: `Managing international bookings:

Automatic Currency Display:
- Guest sees prices in their local currency
- You receive payment in your payout currency
- Conversion at market rate + 2% fee

Setting Payout Currency:
1. Account > Payment Preferences
2. Select preferred currency
3. Update bank details if needed

Multi-currency Strategy:
- List prices in major booking currency
- Enable "Smart Pricing" for automatic adjustments
- Consider seasonal rate variations

Tax Implications: Consult local tax advisor`,
    usageCount: 892,
    helpfulCount: 834,
  },

  // Product & Feature Guides (10 articles)
  {
    title: 'Smart Pricing Setup and Optimization',
    category: 'PRODUCT',
    tags: ['pricing', 'smart-pricing', 'revenue'],
    content: `Maximize revenue with Smart Pricing:

Initial Setup:
1. Navigate to Listing > Pricing
2. Set base price (your minimum acceptable rate)
3. Enable Smart Pricing toggle
4. Set minimum and maximum prices
5. Configure special events calendar

Optimization Tips:
- Set min price at 80% of desired average
- Max price at 200-300% for special events
- Review weekly and adjust based on performance
- Use "Price Tips" for market insights

Average revenue increase: 23% vs fixed pricing`,
    usageCount: 2341,
    helpfulCount: 2234,
  },
  {
    title: 'Creating High-Converting Listing Descriptions',
    category: 'PRODUCT',
    tags: ['listing', 'description', 'conversion'],
    content: `Write descriptions that book:

Structure:
1. Headline: Unique selling proposition
2. Opening: Paint a picture (2-3 sentences)
3. Space overview: Layout and capacity
4. Amenities: Highlight top 5-7
5. Location benefits: Walking distance to attractions
6. House rules: Clear but welcoming

Proven Formulas:
- "Perfect for [target guest] seeking [experience]"
- Include sensory details (views, sounds, comfort)
- Use bullet points for easy scanning
- End with call to action

Conversion increase: 34% with optimized descriptions`,
    usageCount: 1876,
    helpfulCount: 1798,
  },
  {
    title: 'Professional Photography Guidelines',
    category: 'PRODUCT',
    tags: ['photos', 'listing', 'photography'],
    content: `Photo requirements for maximum bookings:

Must-Have Shots:
1. Exterior (day and dusk)
2. Living areas (wide angle)
3. All bedrooms 
4. Bathrooms
5. Kitchen
6. Unique features/amenities
7. View from property
8. Local attractions

Technical Tips:
- Minimum 20 photos, optimal 30-40
- Landscape orientation
- Natural lighting preferred
- HDR for challenging lighting
- Stage each room
- Update seasonally

Properties with 30+ photos book 45% more`,
    usageCount: 1654,
    helpfulCount: 1589,
  },
  {
    title: 'Instant Book Settings and Strategy',
    category: 'PRODUCT',
    tags: ['instant-book', 'booking', 'settings'],
    content: `Instant Book configuration for success:

Benefits:
- 35% more bookings on average
- Better search ranking
- Reduced response time pressure
- Automated guest screening

Recommended Settings:
1. Enable for guests with verified ID
2. Require profile photo
3. Set minimum account age (30 days)
4. Enable positive review requirement
5. Configure pre-booking message

Risk Management:
- Use security deposit
- Clear house rules
- Automated check-in instructions
- 24-hour cancellation buffer

Hosts using Instant Book earn 28% more annually`,
    usageCount: 1423,
    helpfulCount: 1367,
  },
  {
    title: 'Minimum Stay Strategy Guide',
    category: 'PRODUCT',
    tags: ['minimum-stay', 'booking', 'strategy'],
    content: `Optimize minimum stay requirements:

General Guidelines:
- Weekdays: 1-2 nights
- Weekends: 2-3 nights  
- Peak season: 3-7 nights
- Holidays: 4-7 nights

Advanced Strategies:
1. Gap filling: Reduce min stay for gaps
2. Last-minute: Lower requirements 7 days out
3. Seasonal adjustment: Longer stays in low season
4. Event-based: Increase during local events

Tools:
- Enable "Smart minimum stays"
- Use rule sets for automation
- Review performance monthly

Proper settings increase revenue by 18%`,
    usageCount: 1234,
    helpfulCount: 1189,
  },

  // Property Management (10 articles)
  {
    title: 'Automated Check-in Process Setup',
    category: 'GENERAL',
    tags: ['check-in', 'automation', 'keyless'],
    content: `Streamline check-ins with automation:

Digital Check-in Setup:
1. Property Settings > Check-in Method
2. Select: Self check-in
3. Configure keyless entry (smart lock or lockbox)
4. Create check-in guide with photos
5. Set up automated messaging

Message Automation Timeline:
- Booking confirmation: Instant
- Pre-arrival info: 7 days before
- Check-in details: 24 hours before
- Welcome message: At check-in time
- Checkout reminder: Morning of

Guest satisfaction increase: 43% with automated check-in`,
    usageCount: 1876,
    helpfulCount: 1812,
  },
  {
    title: 'Cleaning Turnover Optimization',
    category: 'GENERAL',
    tags: ['cleaning', 'turnover', 'efficiency'],
    content: `Efficient cleaning between guests:

Standard Checklist:
□ Strip all bedding and towels
□ Disinfect high-touch surfaces
□ Clean kitchen thoroughly
□ Sanitize bathrooms
□ Vacuum/mop all floors
□ Restock supplies
□ Check for damages
□ Reset thermostat and electronics

Time-Saving Tips:
- Use cleaning caddies per room
- Keep spare linens on-site
- Implement 2-person team system
- Use professional-grade equipment

Average turnover time: 2-3 hours for 2BR property`,
    usageCount: 1543,
    helpfulCount: 1498,
  },
  {
    title: 'Guest Communication Templates',
    category: 'GENERAL',
    tags: ['communication', 'templates', 'messaging'],
    content: `Essential message templates:

Pre-Arrival:
"Hi [Guest]! Looking forward to hosting you at [Property]. 
Check-in is at [time]. You'll receive detailed instructions 
24 hours before arrival. Any questions?"

Check-in Instructions:
"Welcome! Your access code is [code]. 
WiFi: [network/password]
Parking: [details]
Full guide in the app. Enjoy your stay!"

Issue Response:
"I'm sorry to hear about [issue]. Let me help resolve this 
immediately. [Solution steps]. I'll follow up within [timeframe]."

Save 45 minutes daily with templates`,
    usageCount: 2103,
    helpfulCount: 2045,
  },
  {
    title: 'Seasonal Maintenance Schedule',
    category: 'GENERAL',
    tags: ['maintenance', 'seasonal', 'property-care'],
    content: `Year-round property maintenance:

Spring (March-May):
- HVAC service and filter change
- Gutter cleaning
- Deck/patio power washing
- Garden preparation
- Check outdoor furniture

Summer (June-August):
- AC efficiency check
- Pool/hot tub maintenance
- Pest control treatment
- Touch-up exterior paint

Fall (September-November):
- Heating system check
- Weatherproofing
- Leaf management
- Outdoor furniture storage

Winter (December-February):
- Pipe insulation check
- Snow removal setup
- Emergency kit update
- Deep carpet cleaning

Preventive maintenance reduces issues by 67%`,
    usageCount: 987,
    helpfulCount: 954,
  },
  {
    title: 'Local Area Guide Creation',
    category: 'GENERAL',
    tags: ['local-guide', 'amenities', 'guest-experience'],
    content: `Create a 5-star local guide:

Essential Sections:
1. Getting Around
   - Parking info
   - Public transport
   - Bike/scooter rentals

2. Dining
   - Walking distance (5)
   - Delivery options (5)
   - Special dietary options

3. Groceries & Essentials
   - Nearest grocery
   - Pharmacy
   - Convenience store

4. Activities
   - Top 10 attractions
   - Hidden gems
   - Seasonal events

5. Emergency Info
   - Hospital
   - Urgent care
   - Property manager

Digital guide increases 5-star reviews by 31%`,
    usageCount: 1345,
    helpfulCount: 1298,
  },

  // Advanced Features (10 articles)
  {
    title: 'API Integration for Property Managers',
    category: 'TECHNICAL',
    tags: ['api', 'integration', 'automation'],
    content: `Connect your PMS via API:

Prerequisites:
- Business account required
- API key from Settings > Developer
- HTTPS endpoint for webhooks

Basic Integration Steps:
1. Generate API credentials
2. Configure webhook endpoints
3. Test with sandbox environment
4. Implement error handling
5. Go live with rate limiting

Key Endpoints:
- GET /properties - List all properties
- POST /bookings - Create booking
- PUT /calendar - Update availability
- GET /messages - Retrieve guest messages

Rate Limits: 1000 requests/hour`,
    usageCount: 567,
    helpfulCount: 542,
  },
  {
    title: 'Revenue Analytics and Reporting',
    category: 'PRODUCT',
    tags: ['analytics', 'revenue', 'reporting'],
    content: `Understanding your performance data:

Key Metrics:
- Occupancy Rate: Booked nights / Available nights
- ADR: Average Daily Rate
- RevPAR: Revenue per Available Room
- Booking Lead Time: Days between booking and check-in

Accessing Reports:
1. Analytics > Revenue Dashboard
2. Select date range
3. Filter by property
4. Export as CSV/PDF

Optimization Insights:
- Compare to market average
- Identify booking patterns
- Spot seasonal trends
- Price optimization opportunities

Data-driven hosts earn 41% more`,
    usageCount: 1123,
    helpfulCount: 1089,
  },
  {
    title: 'Multi-Channel Distribution Strategy',
    category: 'PRODUCT',
    tags: ['distribution', 'channels', 'sync'],
    content: `Maximize bookings across platforms:

Channel Strategy:
1. Primary: Direct bookings (your website)
2. OTAs: Airbnb, VRBO, Booking.com
3. Niche: Luxury sites, corporate housing

Synchronization Setup:
- Use channel manager integration
- Set platform-specific pricing
- Maintain consistent availability
- Unified messaging system

Avoiding Conflicts:
- Real-time sync mandatory
- Buffer time between bookings
- Platform-specific rules
- Cancellation policy alignment

Multi-channel hosts see 64% more bookings`,
    usageCount: 892,
    helpfulCount: 863,
  },
  {
    title: 'Guest Screening and Verification',
    category: 'GENERAL',
    tags: ['screening', 'verification', 'security'],
    content: `Protect your property with screening:

Verification Levels:
1. Basic: Email and phone
2. Standard: Government ID
3. Enhanced: Background check
4. Premium: Credit check

Red Flags to Watch:
- Incomplete profiles
- Last-minute bookings for events
- Vague trip purposes
- Reluctance to provide info
- Unusual payment requests

Screening Tools:
- Enable ID verification
- Require profile photo
- Set minimum account age
- Use pre-booking questionnaire

Proper screening reduces issues by 78%`,
    usageCount: 1567,
    helpfulCount: 1512,
  },
  {
    title: 'Dynamic Event Pricing',
    category: 'PRODUCT',
    tags: ['pricing', 'events', 'revenue'],
    content: `Capitalize on local events:

Event Pricing Strategy:
1. Monitor local event calendars
2. Set event-specific rates (2-4x base)
3. Increase minimum stays
4. Adjust 60-90 days in advance

High-Impact Events:
- Sporting events
- Festivals
- Conventions
- Graduations
- Holidays

Tools:
- Event pricing calendar
- Automated rate rules
- Market demand indicators
- Competitor price tracking

Event pricing can increase annual revenue by 35%`,
    usageCount: 1234,
    helpfulCount: 1189,
  },

  // Troubleshooting & Support (5 more articles)
  {
    title: 'Account Recovery and Security',
    category: 'TECHNICAL',
    tags: ['account', 'security', 'recovery'],
    content: `Secure your account:

Security Best Practices:
1. Enable two-factor authentication
2. Use unique, strong password
3. Regular security checkups
4. Monitor login activity
5. Secure email account

Account Recovery:
- Click "Forgot Password"
- Check email (including spam)
- Use recovery phone if enabled
- Contact support with ID

Suspicious Activity:
- Change password immediately
- Review recent bookings
- Check payout settings
- Enable all security features

2FA reduces account theft by 94%`,
    usageCount: 876,
    helpfulCount: 845,
  },
  {
    title: 'Handling Difficult Guests',
    category: 'GENERAL',
    tags: ['guests', 'conflict', 'resolution'],
    content: `De-escalate and resolve conflicts:

Communication Strategy:
1. Remain calm and professional
2. Acknowledge their concerns
3. Offer specific solutions
4. Document everything
5. Know when to involve support

Common Scenarios:
- Unreasonable demands: Set boundaries politely
- Property complaints: Offer solutions or partial refund
- Rule violations: Reference house rules, document
- Damage disputes: Use photos, get estimates

Templates:
"I understand your frustration with [issue]. 
Let me help resolve this by [solution].
I'll [action] within [timeframe]."

Professional response improves outcomes by 71%`,
    usageCount: 1432,
    helpfulCount: 1376,
  },
  {
    title: 'Seasonal Pricing Optimization',
    category: 'PRODUCT',
    tags: ['pricing', 'seasonal', 'optimization'],
    content: `Maximize revenue year-round:

Seasonal Strategy:
- Peak (Summer): Base rate + 40-60%
- Shoulder (Spring/Fall): Base rate + 10-20%
- Off-peak (Winter): Base rate - 10-20%
- Holidays: Base rate + 80-100%

Monthly Adjustments:
January: -20% (post-holiday)
February: -15% (except Valentine's/Presidents)
March: +10% (Spring break)
April-May: +20% (Spring travel)
June-August: +50% (Summer peak)
September: +15% (Fall travel)
October: +25% (Leaf season)
November: +30% (Thanksgiving)
December: +60% (Holidays)

Review and adjust monthly based on occupancy`,
    usageCount: 1678,
    helpfulCount: 1623,
  },
  {
    title: 'Insurance and Liability Protection',
    category: 'GENERAL',
    tags: ['insurance', 'liability', 'protection'],
    content: `Protect your investment:

Coverage Types:
1. Host Protection (platform-provided)
   - Up to $1M liability
   - Property damage coverage
   - Check platform terms

2. Short-term Rental Insurance
   - Commercial activity coverage
   - Lost income protection
   - Higher liability limits

3. Additional Coverage
   - Umbrella policy
   - Business liability
   - Equipment breakdown

Documentation Tips:
- Photo inventory before each guest
- Keep receipts for all property items
- Document any incidents immediately
- Regular property video tours

Proper coverage prevents 89% of financial losses`,
    usageCount: 1123,
    helpfulCount: 1087,
  },
  {
    title: 'Superhost Status Achievement Guide',
    category: 'PRODUCT',
    tags: ['superhost', 'status', 'achievement'],
    content: `Reach and maintain Superhost status:

Requirements:
1. 4.8+ overall rating
2. 90%+ response rate
3. <1% cancellation rate
4. 10+ stays or 100+ nights/year

Strategy for Success:
- Respond within 1 hour
- Over-communicate with guests
- Professional photography
- Thoughtful amenities
- Quick issue resolution
- Request reviews professionally

Benefits:
- 22% more bookings
- Higher search ranking
- Superhost badge
- Priority support
- Exclusive rewards

Review quarterly progress in Performance tab`,
    usageCount: 1890,
    helpfulCount: 1834,
  },
];

// Function to seed the knowledge base
export async function seedKnowledgeBase(prisma: any) {
  console.log('Seeding knowledge base with articles...');

  for (const article of knowledgeBaseArticles) {
    await prisma.knowledgeArticle.create({
      data: {
        ...article,
        source: 'Support Team',
        metadata: {
          version: '1.0',
          lastReviewed: new Date(),
          category: article.category,
        },
      },
    });
  }

  console.log(`Seeded ${knowledgeBaseArticles.length} knowledge base articles`);
}
