'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';

interface UseApiDataOptions<T> {
  endpoint: string;
  fallback: T;
  enabled?: boolean;
}

interface UseApiDataResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isUsingFallback: boolean;
}

export function useApiData<T>({ endpoint, fallback, enabled = true }: UseApiDataOptions<T>): UseApiDataResult<T> {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<T> = await api.get<T>(endpoint);
      if (res.success) {
        setData(res.data);
        setIsUsingFallback(false);
      } else {
        setData(fallback);
        setIsUsingFallback(true);
      }
    } catch {
      setData(fallback);
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [endpoint, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: fetchData, isUsingFallback };
}
