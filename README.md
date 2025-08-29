# team-up-main
# Apply Updates (Sprint 1 — Security & Rules)

1) **API**
   - Copy `services/api/app/core/auth.py` (new), replace `services/api/app/routes/auth.py` and `.../routes/events.py`.
   - Restart API.

2) **SDK**
   - Replace `packages/api-client/src/index.ts`, then:
     ```bash
     pnpm -F @team-up-main/api-client build
     ```

3) **Web**
   - Replace `apps/web/app/events/page.tsx`.
   - Ensure `.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`.

4) **Test**
   - Login → `/login`
   - Create → `/events/new` (needs Bearer)
   - Join/Leave → `/events`
