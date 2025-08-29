# @sportsmeet/api-client

Minimal TypeScript client for the Sports Meetup API (fetch-based). Works in **Next.js** and **Expo**.

## Install (inside your monorepo)
```bash
# if publishing to npm isn't desired, you can add this as a workspace package
pnpm -F @sportsmeet/api-client build
```

## Usage
```ts
import { client } from '@sportsmeet/api-client';

// health
await client.health();

// auth
const { access_token, refresh_token } = await client.auth.login({ email, password });

// events
const list = await client.events.list({ lat: 25.04, lng: 121.56, radius: 5 });
const created = await client.events.create({ title, sport, starts_at, ends_at, capacity, lat, lng });
await client.events.join(created.id, '00000000-0000-0000-0000-000000000001');
```

### Configure base URL or token
```ts
import { createClient } from '@sportsmeet/api-client';

const myClient = createClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  getAccessToken: () => localStorage.getItem('access_token') // or from context
});
```
