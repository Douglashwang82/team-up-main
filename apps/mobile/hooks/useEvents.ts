import { useState, useEffect, useCallback, useMemo } from 'react';
import { apis } from "../lib/api";
import { EventOut } from "@team-up-main/api-client";
import EventFilterModal, { EventFilterState } from "../components/events/EventFilterModal";



const LIMIT = 20;

export function useEvents(initialKeyword: string = '', initialFilters: EventFilterState = {}) {
    const [keyword, setKeyword] = useState(initialKeyword);
    const [activeFilters, setActiveFilters] = useState<EventFilterState>(initialFilters);

    const [events, setEvents] = useState<EventOut[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination current states
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const loadEvents = useCallback(async (reset = true) => {
        try {
            if (reset) {
                setIsLoading(true);
                setError(null);
            } else {
                if (!hasMore || isLoadingMore) return;
                setIsLoadingMore(true);
            }

            const currentOffset = reset ? 0 : offset;

            const data = await apis.events.listEvents({
                status: 'open',
                limit: LIMIT,
                offset: currentOffset,
                keyword: keyword || undefined,
                category: activeFilters.category,
                division: activeFilters.division,
                datetimeAfter: activeFilters.datetime_after ? new Date(activeFilters.datetime_after) : undefined,
            });

            if (reset) {
                setEvents(data);
            } else {
                setEvents(prev => [...prev, ...data]);
            }

            setOffset(currentOffset + data.length);
            setHasMore(data.length === LIMIT);

        } catch (err) {
            console.error('Failed to load events:', err);
            if (reset) setError('Failed to load events. Pull to refresh.');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            setIsRefreshing(false);
        }
    }, [keyword, activeFilters, offset, hasMore, isLoadingMore]);

    // Load events when keyword or filters change
    useEffect(() => {
        loadEvents(true);
    }, [keyword, activeFilters]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadEvents(true);
    };

    const loadMoreEvents = () => {
        if (!isLoadingMore && hasMore && !isLoading && !isRefreshing) {
            loadEvents(false);
        }
    };

    return {
        events,
        isLoading,
        isRefreshing,
        isLoadingMore,
        error,
        keyword,
        setKeyword,
        activeFilters,
        setActiveFilters,
        loadEvents,
        handleRefresh,
        loadMoreEvents,
        hasMore,
    };
}
