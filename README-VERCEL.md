# Deploying to Vercel

## Quick Deploy (Demo Only)

If you just want to deploy the "Agents Being Salty" demo without the full database setup:

### 1. Set Environment Variables in Vercel

In your Vercel project settings, add:

```
OPENROUTER_API_KEY=your_actual_api_key_here
```

For the database URLs (to satisfy Prisma during build), you can use dummy values:
```
DATABASE_URL=postgresql://dummy:dummy@dummy:5432/dummy
DIRECT_URL=postgresql://dummy:dummy@dummy:5432/dummy
```

### 2. Override Build Command

In Vercel settings, set the build command to:
```bash
npm install && next build
```

This skips the Prisma generation step.

### 3. Deploy

The demo will be available at `/simple-demo` or `/demo` on your deployed site.

## Full Deploy (With Database)

If you want the full application with database:

1. Set up a PostgreSQL database (e.g., Supabase, Neon, or Vercel Postgres)
2. Add the real database URLs:
   ```
   DATABASE_URL=your_pooled_connection_string
   DIRECT_URL=your_direct_connection_string
   ```
3. Use the default build command (it will run Prisma migrations)

## Demo-Only Alternative

If you want to skip Prisma entirely for the demo, you can:

1. Remove `"postinstall": "prisma generate"` from package.json
2. Change build script to just `"build": "next build"`
3. Deploy normally with just `OPENROUTER_API_KEY`

The demo at `/simple-demo` doesn't use any database features and will work perfectly!