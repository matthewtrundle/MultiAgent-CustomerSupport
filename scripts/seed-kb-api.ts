// Seed knowledge base using API endpoints
import { knowledgeBaseArticles } from '../src/lib/knowledge-base/seed-articles';

async function seedViaAPI() {
  console.log('Seeding knowledge base via API...');
  
  const baseUrl = 'http://localhost:3022';
  let seeded = 0;
  let failed = 0;
  
  for (const article of knowledgeBaseArticles) {
    try {
      const response = await fetch(`${baseUrl}/api/knowledge-base`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(article)
      });
      
      if (response.ok) {
        seeded++;
        console.log(`✅ Seeded: ${article.title}`);
      } else {
        failed++;
        const error = await response.text();
        console.log(`❌ Failed: ${article.title} - ${error}`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ Error seeding ${article.title}:`, error);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully seeded: ${seeded} articles`);
  console.log(`❌ Failed: ${failed} articles`);
  console.log(`📚 Total articles: ${knowledgeBaseArticles.length}`);
}

seedViaAPI().catch(console.error);