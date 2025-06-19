# 🚀 Quick Start Guide

## You've already completed:
✅ Created Supabase tables  
✅ Added API keys to .env.local

## Next Steps:

### 1. Update your database password in .env.local
Find your database password in Supabase (Settings > Database) and update these lines in `.env.local`:
```
DATABASE_URL="postgresql://postgres.ufbtzlfktxwfremahydf:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.ufbtzlfktxwfremahydf:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Generate Prisma client
```bash
npx prisma generate
```

### 4. Push schema to database (if needed)
```bash
npm run db:push
```

### 5. Seed demo data
```bash
npm run db:seed
```

### 6. Start the app!
```bash
npm run dev
```

Visit http://localhost:3000

## 🎯 What you'll see:

1. **Data Science Support Dashboard** - Shows ML/AI support tickets
2. **Live Agent Activity** - See AI agents processing tickets in real-time
3. **Sample Tickets Include:**
   - A/B test statistical analysis
   - Model performance debugging
   - Feature engineering guidance
   - GPU optimization help

## 🧪 Test the AI Agents:

Click on any ticket to see the chat interface. Try sending messages like:
- "What's the minimum detectable effect for my A/B test?"
- "How do I implement feature versioning?"
- "My model's F1 score dropped suddenly"

The specialized agents will respond with data science expertise!

## 🔧 Troubleshooting:

### Database connection issues:
- Make sure you've replaced [YOUR-PASSWORD] with your actual Supabase password
- Check that your Supabase project is active

### OpenRouter issues:
- Verify your API key is correct
- Check you have credits on OpenRouter

### No response from agents:
- Check the browser console for errors
- Make sure all environment variables are set correctly