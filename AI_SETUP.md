# AI Model Configuration

## Current Setup

This Multi-Agent Customer Support System is configured to use:

- **Primary AI Model**: Claude 3 Sonnet (Anthropic)
- **API Provider**: OpenRouter
- **Embedding Model**: OpenAI text-embedding-3-small (via OpenRouter)

## Why Claude 3 Sonnet?

We chose Claude 3 Sonnet for several reasons:

1. **Balanced Performance**: Excellent reasoning capabilities while being cost-effective
2. **Context Understanding**: Superior at understanding nuanced support tickets
3. **Instruction Following**: Reliably follows agent role prompts
4. **Safety**: Built-in safety features for customer-facing interactions

## Agent Architecture

Each agent uses the same base model but with different system prompts:

```typescript
// Router Agent
"You are a Router Agent specialized in categorizing support tickets..."

// Technical Support Agent  
"You are a Technical Support specialist for a vacation rental platform..."

// Billing Agent
"You are a Billing specialist for a vacation rental platform..."

// Product Expert Agent
"You are a Product Expert for a vacation rental platform..."

// QA Agent
"You are a Quality Assurance specialist..."
```

## Demo Mode vs Production

### Demo Mode (Current)
- Uses simulated responses for instant feedback
- No API calls to reduce costs
- Demonstrates agent thinking patterns
- Shows realistic processing flow

### Production Mode
- Real API calls to Claude 3 Sonnet
- Actual semantic search in knowledge base
- Response times: 2-5 seconds per agent
- Costs: ~$0.003 per ticket (5 agent calls)

## Switching AI Models

To use a different model, update `.env.local`:

```bash
# Use GPT-4 Turbo
OPENROUTER_MODEL="openai/gpt-4-turbo-preview"

# Use Claude 3 Opus (more powerful, more expensive)
OPENROUTER_MODEL="anthropic/claude-3-opus"

# Use GPT-3.5 (cheaper, less capable)
OPENROUTER_MODEL="openai/gpt-3.5-turbo"
```

## API Costs

Approximate costs per 1,000 tickets:

- **Claude 3 Sonnet**: $3-5
- **GPT-4 Turbo**: $10-15
- **Claude 3 Opus**: $15-25
- **GPT-3.5 Turbo**: $1-2

## Future Enhancements

1. **Model Routing**: Use GPT-3.5 for simple tickets, Claude 3 for complex ones
2. **Fine-tuning**: Custom models trained on support data
3. **Local Models**: Llama 3 for privacy-sensitive deployments
4. **Hybrid Approach**: Combine multiple models for best results

## Getting Started

1. Sign up for [OpenRouter](https://openrouter.ai)
2. Add credits to your account
3. Copy your API key to `.env.local`
4. Toggle off demo mode to use real AI