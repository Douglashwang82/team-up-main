'use client';
import { createClient } from '@team-up-main/api-client';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const getAccessToken = () => (typeof window === 'undefined' ? undefined : localStorage.getItem('access_token') || undefined);
const getRefreshToken = () => (typeof window === 'undefined' ? undefined : localStorage.getItem('refresh_token') || undefined);

export const raw = createClient({ baseUrl, getAccessToken });

async function withRefresh<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    if (!/^\s*401\b/.test(String(e?.message))) throw e;
    const rt = getRefreshToken();
    if (!rt) throw e;
    // refresh then retry once
    const { access_token, refresh_token } = await raw.auth.refresh(rt);
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    return await fn();
  }
}

export const api = {
  auth: {
    login: raw.auth.login,
    signup: raw.auth.signup,
    me: () => withRefresh(() => raw.auth.me()),
  },
  events: {
    list: (p: Parameters<typeof raw.events.list>[0]) => withRefresh(() => raw.events.list(p)),
    create: (p: Parameters<typeof raw.events.create>[0]) => withRefresh(() => raw.events.create(p)),
    join: (id: string) => withRefresh(() => raw.events.join(id)),
    leave: (id: string) => withRefresh(() => raw.events.leave(id)),
    get: (id: string) => withRefresh(() => raw.events.get(id)),
  },
  health: raw.health,
};
