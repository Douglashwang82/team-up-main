// apps/web/lib/api.ts
'use client';

/**
 * 這版專為 @openapitools/OpenAPI Generator (typescript-fetch) 設計：
 * - 使用 Configuration.basePath + accessToken
 * - 自訂 fetch：401 時用 refresh_token 換新 access_token，然後重試原請求一次
 * - 與產生的 API 類別（如 TeamUpsApi、AuthApi、HealthApi）搭配
 */

import {
  Configuration,
  // 下面的類名依你的 OpenAPI tag 生成，常見如：
  // TeamUpsApi, AuthApi, HealthApi ...
  // 如果你的類名不同，改成實際輸出的名稱即可。
  AuthApi, HealthApi,
  VenuesApi,
  EventsApi,
  NotificationsApi,
  UserApi,
} from '@team-up-main/api-client';

const basePath =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const getAccessToken = () =>
  typeof window === 'undefined'
    ? ''
    : localStorage.getItem('accessToken') || '';

const getRefreshToken = () =>
  typeof window === 'undefined'
    ? undefined
    : localStorage.getItem('refreshToken') || undefined;

// 防止同時多個 401 造成「刷新風暴」
let refreshPromise: Promise<void> | null = null;

/**
 * 自訂 fetch：
 * 1) 先照常送出, 若有Access Token就帶上 Authorization Header
 * 2) 若回傳 401，且有 refresh_token，則呼叫 /auth/refresh 換新 Access Token
 * 3) 更新 localStorage 後，帶新 Access Token 重送原請求一次
 * 4) 若刷新失敗，則維持原 401 回應不變，讓呼叫端自行處理（例如導向登入頁面）
 */
async function customFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {

  // Dealy 3 seconds for testing
  // await new Promise(resolve => setTimeout(resolve, 1500));

  // Always send Authorization header if access token exists
  const at = getAccessToken();
  const origReq = new Request(input as any, init);
  const headers = new Headers(origReq.headers);
  if (at && !headers.get('Authorization')) headers.set('Authorization', `Bearer ${at}`);

  let res = await fetch(origReq, { ...init, headers });
  if (res.status !== 401) return res;

  if (!res.ok) {
    // Login failed, clear tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Clear auth cookie
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    // Optionally, show error to user
  }

  // If 401 and refresh token exists, try to refresh
  const rt = getRefreshToken();
  if (!rt) return res;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const r = await fetch(`${basePath}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!r.ok) {
        refreshPromise = null;
        throw new Error(`Refresh failed: ${r.status}`);
      }
      const data: any = await r.json();
      if (typeof window !== 'undefined') {
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          // Update auth cookie
          document.cookie = `auth_token=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        }
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  try {
    await refreshPromise;
  } catch {
    return res;
  }

  // Retry original request with new access token
  const newAt = getAccessToken();
  const retryReq = new Request(input as any, init);
  const retryHeaders = new Headers(retryReq.headers);
  if (newAt && !retryHeaders.get('Authorization')) retryHeaders.set('Authorization', `Bearer ${newAt}`);
  return fetch(retryReq, { ...init, headers: retryHeaders });
}

// 共用設定（所有產生的 API 都用它）
const config = new Configuration({
  basePath,
  // Must be: string | Promise<string> | ((name?, scopes?) => string | Promise<string>)
  accessToken: (_name?: string, _scopes?: string[]) => {
    const t = getAccessToken();
    return t ?? '';             // always a string
  },
  fetchApi: customFetch,
});

// 直接導出已配置好的 API 實例（依你的產生器輸出的類別調整）
export const apis = {
  auth: new AuthApi(config),
  health: new HealthApi(config),
  venues: new VenuesApi(config),
  events: new EventsApi(config),
  notifications: new NotificationsApi(config),
  user: new UserApi(config),
};

// 若你偏好與先前相似的用法，也可包一層別名（依實際方法名調整或直接用 apis.* 即可）
// 例如：const list = await apis.teamups.listTeamUps({ limit: 20 });
