# Customer Support AI - Multi-Agent System

A production-ready customer support automation system using multi-agent AI architecture to handle complex support tickets with minimal human intervention.

## 🚀 Features

- **Intelligent Ticket Router**: Analyzes and classifies tickets by type, urgency, and complexity
- **Specialized AI Agents**:
  - Technical Support Agent
  - Billing Agent  
  - Product Expert Agent
  - Escalation Agent
  - QA Agent (reviews responses before sending)
- **RAG System**: Vector search with Supabase pgvector for knowledge base
- **Real-time Dashboard**: Monitor ticket processing in real-time
- **Learning System**: Improves routing and responses over time

## 🏗️ Architecture

```
Frontend (Next.js) → API (tRPC) → Agent Orchestrator → Specialized Agents
                                           ↓
                              Vector Store (Supabase pgvector)
```

## 🚀 Deployment

This app is designed to deploy on:

1. **Vercel** - Frontend & API Routes
   - Automatic Git deployments
   - Edge functions for API routes
   - Environment variable management

2. **Supabase** - Database & Vector Store
   - PostgreSQL database
   - pgvector for embeddings
   - Real-time subscriptions
   - Built-in auth (optional)

3. **Railway/Render** (Optional) - Background Jobs
   - Heavy processing tasks
   - Scheduled metrics updates

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL (via Supabase)
- OpenAI API key
- Supabase account

## 🛠️ Setup

1. **Clone the repository**
```bash
git clone <your-repo>
cd customer-support-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/001_enable_vector.sql`
   - Copy your project URL and keys

4. **Configure environment variables**
```bash
cp .env.local.example .env.local
```

Fill in your credentials:
- `DATABASE_URL` - Supabase connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service key
- `OPENAI_API_KEY` - Your OpenAI API key

5. **Push database schema**
```bash
npm run db:push
```

6. **Run development server**
```bash
npm run dev
```

## 🚀 Deploy to Vercel

1. **Push to GitHub**

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from `.env.local`

3. **Deploy**
   - Vercel will automatically deploy on push to main

## 📊 Database Schema

Key models:
- `Ticket` - Support tickets
- `Message` - Conversation messages
- `Customer` - Customer information
- `TicketHandling` - Agent actions
- `KnowledgeBase` - Vector-indexed knowledge articles
- `AgentResponse` - Response history for learning

## 🔧 Development

```bash
# Run development server
npm run dev

# Run database migrations
npm run db:migrate

# Seed database with demo data
npm run db:seed

# Run linting
npm run lint
```

## 🎯 Next Steps

- [ ] Add authentication UI
- [ ] Implement real-time WebSocket updates
- [ ] Create dashboard components
- [ ] Add metrics visualization
- [ ] Implement feedback learning loop
- [ ] Add more knowledge base sources

## 📝 License

MIT