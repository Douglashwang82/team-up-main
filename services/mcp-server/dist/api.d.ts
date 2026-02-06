/**
 * API Client for TeamUp API
 */
export declare const getApiBaseUrl: () => string;
export declare const getAuthToken: () => string;
export interface ApiRequestOptions {
    method?: string;
    body?: unknown;
    requiresAuth?: boolean;
    token?: string;
}
/**
 * Make an API request to the TeamUp API
 */
export declare function apiRequest<T>(endpoint: string, options?: ApiRequestOptions): Promise<T>;
/**
 * Build URL search params from an object
 */
export declare function buildSearchParams(params: Record<string, string | number | undefined>): string;
//# sourceMappingURL=api.d.ts.map