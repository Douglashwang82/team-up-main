# Troubleshooting Guide

## Fixed Issues

### 1. Empty Root Layout
**Issue**: `layout.tsx` was empty causing "default export is not a React Component" error

**Fix**: Recreated `/app/layout.tsx` with proper content including AuthProvider

### 2. Duplicate Route Files
**Issue**: Old route files conflicting with new route group structure

**Fixes Applied**:
- ✓ Removed `/app/(main)/teamups/layout.tsx` (old file)
- ✓ Removed `/app/(main)/teamups/[teamupId]/requests/` (moved to `manage/requests`)

## Current Structure

```
app/
├── layout.tsx                    # ✓ Root layout with AuthProvider
├── page.tsx                      # ✓ Home page
├── globals.css                   # ✓ Styles
├── middleware.ts                 # ✓ Route protection (at web root)
├── (auth)/
│   ├── layout.tsx               # ✓ Auth layout
│   ├── login/page.tsx           # ✓ Login
│   └── signup/page.tsx          # ✓ Signup
└── (main)/
    ├── layout.tsx               # ✓ Main layout with Navbar
    ├── venues/
    │   ├── page.tsx             # ✓ Search
    │   └── [venueId]/
    │       ├── page.tsx         # ✓ Venue detail
    │       └── courts/[courtId]/timeslots/page.tsx
    ├── bookings/
    │   ├── page.tsx             # ✓ List
    │   └── [bookingId]/page.tsx # ✓ Detail
    ├── teamups/
    │   ├── page.tsx             # ✓ Browse
    │   ├── new/page.tsx         # ✓ Create
    │   ├── my/page.tsx          # ✓ My TeamUps
    │   └── [teamupId]/
    │       ├── page.tsx         # ✓ Detail
    │       └── manage/requests/page.tsx  # ✓ Requests
    └── profile/
        ├── page.tsx             # ✓ View
        └── edit/page.tsx        # ✓ Edit
```

## If You Still See Errors

### Check for Old Files
Run this command to find any remaining old route files:
```bash
find apps/web/app -name "*.tsx" | grep -v "(main)" | grep -v "(auth)" | grep -v "layout.tsx" | grep -v "page.tsx" | grep -v "globals"
```

### Clear Next.js Cache
```bash
cd apps/web
rm -rf .next
pnpm dev
```

### Verify Environment Variables
Check `apps/web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Check Import Paths
All hooks should use `@/lib/hooks/...`:
```typescript
import { useAuth } from '@/lib/hooks/useAuth';
import { useTeamUps } from '@/lib/hooks/useTeamUps';
import { useVenues } from '@/lib/hooks/useVenues';
import { useBookings } from '@/lib/hooks/useBookings';
```

### Check tsconfig.json
Ensure path alias is configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Common Errors

### "Cannot find module '@/lib/...'"
- Check `tsconfig.json` has correct path alias
- Restart TypeScript server in IDE

### "The default export is not a React Component"
- Verify page has `export default function`
- Check layout files are not empty
- Remove any conflicting old files

### "useAuth must be used within an AuthProvider"
- Ensure root `layout.tsx` has `<AuthProvider>`
- Check import path is correct

### Middleware not working
- `middleware.ts` should be at `/apps/web/middleware.ts` (NOT in app folder)
- Check it exports `middleware` function and `config`

## Verification Steps

1. **Start dev server**:
   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Test routes**:
   - `/` - Home page
   - `/login` - Login page
   - `/signup` - Signup page
   - `/teamups` - Browse TeamUps
   - `/venues` - Search venues
   - `/profile` - Profile (requires auth)

3. **Check console**:
   - No errors in terminal
   - No errors in browser console
   - Routes load correctly

## Files Cleanup Checklist

Old files that should NOT exist:
- ❌ `/app/teamups/` (should be in `(main)`)
- ❌ `/app/venues/` (should be in `(main)`)
- ❌ `/app/bookings/` (should be in `(main)`)
- ❌ `/app/auth/` (should be in `(auth)`)
- ❌ `/app/user/` (moved to `(main)/profile`)
- ❌ `/app/(main)/teamups/layout.tsx` (removed)
- ❌ `/app/(main)/teamups/[teamupId]/requests/` (moved to manage/)
- ❌ `/app/auth/logout/` (use logout function instead)

Files that SHOULD exist:
- ✅ `/app/layout.tsx` (root layout)
- ✅ `/app/page.tsx` (home page)
- ✅ `/app/(auth)/layout.tsx`
- ✅ `/app/(main)/layout.tsx`
- ✅ `/middleware.ts` (at web root, not in app)

## Need More Help?

1. Check Next.js error message carefully
2. Look at browser console for client-side errors
3. Check terminal for server-side errors
4. Verify file paths match the structure above
5. Clear cache and restart dev server
