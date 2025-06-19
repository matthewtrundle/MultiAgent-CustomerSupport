import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const articles = await prisma.knowledgeBase.findMany({
      orderBy: {
        usageCount: 'desc',
      },
      take: 50,
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    return NextResponse.json({ error: 'Failed to fetch knowledge base articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const article = await prisma.knowledgeBase.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        source: data.source || 'Support Team',
        tags: data.tags || [],
        usageCount: 0,
        helpfulCount: 0,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error creating knowledge base article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
