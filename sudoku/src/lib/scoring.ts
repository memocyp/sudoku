import type { Difficulty } from '@/engine/types';
import { DIFFICULTY_MAP } from '@/engine/types';

/**
 * Calculate a numeric score for a completed puzzle.
 *
 * Base score comes from the difficulty level multiplied by 1000.
 * Penalties are subtracted for time taken, hints used, and mistakes made.
 * The result is clamped to a minimum of 0.
 */
export function calculateScore(
  solveTimeMs: number,
  difficulty: Difficulty,
  hintsUsed: number,
  mistakesMade: number,
): number {
  const level = DIFFICULTY_MAP[difficulty];
  const baseScore = level * 1000;
  const timePenalty = Math.floor(solveTimeMs / 1000);
  const hintPenalty = hintsUsed * 50;
  const mistakePenalty = mistakesMade * 25;
  return Math.max(0, baseScore - timePenalty - hintPenalty - mistakePenalty);
}

/**
 * Format a duration in milliseconds to a human-readable string.
 *
 * Examples: "45s", "3m 12s", "1h 5m 30s"
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
