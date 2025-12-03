"use client";

import { useState, useEffect, useCallback } from "react";
import { searchAllGrants, Grant } from "@/lib/grants-api";

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
  search: (keywords: string) => void;
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
  const [searchKeyword, setSearchKeyword] = useState("");

  const fetchGrants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await searchAllGrants(searchKeyword, currentPage, limit);
      
      setGrants(response.grants);
      setTotalCount(response.totalCount);
      setHasNextPage(response.hasNext);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch grants");
      setGrants([]);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, currentPage, limit]);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  const search = useCallback((keyword: string) => {
    setSearchKeyword(keyword.trim());
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
    search,
    nextPage,
    previousPage,
    refresh,
  };
}

// Re-export Grant type for convenience
export type { Grant } from "@/lib/grants-api";
