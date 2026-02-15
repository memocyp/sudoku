// ---------------------------------------------------------------------------
// Hidden Single: A digit has only one possible cell in a house.
// ---------------------------------------------------------------------------

import type { Board, CandidateGrid, TechniqueResult, Digit, CellIndex } from '../types';
import { hasCandidate, getRow, getCol, getRowCells, getColCells, getBoxCells } from '../utils';

/**
 * For each house (row/col/box), find digits that appear in only one cell's candidates.
 */
export function hiddenSingle(
  board: Board,
  candidates: CandidateGrid,
): TechniqueResult | null {
  const houses: { cells: CellIndex[]; name: string }[] = [];
  for (let i = 0; i < 9; i++) {
    houses.push({ cells: getRowCells(i), name: `row ${i + 1}` });
    houses.push({ cells: getColCells(i), name: `column ${i + 1}` });
    houses.push({ cells: getBoxCells(i), name: `box ${i + 1}` });
  }

  for (const house of houses) {
    for (let d = 1; d <= 9; d++) {
      const digit = d as Digit;
      // Skip if digit already placed in this house
      if (house.cells.some((c) => board[c] === digit)) continue;

      const possibleCells = house.cells.filter(
        (c) => board[c] === 0 && hasCandidate(candidates[c], digit),
      );

      if (possibleCells.length === 1) {
        const cell = possibleCells[0];
        return {
          technique: 'hiddenSingle',
          primaryCells: [cell],
          secondaryCells: house.cells.filter((c) => c !== cell && board[c] === 0),
          eliminations: [],
          placements: [{ cell, digit }],
          explanation: `${digit} can only go in R${getRow(cell) + 1}C${getCol(cell) + 1} in ${house.name} (hidden single).`,
        };
      }
    }
  }
  return null;
}
