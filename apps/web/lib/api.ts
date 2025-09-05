// apps/web/lib/api.ts
'use client';

/**
 * 這版專為 @openapitools/OpenAPI Generator (typescript-fetch) 設計：
 * - 使用 Configuration.basePath + accessToken
 * - 自訂 fetch：401 時用 refresh_token 換新 access_token，然後重試原請求一次
 * - 與產生的 API 類別（如 EventsApi、AuthApi、HealthApi）搭配
 */

import {
  Configuration,
  // 下面的類名依你的 OpenAPI tag 生成，常見如：
  // EventsApi, AuthApi, HealthApi ...
  // 如果你的類名不同，改成實際輸出的名稱即可。
  AuthApi, EventsApi, HealthApi
} from '@team-up-main/api-client';

const basePath =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const getAccessToken = () =>
  typeof window === 'undefined'
    ? ''
    : localStorage.getItem('access_token') || '';

const getRefreshToken = () =>
  typeof window === 'undefined'
    ? undefined
    : localStorage.getItem('refresh_token') || undefined;

// 防止同時多個 401 造成「刷新風暴」
let refreshPromise: Promise<void> | null = null;

/**
 * 自訂 fetch：
 * 1) 先照常送出
 * 2) 若 401，且有 refresh_token → 呼叫 /auth/refresh
 * 3) 更新 localStorage 後，帶新 Access Token 重送原請求一次
 */
async function customFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status !== 401) return res;

  const rt = getRefreshToken();
  if (!rt) return res; // 沒 refresh_token，就讓 401 照常回傳

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const r = await fetch(`${basePath}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!r.ok) {
        refreshPromise = null;
        throw new Error(`Refresh failed: ${r.status}`);
      }
      const data: any = await r.json();
      if (typeof window !== 'undefined') {
        if (data.access_token) localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
      }
    })().finally(() => {
      // 完成或失敗都重置，讓下一次 401 能再觸發
      refreshPromise = null;
    });
  }

  try {
    await refreshPromise; // 等刷新完成
  } catch {
    return res; // 刷新失敗就維持原 401
  }

  // 用最新 token 重送一次原請求
  const at = getAccessToken();
  const origReq = new Request(input as any, init);
  const headers = new Headers(origReq.headers);
  if (at && !headers.get('Authorization')) headers.set('Authorization', `Bearer ${at}`);
  return fetch(origReq, { ...init, headers });
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
  events: new EventsApi(config),
  health: new HealthApi(config),
};

// 若你偏好與先前相似的用法，也可包一層別名（依實際方法名調整或直接用 apis.* 即可）
// 例如：const list = await apis.events.listAllEvents({ limit: 20 });
