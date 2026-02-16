'use client';

import { useGameStore, HintDisplayData } from '@/stores/gameStore';
import { MAX_HINTS_PER_PUZZLE } from '@/engine/hint';

export interface UseHintsReturn {
  hint: HintDisplayData | null;
  requestHint: () => void;
  requestMoreDetail: () => void;
  dismissHint: () => void;
  hintsRemaining: number;
  canRequestHint: boolean;
  canGetMoreDetail: boolean;
}

/**
 * Wraps the game store hint functionality with convenience properties.
 * Max hints per puzzle is defined in the engine hint module.
 */
export function useHints(): UseHintsReturn {
  const hint = useGameStore((s) => s.hintResult);
  const requestHint = useGameStore((s) => s.requestHint);
  const requestMoreDetail = useGameStore((s) => s.requestMoreDetail);
  const dismissHint = useGameStore((s) => s.dismissHint);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const currentHintLevel = useGameStore((s) => s.currentHintLevel);
  const isComplete = useGameStore((s) => s.isComplete);

  const hintsRemaining = Math.max(0, MAX_HINTS_PER_PUZZLE - hintsUsed);
  const canRequestHint = !isComplete && hintsRemaining > 0 && !hint;
  const canGetMoreDetail = !!hint && currentHintLevel < 4;

  return {
    hint,
    requestHint,
    requestMoreDetail,
    dismissHint,
    hintsRemaining,
    canRequestHint,
    canGetMoreDetail,
  };
}
