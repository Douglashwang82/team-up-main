export type Tokens = { access_token: string; refresh_token: string };
export type Sport = 'basketball' | 'badminton' | 'running' | 'gym' | 'tennis';

export interface SignupIn { email: string; password: string; display_name?: string | null; }
export interface LoginIn { email: string; password: string; }

export interface EventCreateIn {
  title: string;
  sport: Sport;
  starts_at: string;
  ends_at: string;
  capacity: number;
  lat: number;
  lng: number;
  address?: string | null;
}

export interface EventOut {
  id: string;
  title: string;
  sport: Sport;
  starts_at: string;
  ends_at: string;
  capacity: number;
  attending?: number;
  address?: string | null;
}

export interface ClientOptions {
  baseUrl?: string;
  getAccessToken?: () => string | null | undefined;
  fetchImpl?: typeof fetch;
}

const defaultBase =
  (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || process.env.API_BASE_URL)) ||
  'http://localhost:8080';

function buildHeaders(token?: string): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function http<T>(path: string, init: RequestInit = {}, opts: ClientOptions = {}): Promise<T> {
  const base = opts.baseUrl || defaultBase;
  const f = opts.fetchImpl || fetch;
  const res = await f(`${base}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
}

export function createClient(options: ClientOptions = {}) {
  const getToken = () => options.getAccessToken?.();

  return {
    auth: {
      signup: (input: SignupIn) =>
        http<Tokens>('/auth/signup', { method: 'POST', headers: buildHeaders(), body: JSON.stringify(input) }, options),
      login: (input: LoginIn) =>
        http<Tokens>('/auth/login', { method: 'POST', headers: buildHeaders(), body: JSON.stringify(input) }, options),
      refresh: (refresh_token: string) =>
        http<Tokens>('/auth/refresh', { method: 'POST', headers: buildHeaders(), body: JSON.stringify({ refresh_token }) }, options),
      me: () => http<{ id: string; email: string; display_name?: string | null }>('/auth/me', { method: 'GET', headers: buildHeaders(getToken() || undefined) }, options),
    },
    events: {
      list: (params: { lat: number; lng: number; radius?: number; sport?: Sport; start?: string; end?: string; limit?: number; offset?: number }) => {
        const q = new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => {
          if (v === undefined || v === null) return acc;
          acc[k] = String(v);
          return acc;
        }, {} as Record<string, string>)).toString();
        return http<EventOut[]>(`/events?${q}`, { method: 'GET', headers: buildHeaders(getToken() || undefined) }, options);
      },
      create: (input: EventCreateIn) =>
        http<{ id: string }>('/events', { method: 'POST', headers: buildHeaders(getToken() || undefined), body: JSON.stringify(input) }, options),
      join: (id: string) =>
        http<{ status: string }>(`/events/${id}/join`, { method: 'POST', headers: buildHeaders(getToken() || undefined) }, options),
      leave: (id: string) =>
        http<{ status: string }>(`/events/${id}/leave`, { method: 'DELETE', headers: buildHeaders(getToken() || undefined) }, options),
      get: (id: string) =>
        http<EventOut & { host_id?: string | null; attending?: number }>(`/events/${id}`, { method: 'GET', headers: buildHeaders(getToken() || undefined) }, options),
    },
    health: () => http<{ status: string }>('/health', { method: 'GET' }, options),
  };
}

export const client = createClient();
