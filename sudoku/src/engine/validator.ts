// ---------------------------------------------------------------------------
// Board validation
// ---------------------------------------------------------------------------

import type { Board, Digit, CellIndex } from './types';
import { getRow, getCol, getBox, getRowCells, getColCells, getBoxCells } from './utils';

/**
 * Check if placing a digit at a cell would conflict with existing values.
 * Returns true if the placement is valid (no conflicts).
 */
export function isValidPlacement(
  board: Board,
  cell: CellIndex,
  digit: Digit,
): boolean {
  const row = getRow(cell);
  const col = getCol(cell);
  const box = getBox(cell);

  for (const c of getRowCells(row)) {
    if (c !== cell && board[c] === digit) return false;
  }
  for (const c of getColCells(col)) {
    if (c !== cell && board[c] === digit) return false;
  }
  for (const c of getBoxCells(box)) {
    if (c !== cell && board[c] === digit) return false;
  }

  return true;
}

/**
 * Check if a house (row/col/box) has any duplicate filled digits.
 */
function houseValid(board: Board, cells: readonly CellIndex[]): boolean {
  const seen = new Set<number>();
  for (const c of cells) {
    const v = board[c];
    if (v !== 0) {
      if (seen.has(v)) return false;
      seen.add(v);
    }
  }
  return true;
}

/**
 * Check if the entire board state is consistent (no duplicates in any house).
 * Does NOT check completeness.
 */
export function isBoardConsistent(board: Board): boolean {
  for (let i = 0; i < 9; i++) {
    if (!houseValid(board, getRowCells(i))) return false;
    if (!houseValid(board, getColCells(i))) return false;
    if (!houseValid(board, getBoxCells(i))) return false;
  }
  return true;
}

/**
 * Check if the board is a valid complete solution (all 81 cells filled, no conflicts).
 */
export function isValidSolution(board: Board): boolean {
  if (board.some((v) => v === 0)) return false;
  return isBoardConsistent(board);
}

/**
 * Count the number of solutions for a board using backtracking.
 * Stops counting at `limit` (default 2) for efficiency.
 */
export function countSolutions(board: Board, limit: number = 2): number {
  const b = board.slice();
  let count = 0;

  function solve(): boolean {
    // Find the first empty cell
    let minIdx = -1;
    let minCandidates = 10;

    for (let i = 0; i < 81; i++) {
      if (b[i] === 0) {
        // Count valid digits for this cell
        let numCandidates = 0;
        for (let d = 1; d <= 9; d++) {
          if (isValidPlacement(b, i, d as Digit)) {
            numCandidates++;
          }
        }
        if (numCandidates < minCandidates) {
          minCandidates = numCandidates;
          minIdx = i;
          if (numCandidates === 0) return false;
          if (numCandidates === 1) break;
        }
      }
    }

    // No empty cells: found a solution
    if (minIdx === -1) {
      count++;
      return count >= limit;
    }

    // Try each valid digit
    for (let d = 1; d <= 9; d++) {
      const digit = d as Digit;
      if (isValidPlacement(b, minIdx, digit)) {
        b[minIdx] = digit;
        if (solve()) return true;
        b[minIdx] = 0;
      }
    }

    return false;
  }

  solve();
  return count;
}
