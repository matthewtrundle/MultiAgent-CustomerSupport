-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Update knowledge_base table to use vector type
ALTER TABLE "KnowledgeBase" 
ALTER COLUMN embedding TYPE vector(1536) 
USING embedding::vector(1536);

-- Create index for similarity search
CREATE INDEX knowledge_base_embedding_idx ON "KnowledgeBase" 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function to search knowledge base
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