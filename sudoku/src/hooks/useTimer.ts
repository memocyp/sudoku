'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';

/**
 * Format a duration in milliseconds to "M:SS" display format.
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Drives the game timer by calling `tick()` every second while
 * `isTimerRunning` is true. Returns the current elapsed time and
 * running state.
 */
export function useTimer() {
  const isTimerRunning = useGameStore((s) => s.isTimerRunning);
  const tick = useGameStore((s) => s.tick);
  const elapsedMs = useGameStore((s) => s.elapsedMs);

  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, tick]);

  return { elapsedMs, isTimerRunning };
}
