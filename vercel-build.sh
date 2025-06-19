#!/bin/bash

# For Vercel deployment without database
# This script skips Prisma generation if DATABASE_URL is not set

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not set, skipping Prisma generation (demo mode)"
  echo "Building Next.js only..."
  next build
else
  echo "DATABASE_URL found, running full build with Prisma"
  prisma generate && next build
fi