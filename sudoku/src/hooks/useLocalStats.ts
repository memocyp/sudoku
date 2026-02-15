'use client';

import { useCallback } from 'react';
import { getItem, setItem, removeItem } from '@/lib/localStorage';

const STATS_KEY = 'sudoku_stats';

export interface SolveRecord {
  difficulty: string;
  solveTimeMs: number;
  hintsUsed: number;
  mistakesMade: number;
  completedAt: string; // ISO 8601 date string
}

/**
 * Read the raw records array from localStorage.
 */
function readRecords(): SolveRecord[] {
  const raw = getItem(STATS_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as SolveRecord[];
    return [];
  } catch {
    return [];
  }
}

/**
 * Write the records array to localStorage.
 */
function writeRecords(records: SolveRecord[]): void {
  setItem(STATS_KEY, JSON.stringify(records));
}

/**
 * Hook for managing anonymous solve statistics in localStorage.
 *
 * All methods are SSR-safe — they return empty / null values on the server.
 */
export function useLocalStats() {
  const getLocalStats = useCallback((): SolveRecord[] => {
    return readRecords();
  }, []);

  const addLocalStat = useCallback((record: SolveRecord): void => {
    const records = readRecords();
    records.push(record);
    writeRecords(records);
  }, []);

  const clearLocalStats = useCallback((): void => {
    removeItem(STATS_KEY);
  }, []);

  const getBestTime = useCallback((difficulty: string): number | null => {
    const records = readRecords();
    const matching = records.filter((r) => r.difficulty === difficulty);
    if (matching.length === 0) return null;

    let best = Infinity;
    for (const r of matching) {
      if (r.solveTimeMs < best) best = r.solveTimeMs;
    }
    return best === Infinity ? null : best;
  }, []);

  return {
    getLocalStats,
    addLocalStat,
    clearLocalStats,
    getBestTime,
  };
}
