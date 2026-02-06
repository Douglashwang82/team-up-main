/**
 * API Client for TeamUp API
 */

// Configuration from environment
export const getApiBaseUrl = () =>
  process.env.TEAMUP_API_URL || "http://localhost:8000";
export const getAuthToken = () => process.env.TEAMUP_AUTH_TOKEN || "";

export interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  requiresAuth?: boolean;
  token?: string;
}

/**
 * Make an API request to the TeamUp API
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = "GET", body, requiresAuth = false, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const authToken = token || getAuthToken();
  if (requiresAuth && authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Build URL search params from an object
 */
export function buildSearchParams(
  params: Record<string, string | number | undefined>
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  }
  return searchParams.toString();
}
