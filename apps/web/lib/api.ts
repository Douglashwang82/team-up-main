'use client';
import { createClient } from '@team-up-main/api-client';
export const api = createClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  getAccessToken: ()=> (typeof window==='undefined'?undefined:localStorage.getItem('access_token')||undefined),
});
