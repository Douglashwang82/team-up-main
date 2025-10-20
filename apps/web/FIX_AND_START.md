# Fix and Start Guide

## The Issue

You're seeing: `Error: The default export is not a React Component in page: "/teamups"`

This is caused by Next.js cache not recognizing the new route structure.

## Quick Fix (Run these commands)

```bash
cd /Users/hwangdouglas/Projects/team-up-main/apps/web

# 1. Clear cache
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

# 2. Restart dev server
pnpm dev
```

## If That Doesn't Work

### Step 1: Verify File Structure

Run this to see the structure:
```bash
find app -name "page.tsx" -type f | sort
```

Expected output:
```
app/(auth)/login/page.tsx
app/(auth)/signup/page.tsx
app/(main)/bookings/[bookingId]/page.tsx
app/(main)/bookings/page.tsx
app/(main)/profile/edit/page.tsx
app/(main)/profile/page.tsx
app/(main)/teamups/[teamupId]/manage/requests/page.tsx
app/(main)/teamups/[teamupId]/page.tsx
app/(main)/teamups/my/page.tsx
app/(main)/teamups/new/page.tsx
app/(main)/teamups/page.tsx
app/(main)/venues/[venueId]/courts/[courtId]/timeslots/page.tsx
app/(main)/venues/[venueId]/page.tsx
app/(main)/venues/page.tsx
app/page.tsx
```

### Step 2: Check for Old Files

These should NOT exist:
```bash
# Check for old route directories (should return nothing)
ls -d app/teamups app/venues app/bookings app/auth app/user 2>/dev/null

# If any exist, remove them:
rm -rf app/teamups app/venues app/bookings app/auth app/user
```

### Step 3: Verify Layouts

Check layouts exist:
```bash
cat app/layout.tsx | head -5
cat app/(auth)/layout.tsx | head -5
cat app/(main)/layout.tsx | head -5
```

All three should have content (not empty).

### Step 4: Kill All Node Processes

Sometimes the dev server doesn't restart properly:
```bash
# Kill all node processes
pkill -9 node

# Restart
pnpm dev
```

### Step 5: Reinstall Dependencies

If still not working:
```bash
# Remove and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
pnpm dev
```

## Common Issues

### Issue 1: Empty Layout Files
**Symptom**: "default export is not a React Component"
**Fix**: Check `/app/layout.tsx` is not empty:
```bash
wc -l app/layout.tsx
```
Should show ~27 lines. If 0 or 1, the file is empty.

### Issue 2: Conflicting Route Files
**Symptom**: Routes not loading or wrong content
**Fix**: Remove old route directories outside (main) and (auth).

### Issue 3: Import Errors
**Symptom**: "Cannot find module '@/lib/...'"
**Fix**:
1. Check `tsconfig.json` has `"@/*": ["./*"]` in paths
2. Restart TypeScript server in your IDE
3. Clear cache and restart

## Verification

Once the server starts, test these URLs:

1. http://localhost:3000 - Should show home page
2. http://localhost:3000/teamups - Should show TeamUps browse page
3. http://localhost:3000/login - Should show login page
4. http://localhost:3000/venues - Should show venues search

## Still Having Issues?

Check the browser console and terminal for specific error messages:

**Browser Console**: Right-click → Inspect → Console tab
**Terminal**: Look at the output where you ran `pnpm dev`

Common error patterns:

1. **Module not found**: Import path issue
2. **Cannot read property**: Hook not initialized properly
3. **Hydration error**: Server/client mismatch (clear cache)
4. **Default export**: Empty or incorrect page file

## Nuclear Option (Complete Reset)

If nothing works, do a complete reset:

```bash
# Stop dev server (Ctrl+C)

# Clear everything
rm -rf .next node_modules .turbo
rm pnpm-lock.yaml

# Reinstall from root
cd ../..  # Go to monorepo root
pnpm install

# Go back and start
cd apps/web
pnpm dev
```

## Success Indicators

When it's working, you should see:

```
✓ Ready in 2s
○ Compiling / ...
✓ Compiled / in 500ms
○ Compiling /teamups ...
✓ Compiled /teamups in 300ms
```

And accessing http://localhost:3000/teamups should show the TeamUps page.
