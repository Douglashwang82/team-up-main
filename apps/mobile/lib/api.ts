import {
    Configuration,
    AuthApi,
    HealthApi,
    VenuesApi,
    EventsApi,
    TicketsApi,
    NotificationsApi,
} from '@team-up-main/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use localhost for iOS simulator, 10.0.2.2 for Android emulator
const localhost = Platform.select({
    ios: 'http://localhost:8080',
    android: 'http://10.0.2.2:8080',
});

const basePath = process.env.EXPO_PUBLIC_API_URL || localhost;

const getAccessToken = async () => {
    try {
        return (await AsyncStorage.getItem('accessToken')) || '';
    } catch {
        return '';
    }
};

const getRefreshToken = async () => {
    try {
        return (await AsyncStorage.getItem('refreshToken')) || undefined;
    } catch {
        return undefined;
    }
};

let refreshPromise: Promise<void> | null = null;

async function customFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const at = await getAccessToken();
    // @ts-ignore
    const origReq = new Request(input, init);
    const headers = new Headers(origReq.headers);

    if (at && !headers.get('Authorization')) {
        headers.set('Authorization', `Bearer ${at}`);
    }

    // @ts-ignore
    let res = await fetch(origReq, { ...init, headers });

    if (res.status !== 401) return res;

    const rt = await getRefreshToken();
    if (!rt) return res;

    if (!refreshPromise) {
        refreshPromise = (async () => {
            try {
                const r = await fetch(`${basePath}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken: rt }),
                });

                if (!r.ok) {
                    throw new Error('Refresh failed');
                }

                const data = await r.json();
                if (data.accessToken) {
                    await AsyncStorage.setItem('accessToken', data.accessToken);
                }
                if (data.refreshToken) {
                    await AsyncStorage.setItem('refreshToken', data.refreshToken);
                }
            } catch (e) {
                await AsyncStorage.removeItem('accessToken');
                await AsyncStorage.removeItem('refreshToken');
                throw e;
            }
        })().finally(() => {
            refreshPromise = null;
        });
    }

    try {
        await refreshPromise;
        const newAt = await getAccessToken();
        // @ts-ignore
        const retryReq = new Request(input, init);
        const retryHeaders = new Headers(retryReq.headers);
        if (newAt) {
            retryHeaders.set('Authorization', `Bearer ${newAt}`);
        }
        // @ts-ignore
        return fetch(retryReq, { ...init, headers: retryHeaders });
    } catch {
        return res;
    }
}

const config = new Configuration({
    basePath,
    accessToken: async () => {
        const t = await getAccessToken();
        return t ?? '';
    },
    fetchApi: customFetch as any,
});

export const apis = {
    auth: new AuthApi(config),
    health: new HealthApi(config),
    venues: new VenuesApi(config),
    events: new EventsApi(config),
    tickets: new TicketsApi(config),
    notifications: new NotificationsApi(config),
};
