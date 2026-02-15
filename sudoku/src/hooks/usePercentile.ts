'use client';

import { useEffect, useState } from 'react';
import { Difficulty } from '@/engine/types';

export interface UsePercentileReturn {
  percentile: number | null;
  loading: boolean;
}

/**
 * Fetches the user's percentile ranking for a given difficulty and solve time
 * from the API. Returns null while loading or if the request fails.
 */
export function usePercentile(
  difficulty: Difficulty | null,
  solveTimeMs: number | null,
): UsePercentileReturn {
  const [percentile, setPercentile] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (difficulty === null || solveTimeMs === null || solveTimeMs <= 0) {
      setPercentile(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function fetchPercentile() {
      try {
        const params = new URLSearchParams({
          difficulty: String(difficulty),
          solveTimeMs: String(solveTimeMs),
        });
        const response = await fetch(`/api/percentile?${params.toString()}`);

        if (!response.ok) {
          setPercentile(null);
          return;
        }

        const data: { percentile: number } = await response.json();
        if (!cancelled) {
          setPercentile(data.percentile);
        }
      } catch {
        if (!cancelled) {
          setPercentile(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPercentile();

    return () => {
      cancelled = true;
    };
  }, [difficulty, solveTimeMs]);

  return { percentile, loading };
}
