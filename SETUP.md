# Local Development Setup

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or Supabase)
- OpenAI API key

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

#### Option A: Use Supabase (Recommended for Quick Start)
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to Settings > Database
3. Copy the connection string and add to `DATABASE_URL`
4. Go to Settings > API  
5. Copy project URL and keys

#### Option B: Use Local PostgreSQL
```bash
# If you have PostgreSQL installed locally
DATABASE_URL="postgresql://postgres:password@localhost:5432/customer_support"
```

### 3. Set Up Database
```bash
# Push the schema to your database
npm run db:push

# Generate Prisma client
npx prisma generate
```

### 4. Run Database Migrations (for pgvector)
If using Supabase:
1. Go to SQL Editor in Supabase dashboard
2. Run the migration from `supabase/migrations/001_enable_vector.sql`

If using local PostgreSQL:
```bash
# First install pgvector extension
# On Mac: brew install pgvector
# On Ubuntu: sudo apt install postgresql-14-pgvector

# Then run the migration
psql -U postgres -d customer_support < supabase/migrations/001_enable_vector.sql
```

### 5. Seed Demo Data
```bash
npm run db:seed
```
This creates:
- Demo user: `demo@example.com` / `demo123`
- Sample tickets and customers
- Knowledge base articles

### 6. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Testing the System

### 1. Login
- Go to http://localhost:3000/login
- Use: `demo@example.com` / `demo123`

### 2. Explore Features
- **Dashboard**: View tickets and agent activity
- **Tickets**: See all tickets, click to view details
- **Ticket Chat**: Send messages and see AI responses

### 3. Test AI Agents
Create a new ticket or respond in existing tickets:
- Technical: "My API returns 401 errors"
- Billing: "I need a refund for duplicate charge"
- Product: "How do I export data to CSV?"

## Troubleshooting

### Database Connection Issues
```bash
# Test your connection
npx prisma db push
```

### Missing OpenAI Key
The AI agents won't work without an OpenAI API key. Get one at [platform.openai.com](https://platform.openai.com)

### Port Already in Use
```bash
# Run on different port
PORT=3001 npm run dev
```

## Local Development Tips

1. **Mock Mode**: To test without OpenAI API:
   - Comment out the AI processing in `/src/lib/agents/orchestrator.ts`
   - Return mock responses instead

2. **Database GUI**: 
   ```bash
   npx prisma studio
   ```
   Opens at http://localhost:5555

3. **Check Logs**:
   - Browser console for frontend errors
   - Terminal for server errors
   - Network tab for API issues

## Next Steps
- Modify agents in `/src/lib/agents/`
- Add new UI components in `/src/components/`
- Customize the dashboard in `/src/app/(dashboard)/`