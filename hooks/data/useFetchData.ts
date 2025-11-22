/**
 * Unified Data Fetching Hook
 * 
 * Provides consistent data fetching with built-in:
 * - Loading states
 * - Error handling
 * - Automatic refetching
 * - Caching (optional)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UseFetchDataOptions<T> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  cache?: boolean;
  cacheKey?: string;
}

export interface UseFetchDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useFetchData<T = any>(
  options: UseFetchDataOptions<T>
): UseFetchDataResult<T> {
  const {
    url,
    method = 'GET',
    headers = {},
    body,
    enabled = true,
    refetchInterval,
    onSuccess,
    onError,
    cache: useCache = false,
    cacheKey,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Check cache
    if (useCache && cacheKey) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setData(cached.data);
        setLoading(false);
        setError(null);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const finalData = result.success ? result.data : result;

      setData(finalData);
      setError(null);

      // Cache data
      if (useCache && cacheKey) {
        cache.set(cacheKey, { data: finalData, timestamp: Date.now() });
      }

      onSuccess?.(finalData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setData(null);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [url, method, headers, body, enabled, useCache, cacheKey, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval) return;

    const interval = setInterval(() => {
      fetchData();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, fetchData]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
    
    // Update cache
    if (useCache && cacheKey) {
      cache.set(cacheKey, { data: newData, timestamp: Date.now() });
    }
  }, [useCache, cacheKey]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate,
  };
}

export default useFetchData;





