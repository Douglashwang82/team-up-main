#!/bin/bash

echo "🧹 Clearing Next.js cache..."

# Remove .next directory
rm -rf .next

# Remove node_modules/.cache if it exists
rm -rf node_modules/.cache

# Remove turbo cache if it exists
rm -rf .turbo

echo "✅ Cache cleared!"
echo ""
echo "Now run: pnpm dev"
