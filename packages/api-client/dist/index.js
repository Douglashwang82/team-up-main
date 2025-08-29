const defaultBase = (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || process.env.API_BASE_URL)) ||
    'http://localhost:8080';
function buildHeaders(token) {
    const h = { 'Content-Type': 'application/json' };
    if (token)
        h['Authorization'] = `Bearer ${token}`;
    return h;
}
async function http(path, init = {}, opts = {}) {
    const base = opts.baseUrl || defaultBase;
    const f = opts.fetchImpl || fetch;
    const res = await f(`${base}${path}`, init);
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
    }
    return (await res.json());
}
export function createClient(options = {}) {
    const getToken = () => options.getAccessToken?.();
    return {
        auth: {
            signup: (input) => http('/auth/signup', { method: 'POST', headers: buildHeaders(), body: JSON.stringify(input) }, options),
            login: (input) => http('/auth/login', { method: 'POST', headers: buildHeaders(), body: JSON.stringify(input) }, options),
            refresh: (refresh_token) => http('/auth/refresh', { method: 'POST', headers: buildHeaders(), body: JSON.stringify({ refresh_token }) }, options),
            me: () => http('/auth/me', { method: 'GET', headers: buildHeaders(getToken() || undefined) }, options),
        },
        events: {
            list: (params) => {
                const q = new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => {
                    if (v === undefined || v === null)
                        return acc;
                    acc[k] = String(v);
                    return acc;
                }, {})).toString();
                return http(`/events?${q}`, { method: 'GET', headers: buildHeaders(getToken() || undefined) }, options);
            },
            create: (input) => http('/events', { method: 'POST', headers: buildHeaders(getToken() || undefined), body: JSON.stringify(input) }, options),
            join: (id) => http(`/events/${id}/join`, { method: 'POST', headers: buildHeaders(getToken() || undefined) }, options),
            leave: (id) => http(`/events/${id}/leave`, { method: 'DELETE', headers: buildHeaders(getToken() || undefined) }, options),
            get: (id) => http(`/events/${id}`, { method: 'GET', headers: buildHeaders(getToken() || undefined) }, options),
        },
        health: () => http('/health', { method: 'GET' }, options),
    };
}
export const client = createClient();
