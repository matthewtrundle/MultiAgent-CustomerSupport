import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';

export function getOpenRouterModel(temperature: number = 0.3) {
  return new ChatOpenAI({
    modelName: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-sonnet',
    temperature,
    openAIApiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Data Science Support AI',
      },
    },
  });
}

export function getOpenRouterEmbeddings() {
  return new OpenAIEmbeddings({
    modelName: process.env.EMBEDDING_MODEL || 'openai/text-embedding-3-small',
    openAIApiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
    },
  });
}
