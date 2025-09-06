# Team-Up Monorepo Seed

A full-stack starter template for modern web apps, featuring:
- Monorepo structure (frontend, backend, shared packages)
- Next.js (App Router) frontend
- Flask/PostgreSQL backend (with PostGIS)
- OpenAPI codegen for TypeScript API client
- Docker Compose for local development

## Structure

```
apps/
	web/        # Next.js frontend
packages/
	api-client/ # Generated TypeScript API client
services/
	api/        # Flask backend
docs/
	openapi.yaml # OpenAPI spec
```

## Getting Started

1. **Clone the repo:**
	 ```sh
	 git clone <your-repo-url>
	 cd team-up-main
	 ```

2. **Install dependencies:**
	 ```sh
	 pnpm install
	 ```

3. **Start backend and database:**
	 ```sh
	 cd services/api
	 docker compose up --build
	 ```

4. **Generate API client:**
	 ```sh
	 pnpm run regen
	 ```

5. **Start frontend:**
	 ```sh
	 cd apps/web
	 pnpm dev
	 ```

## Environment Variables

- Copy `.env.example` to `.env` in each app/service and fill in values.
- Common variables:
	- `NEXT_PUBLIC_API_BASE_URL` (frontend)
	- `DATABASE_URL`, `POSTGRES_DB`, etc. (backend)

## Codegen

- OpenAPI spec: `docs/openapi.yaml`
- Generate TypeScript client:
	```sh
	pnpm codegen
	```

## Database

- Uses PostgreSQL with PostGIS.
- Migrations managed by Alembic.
- Seed script:
	```sh
	docker compose exec api python -m scripts.seed
	```

## Customization

- Change project name, ports, and branding in config files.
- Add new apps/packages in `apps/` or `packages/`.

## License

MIT (or your choice)


## Workflow
1. Check sprint
2. Define/adjust openapi config
3. Backend work:
   1. update/adjust endpoints
   2. update/adjust alembic migrations. (revision, update head)
   3. verify openapi config
   4. run pnpm --filter ./services/api dev
4. Api-client
   1. run codegen
   2. run build
5. Frontend
   1. update api-client
   2. add/adjust pages
   3. run dev
6. Test
   1. Postman test raw api
   2. Run E2E flow
   3. verify happy paths
7. Version Control
   1. commit
   2. review
   3. merge
8. Deploy
