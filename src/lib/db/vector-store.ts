import { supabaseAdmin } from './supabase';
import { getOpenRouterEmbeddings } from '@/lib/ai/openrouter';

export class VectorStore {
  private embeddings: any;

  constructor() {
    this.embeddings = getOpenRouterEmbeddings();
  }

  async addDocument(doc: {
    title: string;
    content: string;
    category: string;
    source: string;
    sourceUrl?: string;
    tags?: string[];
  }) {
    try {
      // Generate embedding
      const embedding = await this.embeddings.embedQuery(doc.content);

      // Store in Supabase with pgvector
      const { data, error } = await supabaseAdmin
        .from('knowledge_base')
        .insert({
          title: doc.title,
          content: doc.content,
          category: doc.category,
          source: doc.source,
          source_url: doc.sourceUrl,
          tags: doc.tags || [],
          embedding: embedding,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding document to vector store:', error);
      throw error;
    }
  }

  async searchSimilar(query: string, category?: string, limit: number = 5) {
    try {
      // Generate embedding for query
      const queryEmbedding = await this.embeddings.embedQuery(query);

      // Search using pgvector's <-> operator for cosine similarity
      let queryBuilder = supabaseAdmin.rpc('search_knowledge_base', {
        query_embedding: queryEmbedding,
        match_count: limit,
        ...(category && { filter_category: category }),
      });

      const { data, error } = await queryBuilder;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching vector store:', error);
      return [];
    }
  }

  async updateUsageStats(docId: string, helpful: boolean) {
    try {
      const { error } = await supabaseAdmin.rpc('update_knowledge_stats', {
        doc_id: docId,
        is_helpful: helpful,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating usage stats:', error);
    }
  }
}
