export type Tokens = {
    access_token: string;
    refresh_token: string;
};
export type Sport = 'basketball' | 'badminton' | 'running' | 'gym' | 'tennis';
export interface SignupIn {
    email: string;
    password: string;
    display_name?: string | null;
}
export interface LoginIn {
    email: string;
    password: string;
}
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
export declare function createClient(options?: ClientOptions): {
    auth: {
        signup: (input: SignupIn) => Promise<Tokens>;
        login: (input: LoginIn) => Promise<Tokens>;
        refresh: (refresh_token: string) => Promise<Tokens>;
        me: () => Promise<{
            id: string;
            email: string;
            display_name?: string | null;
        }>;
    };
    events: {
        list: (params: {
            lat: number;
            lng: number;
            radius?: number;
            sport?: Sport;
            start?: string;
            end?: string;
            limit?: number;
            offset?: number;
        }) => Promise<EventOut[]>;
        create: (input: EventCreateIn) => Promise<{
            id: string;
        }>;
        join: (id: string) => Promise<{
            status: string;
        }>;
        leave: (id: string) => Promise<{
            status: string;
        }>;
        get: (id: string) => Promise<EventOut & {
            host_id?: string | null;
            attending?: number;
        }>;
    };
    health: () => Promise<{
        status: string;
    }>;
};
export declare const client: {
    auth: {
        signup: (input: SignupIn) => Promise<Tokens>;
        login: (input: LoginIn) => Promise<Tokens>;
        refresh: (refresh_token: string) => Promise<Tokens>;
        me: () => Promise<{
            id: string;
            email: string;
            display_name?: string | null;
        }>;
    };
    events: {
        list: (params: {
            lat: number;
            lng: number;
            radius?: number;
            sport?: Sport;
            start?: string;
            end?: string;
            limit?: number;
            offset?: number;
        }) => Promise<EventOut[]>;
        create: (input: EventCreateIn) => Promise<{
            id: string;
        }>;
        join: (id: string) => Promise<{
            status: string;
        }>;
        leave: (id: string) => Promise<{
            status: string;
        }>;
        get: (id: string) => Promise<EventOut & {
            host_id?: string | null;
            attending?: number;
        }>;
    };
    health: () => Promise<{
        status: string;
    }>;
};
