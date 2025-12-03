"use client";

import { useState, useEffect, useCallback } from "react";
import { searchAllGrants, Grant, SearchFilters } from "@/lib/grants-api";

interface UseGrantsOptions {
  initialPage?: number;
  limit?: number;
}

interface UseGrantsReturn {
  grants: Grant[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  setFilters: (filters: SearchFilters) => void;
  nextPage: () => void;
  previousPage: () => void;
  refresh: () => void;
}

export function useGrants(options: UseGrantsOptions = {}): UseGrantsReturn {
  const { initialPage = 1, limit = 12 } = options;

  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [filters, setFiltersState] = useState<SearchFilters>({});

  const fetchGrants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await searchAllGrants(currentPage, limit, filters);
      
      setGrants(response.grants);
      setTotalCount(response.totalCount);
      setHasNextPage(response.hasNext);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch grants");
      setGrants([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, limit]);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  const setFilters = useCallback((newFilters: SearchFilters) => {
    setFiltersState(newFilters);
    setCurrentPage(1);
  }, []);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const refresh = useCallback(() => {
    fetchGrants();
  }, [fetchGrants]);

  return {
    grants,
    loading,
    error,
    totalCount,
    currentPage,
    hasNextPage,
    hasPreviousPage: currentPage > 1,
    setFilters,
    nextPage,
    previousPage,
    refresh,
  };
}

// Re-export types for convenience
export type { Grant, SearchFilters } from "@/lib/grants-api";
