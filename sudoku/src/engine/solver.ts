// ---------------------------------------------------------------------------
// Solver: technique-based and brute-force backtracking
// ---------------------------------------------------------------------------

import type { Board, CandidateGrid, SolveStep, Digit } from './types';
import { computeCandidates } from './candidates';
import { TECHNIQUES_ORDERED } from './techniques';
import { isValidPlacement } from './validator';
import { removeCandidate, getPeers } from './utils';

export interface SolveResult {
  steps: SolveStep[];
  board: Board;
  candidates: CandidateGrid;
  solved: boolean;
}

/**
 * Technique-based solver. Tries each technique in order from easiest to
 * hardest, applies the first one that succeeds, and repeats until the
 * puzzle is solved or no technique can make progress.
 */
export function solve(board: Board): SolveResult {
  const b = board.slice();
  let cands = computeCandidates(b);
  const steps: SolveStep[] = [];

  let progress = true;
  while (progress) {
    progress = false;

    // Check if solved
    if (b.every((v) => v !== 0)) {
      return { steps, board: b, candidates: cands, solved: true };
    }

    for (const entry of TECHNIQUES_ORDERED) {
      const result = entry.fn(b, cands);
      if (!result) continue;

      // Apply placements
      for (const { cell, digit } of result.placements) {
        b[cell] = digit;
        // Remove this digit from all peers' candidates
        cands[cell] = 0;
        for (const peer of getPeers(cell)) {
          cands[peer] = removeCandidate(cands[peer], digit);
        }
      }

      // Apply eliminations
      for (const { cell, digit } of result.eliminations) {
        cands[cell] = removeCandidate(cands[cell], digit);
      }

      steps.push({
        technique: result.technique,
        result,
        boardAfter: b.slice(),
        candidatesAfter: cands.slice(),
      });

      progress = true;
      break; // Restart from easiest technique
    }
  }

  const solved = b.every((v) => v !== 0);
  return { steps, board: b, candidates: cands, solved };
}

/**
 * Brute-force backtracking solver. Returns the solved board or null
 * if no solution exists.
 */
export function solveWithBacktracking(board: Board): Board | null {
  const b = board.slice();

  function doSolve(): boolean {
    // Find the first empty cell with the fewest candidates (MRV heuristic)
    let minIdx = -1;
    let minCount = 10;

    for (let i = 0; i < 81; i++) {
      if (b[i] !== 0) continue;
      let count = 0;
      for (let d = 1; d <= 9; d++) {
        if (isValidPlacement(b, i, d as Digit)) count++;
      }
      if (count === 0) return false; // dead end
      if (count < minCount) {
        minCount = count;
        minIdx = i;
        if (count === 1) break; // can't do better
      }
    }

    if (minIdx === -1) return true; // all cells filled

    for (let d = 1; d <= 9; d++) {
      const digit = d as Digit;
      if (!isValidPlacement(b, minIdx, digit)) continue;
      b[minIdx] = digit;
      if (doSolve()) return true;
      b[minIdx] = 0;
    }

    return false;
  }

  return doSolve() ? b : null;
}

/** Alias for solveWithBacktracking */
export const solveBruteForce = solveWithBacktracking;
