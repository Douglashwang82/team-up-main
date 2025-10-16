# Web App Setup Guide

## Prerequisites

- **Node.js** - v18 or higher
- **pnpm** - v10.11.0 (package manager)

### Install pnpm (if not installed)

```bash
npm install -g pnpm@10.11.0
```

Verify installation:
```bash
pnpm --version
# Should show: 10.11.0
```

## Installation

### 1. Install All Dependencies

From the **project root directory**:

```bash
cd /Users/hwangdouglas/Projects/team-up-main
pnpm install
```

This installs dependencies for:
- ✅ Root workspace
- ✅ `apps/web` (Next.js web app)
- ✅ `packages/api-client` (TypeScript API client)
- ✅ `services/api` (Python backend - npm scripts only)

**Expected output:**
```
Packages: +XXX
+++++++++++++++++++++++++++++
Progress: resolved XXX, reused XXX, downloaded X
Done in Xs
```

### 2. Generate API Client (Optional - runs automatically)

The API client is automatically generated when you run `pnpm web:dev`, but you can generate it manually:

```bash
pnpm codegen
```

This will:
1. Lint `docs/openapi.yaml` with Spectral
2. Clean old generated files
3. Generate TypeScript types from OpenAPI spec
4. Build the `@team-up-main/api-client` package

## Running the Web App

### Development Mode

From the **project root**:

```bash
pnpm web:dev
```

Or from the **web app directory**:

```bash
cd apps/web
pnpm dev
```

**What happens:**
1. Runs `predev` script → `pnpm codegen` (generates API client)
2. Starts Next.js dev server on **http://localhost:3000**
3. Enables hot reload (changes reflect instantly)

**Expected output:**
```
▲ Next.js 14.2.5
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in Xs
```

### Production Build

Build for production:

```bash
cd apps/web
pnpm build
```

Start production server:

```bash
pnpm start
```

## Project Structure

```
team-up-main/
├── apps/
│   └── web/                    # Next.js web application
│       ├── app/                # App router pages
│       │   ├── layout.tsx      # Root layout with Navbar
│       │   ├── page.tsx        # Homepage
│       │   ├── teamups/        # TeamUps pages
│       │   ├── venues/         # Venues pages
│       │   ├── bookings/       # Bookings pages
│       │   ├── login/          # Login page
│       │   └── signup/         # Signup page
│       ├── components/         # Reusable components
│       │   ├── Navbar.tsx      # Navigation bar
│       │   ├── SearchBar.tsx   # Search component
│       │   └── VenueCard.tsx   # Venue card
│       ├── lib/
│       │   └── api.ts          # API client configuration
│       └── package.json
├── packages/
│   └── api-client/             # Generated TypeScript API client
│       └── src/gen/            # Auto-generated from OpenAPI
├── docs/
│   └── openapi.yaml            # API specification
└── package.json                # Root workspace config
```

## Common Commands

### Development

```bash
# Install dependencies
pnpm install

# Run web app (auto-generates API client)
pnpm web:dev

# Regenerate API client manually
pnpm codegen

# Lint OpenAPI spec
pnpm openapi:lint
```

### Build & Deploy

```bash
# Build for production
pnpm -C apps/web build

# Start production server
pnpm -C apps/web start

# Run linter
pnpm -C apps/web lint
```

### Workspace Management

```bash
# Install dependency in web app
pnpm -C apps/web add <package-name>

# Install dev dependency
pnpm -C apps/web add -D <package-name>

# Install in specific workspace
pnpm --filter web add <package-name>

# Run command in all workspaces
pnpm -r <command>
```

## API Client Generation

The web app uses a **TypeScript API client** auto-generated from the OpenAPI spec.

### How It Works

1. **OpenAPI Spec** (`docs/openapi.yaml`) - Single source of truth for API
2. **Generator** - Uses `@openapitools/openapi-generator-cli`
3. **Output** - TypeScript types and API classes in `packages/api-client/src/gen/`
4. **Usage** - Import from `@team-up-main/api-client` in web app

