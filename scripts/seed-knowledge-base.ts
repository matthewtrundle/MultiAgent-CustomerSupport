import { PrismaClient } from '@prisma/client';
import { knowledgeBaseArticles } from '../src/lib/knowledge-base/seed-articles';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting knowledge base seeding...');
  
  try {
    // Check existing articles
    const existingCount = await prisma.knowledgeBase.count();
    console.log(`Found ${existingCount} existing articles`);
    
    // Seed new articles
    let seeded = 0;
    let skipped = 0;
    
    for (const article of knowledgeBaseArticles) {
      // Check if article already exists
      const existing = await prisma.knowledgeBase.findFirst({
        where: { title: article.title }
      });
      
      if (existing) {
        console.log(`Skipping existing article: ${article.title}`);
        skipped++;
        continue;
      }
      
      await prisma.knowledgeBase.create({
        data: {
          title: article.title,
          content: article.content,
          category: article.category,
          tags: article.tags,
          usageCount: article.usageCount,
          helpfulCount: article.helpfulCount,
          source: 'Support Team'
        }
      });
      seeded++;
      console.log(`Seeded article ${seeded}: ${article.title}`);
    }
    
    console.log(`✅ Successfully seeded ${seeded} new articles, skipped ${skipped} existing`);
    
    // Show some stats
    const totalArticles = await prisma.knowledgeBase.count();
    const byCategory = await prisma.knowledgeBase.groupBy({
      by: ['category'],
      _count: true
    });
    
    console.log('\nKnowledge Base Stats:');
    console.log(`Total articles: ${totalArticles}`);
    console.log('Articles by category:');
    byCategory.forEach(cat => {
      console.log(`  ${cat.category}: ${cat._count} articles`);
    });
    
  } catch (error) {
    console.error('Error seeding knowledge base:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });