-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AGENT', 'SUPERVISOR');
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'ESCALATED', 'RESOLVED', 'CLOSED');
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "TicketCategory" AS ENUM ('TECHNICAL', 'BILLING', 'PRODUCT', 'GENERAL', 'COMPLAINT');
CREATE TYPE "AgentType" AS ENUM ('ROUTER', 'TECHNICAL', 'BILLING', 'PRODUCT', 'ESCALATION', 'QA', 'HUMAN');

-- Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'AGENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create Customer table
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- Create Ticket table
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "category" "TicketCategory" NOT NULL,
    "customerId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sentiment" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- Create Message table
CREATE TABLE "Message" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "senderId" TEXT,
    "customerId" TEXT,
    "agentType" "AgentType",
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- Create TicketHandling table
CREATE TABLE "TicketHandling" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "ticketId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentType" "AgentType" NOT NULL,
    "action" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "successful" BOOLEAN,
    "confidence" DOUBLE PRECISION,
    "metadata" JSONB,

    CONSTRAINT "TicketHandling_pkey" PRIMARY KEY ("id")
);

-- Create TicketMetrics table
CREATE TABLE "TicketMetrics" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "ticketId" TEXT NOT NULL,
    "resolutionTime" INTEGER,
    "handlingTime" INTEGER,
    "customerSatisfaction" DOUBLE PRECISION,
    "agentPerformance" DOUBLE PRECISION,
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "firstResponseTime" INTEGER,
    "totalResponses" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketMetrics_pkey" PRIMARY KEY ("id")
);

-- Create KnowledgeBase table with vector column
CREATE TABLE "KnowledgeBase" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "embedding" vector(1536),
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "KnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- Create AgentResponse table
CREATE TABLE "AgentResponse" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "agentType" "AgentType" NOT NULL,
    "ticketCategory" "TicketCategory" NOT NULL,
    "query" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "successful" BOOLEAN NOT NULL,
    "feedback" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentResponse_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
CREATE UNIQUE INDEX "TicketMetrics_ticketId_key" ON "TicketMetrics"("ticketId");

-- Create regular indexes
CREATE INDEX "Ticket_customerId_idx" ON "Ticket"("customerId");
CREATE INDEX "Ticket_assignedToId_idx" ON "Ticket"("assignedToId");
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");
CREATE INDEX "Ticket_category_idx" ON "Ticket"("category");
CREATE INDEX "Message_ticketId_idx" ON "Message"("ticketId");
CREATE INDEX "TicketHandling_ticketId_idx" ON "TicketHandling"("ticketId");

-- Create vector similarity index
CREATE INDEX "KnowledgeBase_embedding_idx" ON "KnowledgeBase" 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Add foreign key constraints
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedToId_fkey" 
    FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Message" ADD CONSTRAINT "Message_ticketId_fkey" 
    FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" 
    FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Message" ADD CONSTRAINT "Message_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TicketHandling" ADD CONSTRAINT "TicketHandling_ticketId_fkey" 
    FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TicketHandling" ADD CONSTRAINT "TicketHandling_agentId_fkey" 
    FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TicketMetrics" ADD CONSTRAINT "TicketMetrics_ticketId_fkey" 
    FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create functions for vector search
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector,
  match_count int DEFAULT 5,
  filter_category text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  title text,
  content text,
  category text,
  source text,
  source_url text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kb.id::uuid,
    kb.title,
    kb.content,
    kb.category,
    kb.source,
    kb."sourceUrl" as source_url,
    1 - (kb.embedding <=> query_embedding) as similarity
  FROM "KnowledgeBase" kb
  WHERE (filter_category IS NULL OR kb.category = filter_category)
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to update knowledge stats
CREATE OR REPLACE FUNCTION update_knowledge_stats(
  doc_id uuid,
  is_helpful boolean
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE "KnowledgeBase"
  SET 
    "usageCount" = "usageCount" + 1,
    "helpfulCount" = "helpfulCount" + CASE WHEN is_helpful THEN 1 ELSE 0 END,
    "updatedAt" = NOW()
  WHERE id = doc_id;
END;
$$;

-- Create triggers for updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_customer_updated_at BEFORE UPDATE ON "Customer" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ticket_updated_at BEFORE UPDATE ON "Ticket" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ticketmetrics_updated_at BEFORE UPDATE ON "TicketMetrics" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_knowledgebase_updated_at BEFORE UPDATE ON "KnowledgeBase" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();