### When to Regenerate

Regenerate the API client when:
- ✅ You update `docs/openapi.yaml`
- ✅ Backend API changes (new endpoints, schemas)
- ✅ After pulling changes from git

```bash
pnpm codegen
```

### What Gets Generated

```typescript
// In packages/api-client/src/gen/

// API classes
export class AuthApi { ... }
export class TeamUpsApi { ... }
export class VenuesApi { ... }
export class BookingsApi { ... }

// Type definitions
export interface TeamUpOut { ... }
export interface BookingDetail { ... }
// etc.
```

### Using in Web App

```typescript
// apps/web/lib/api.ts
import { Configuration, TeamUpsApi } from '@team-up-main/api-client';

const config = new Configuration({ basePath: 'http://localhost:8080' });
export const apis = {
  teamups: new TeamUpsApi(config),
  // ...
};

// In pages/components
import { apis } from '@/lib/api';

const teamups = await apis.teamups.listTeamUps({ limit: 20 });
```

## Environment Variables

Create `.env.local` in `apps/web/`:

```bash
# API Base URL (default: http://localhost:8080)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Or for production
NEXT_PUBLIC_API_BASE_URL=https://api.teamup.com
```

## Troubleshooting

### Issue: `pnpm: command not found`

**Solution:** Install pnpm globally
```bash
npm install -g pnpm@10.11.0
```

### Issue: API client import errors

**Solution:** Regenerate the API client
```bash
pnpm codegen
```

### Issue: Port 3000 already in use

**Solution:** Change port in `apps/web/package.json`
```json
"scripts": {
  "dev": "next dev -p 3001"  // Change to 3001
}
```

Or kill the process on port 3000:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use a different port
cd apps/web
pnpm dev -- -p 3001
```

### Issue: Workspace dependency not found

**Solution:** Install from root, not inside workspace
```bash
# ❌ Wrong
cd apps/web
pnpm install

# ✅ Correct
cd /Users/hwangdouglas/Projects/team-up-main
pnpm install
```

### Issue: TypeScript errors after updating OpenAPI

**Solution:**
1. Regenerate API client: `pnpm codegen`
2. Restart dev server: `pnpm web:dev`
3. Restart TypeScript server in VSCode: `Cmd+Shift+P` → "Restart TS Server"

### Issue: Changes not reflecting in browser

**Solution:**
1. Hard refresh: `Cmd+Shift+R` (Chrome) or `Cmd+Opt+R` (Safari)
2. Clear Next.js cache:
   ```bash
   rm -rf apps/web/.next
   pnpm web:dev
   ```

## Development Workflow

### 1. Start Backend API (Python)

```bash
cd services/api
# Activate virtual environment
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
# Run Flask server
python -m flask run --port 8080
```

### 2. Start Web App (Next.js)

```bash
cd /Users/hwangdouglas/Projects/team-up-main
pnpm web:dev
```

### 3. Make Changes

- Edit files in `apps/web/`
- Changes hot-reload automatically
- TypeScript errors show in terminal

### 4. Update API

If backend API changes:
1. Update `docs/openapi.yaml`
2. Regenerate client: `pnpm codegen`
3. Dev server auto-restarts

## Next Steps

1. ✅ Install dependencies: `pnpm install`
2. ✅ Start dev server: `pnpm web:dev`
3. ✅ Open http://localhost:3000
4. ✅ Verify navbar appears on all pages
5. ✅ Test login/signup flow
6. ✅ Browse TeamUps page

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **pnpm Docs**: https://pnpm.io
- **OpenAPI Generator**: https://openapi-generator.tech

## Support

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Review `docs/NAVBAR_IMPLEMENTATION.md`
3. Review `docs/OPENAPI_UPDATES.md`
4. Check the terminal for error messages
