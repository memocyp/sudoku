'use client';

import { useGameStore } from '@/stores/gameStore';

/**
 * Convenience wrapper that returns the entire game store.
 */
export function useGame() {
  return useGameStore();
}
