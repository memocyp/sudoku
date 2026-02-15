// ---------------------------------------------------------------------------
// Candidate computation
// ---------------------------------------------------------------------------

import type { Board, CandidateGrid, Digit } from './types';
import { getPeers, digitToBit, ALL_CANDIDATES } from './utils';

/**
 * Compute the full candidate grid for a board.
 * For each empty cell, start with all digits 1-9 and eliminate any
 * digit already placed in a peer cell.
 */
export function computeCandidates(board: Board): CandidateGrid {
  const candidates: CandidateGrid = new Array(81).fill(0);

  for (let i = 0; i < 81; i++) {
    if (board[i] !== 0) {
      candidates[i] = 0;
      continue;
    }

    let mask = ALL_CANDIDATES;
    for (const peer of getPeers(i)) {
      if (board[peer] !== 0) {
        mask &= ~digitToBit(board[peer] as Digit);
      }
    }
    candidates[i] = mask;
  }

  return candidates;
}
