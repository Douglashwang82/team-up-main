import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apis } from '../lib/api';
import { Alert } from 'react-native';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    widget?: {
        type: 'EventList' | 'Map' | 'CreateEvent' | 'MatchedUsers' | 'TrainingPlan';
        data?: any;
    };
}

const STORAGE_KEY = '@teamup_chat_history';

const DEFAULT_MESSAGE: Message = {
    id: '1',
    role: 'assistant',
    content: 'Hi! I am the Team-Up AI Assistant. You can ask me to "show events", "open map", or "create an event" to see the new widget integration in action!',
    timestamp: Date.now() - 10000,
};

export const useAIChat = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const PAGE_SIZE = 20;

    // 1. Load history on mount
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await apis.chat.listMessages({ limit: PAGE_SIZE });
                if (res && res.length > 0) {
                    const mapped: Message[] = res.map((m: any) => ({
                        id: m.id,
                        role: m.role as 'user' | 'assistant',
                        content: m.content,
                        timestamp: new Date(m.createdAt).getTime(),
                        widget: m.widget as any
                    }));
                    setMessages(mapped);
                    if (res.length < PAGE_SIZE) setHasMore(false);
                } else {
                    setMessages([DEFAULT_MESSAGE]);
                    setHasMore(false);
                }
            } catch (error) {
                console.warn("API Note: Failed to load chat history", error);
                setMessages([DEFAULT_MESSAGE]);
                setHasMore(false);
            } finally {
                setIsInitialized(true);
            }
        };

        loadHistory();
    }, []);

    const loadMore = async () => {
        if (isLoadingMore || !hasMore || messages.length === 0 || messages[0].id === '1') return;
        setIsLoadingMore(true);
        try {
            const res = await apis.chat.listMessages({ limit: PAGE_SIZE, cursor: messages[0].id });
            if (res && res.length > 0) {
                const mapped: Message[] = res.map((m: any) => ({
                    id: m.id,
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                    timestamp: new Date(m.createdAt).getTime(),
                    widget: m.widget as any
                }));
                setMessages(prev => [...mapped, ...prev]);
                if (res.length < PAGE_SIZE) setHasMore(false);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more messages:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const clearHistory = async () => {
        try {
            await apis.chat.clearMessages();
            setMessages([DEFAULT_MESSAGE]);
            setHasMore(false);
        } catch (error) {
            console.error('Failed to clear chat history:', error);
            Alert.alert("錯誤", "無法清除對話紀錄，請稍後再試。");
        }
    };

    const sendMessage = async (content: string) => {
        // 1. Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        // 2. Mock network delay -> generating structured Widget answers
        try {
            // The backend is now configured to return the Assistant's reply when receiving a User message
            const botRes = await apis.chat.postMessage({
                chatMessageIn: { role: 'user', content }
            });

            const botMsg: Message = {
                id: botRes.id,
                role: 'assistant',
                content: botRes.content,
                timestamp: new Date(botRes.createdAt).getTime(),
                widget: botRes.widget as any,
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.warn("API Note: Failed to post message. Falling back to local state.", error);
            // Fallback deterministic id for UI
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Hmm, I'm having trouble connecting right now. Please try again later!",
                timestamp: Date.now(),
                widget: undefined,
            };
            setMessages(prev => [...prev, botMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        isLoading,
        isInitialized,
        isLoadingMore,
        hasMore,
        loadMore,
        sendMessage,
        clearHistory,
    };
};
