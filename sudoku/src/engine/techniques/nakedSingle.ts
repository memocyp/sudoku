// ---------------------------------------------------------------------------
// Naked Single: A cell has only one candidate left.
// ---------------------------------------------------------------------------

import type { Board, CandidateGrid, TechniqueResult, Digit } from '../types';
import { countBits, bitsToDigits, getRow, getCol } from '../utils';

/**
 * Find a cell with exactly one candidate and return a placement for it.
 */
export function nakedSingle(
  board: Board,
  candidates: CandidateGrid,
): TechniqueResult | null {
  for (let i = 0; i < 81; i++) {
    if (board[i] !== 0) continue;
    if (countBits(candidates[i]) === 1) {
      const digit = bitsToDigits(candidates[i])[0];
      return {
        technique: 'nakedSingle',
        primaryCells: [i],
        secondaryCells: [],
        eliminations: [],
        placements: [{ cell: i, digit: digit as Digit }],
        explanation: `R${getRow(i) + 1}C${getCol(i) + 1} can only be ${digit} (naked single).`,
      };
    }
  }
  return null;
}
