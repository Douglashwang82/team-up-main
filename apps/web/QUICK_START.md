# Quick Start - After Refactoring

## ✅ What's Been Done

All pages have been created and organized in the new route structure:
- **15 page.tsx files** - All routes implemented
- **3 layout.tsx files** - Root, auth, and main layouts
- **4 custom hooks** - useAuth, useVenues, useBookings, useTeamUps
- **1 AuthContext** - Centralized authentication

## 🚀 Start the App

```bash
cd /Users/hwangdouglas/Projects/team-up-main/apps/web

# Clear cache (IMPORTANT - do this first!)
rm -rf .next

# Start dev server
pnpm dev
```

Then open: http://localhost:3000

## 📁 Route Structure

All routes work like this:

| URL | File Location | Description |
|-----|---------------|-------------|
| `/` | `app/page.tsx` | Home page |
| `/login` | `app/(auth)/login/page.tsx` | Login |
| `/signup` | `app/(auth)/signup/page.tsx` | Signup |
| `/teamups` | `app/(main)/teamups/page.tsx` | Browse TeamUps |
| `/teamups/new` | `app/(main)/teamups/new/page.tsx` | Create TeamUp |
| `/teamups/my` | `app/(main)/teamups/my/page.tsx` | My TeamUps |
| `/teamups/:id` | `app/(main)/teamups/[teamupId]/page.tsx` | TeamUp detail |
| `/teamups/:id/manage/requests` | `app/(main)/teamups/[teamupId]/manage/requests/page.tsx` | Manage requests |
| `/venues` | `app/(main)/venues/page.tsx` | Search venues |
| `/venues/:id` | `app/(main)/venues/[venueId]/page.tsx` | Venue detail |
| `/venues/:id/courts/:courtId/timeslots` | `app/(main)/venues/[venueId]/courts/[courtId]/timeslots/page.tsx` | Court timeslots |
| `/bookings` | `app/(main)/bookings/page.tsx` | My bookings |
| `/bookings/:id` | `app/(main)/bookings/[bookingId]/page.tsx` | Booking detail |
| `/profile` | `app/(main)/profile/page.tsx` | Profile |
| `/profile/edit` | `app/(main)/profile/edit/page.tsx` | Edit profile |

## 🔒 Protected Routes

These routes require login (handled by `middleware.ts`):
- `/bookings/*`
- `/teamups/new`
- `/teamups/my`
- `/profile/*`

## 🎨 Features Implemented

### Authentication
- ✅ Login/Signup with JWT
- ✅ Token stored in cookies
- ✅ Auto-redirect for protected routes
- ✅ Logout functionality

### TeamUps
- ✅ Browse with filters (status, visibility)
- ✅ Create (simplified model - no court binding)
- ✅ View details with participants
- ✅ Send join requests
- ✅ Owner: Approve/reject requests
- ✅ Owner: Change status (open/closed/cancelled)

### Venues
- ✅ Search with geolocation
- ✅ View venue details
- ✅ View court timeslots
- ✅ Book timeslots

### Bookings
- ✅ List with status filter
- ✅ View booking details
- ✅ Cancel bookings
- ✅ Create from timeslots

### Profile
- ✅ View profile
- ✅ Edit display name
- ✅ Quick action links

## 🔧 Environment Variables

Create `.env.local` if it doesn't exist:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## ⚠️ If You See Errors

### "default export is not a React Component"

**Solution 1**: Clear cache
```bash
rm -rf .next && pnpm dev
```

**Solution 2**: Kill all node processes
```bash
pkill -9 node
pnpm dev
```

**Solution 3**: Check for old files
```bash
# These should NOT exist:
ls -d app/teamups app/venues app/bookings app/auth app/user 2>/dev/null

# If they exist, remove:
rm -rf app/teamups app/venues app/bookings app/auth app/user
```

### "Cannot find module '@/lib/...'"

**Solution**: Restart TypeScript server
- VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
- Or clear cache: `rm -rf .next && pnpm dev`

### Routes show 404

**Solution**: Verify file structure
```bash
find app -name "page.tsx" -type f | sort
```

Should show 15 files in the correct locations.

## 📊 Verification Checklist

After starting the server, verify:

- [ ] `http://localhost:3000` - Home page loads
- [ ] `http://localhost:3000/login` - Login page loads
- [ ] `http://localhost:3000/teamups` - TeamUps page loads
- [ ] `http://localhost:3000/venues` - Venues page loads
- [ ] Navigation between pages works
- [ ] No errors in browser console
- [ ] No errors in terminal

## 🎯 Next Steps

1. **Start Backend API**:
   ```bash
   cd services/api
   python -m uvicorn app.main:app --reload --port 8080
   ```

2. **Test Full Flow**:
   - Sign up a user
   - Create a TeamUp
   - Browse TeamUps
   - Send join request
   - Approve request (as owner)

3. **Optional Enhancements**:
   - Extract shared components (TeamUpCard, BookingCard)
   - Add loading skeletons
   - Add optimistic UI updates
   - Add form validation library
   - Add toast notifications

## 📚 Documentation

- `REFACTORING_COMPLETE.md` - Full list of changes
- `REFACTORING_PROGRESS.md` - Migration progress
- `TROUBLESHOOTING.md` - Detailed troubleshooting
- `FIX_AND_START.md` - Step-by-step fixes

## ✅ You're All Set!

The refactoring is complete. Just run:

```bash
rm -rf .next && pnpm dev
```

And you're ready to go! 🚀
