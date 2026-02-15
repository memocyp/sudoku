// ---------------------------------------------------------------------------
// Hidden Pairs: Two digits that only appear in the same two cells in a house.
// All other candidates can be eliminated from those two cells.
// ---------------------------------------------------------------------------

import type { Board, CandidateGrid, TechniqueResult, Digit, CellIndex } from '../types';
import { hasCandidate, bitsToDigits, getRow, getCol, getRowCells, getColCells, getBoxCells } from '../utils';

export function hiddenPairs(
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
    const emptyCells = house.cells.filter((c) => board[c] === 0);

    for (let d1 = 1; d1 <= 9; d1++) {
      for (let d2 = d1 + 1; d2 <= 9; d2++) {
        // Skip if either digit is already placed in this house
        if (house.cells.some((c) => board[c] === d1 || board[c] === d2)) continue;

        const cellsWithD1 = emptyCells.filter((c) => hasCandidate(candidates[c], d1 as Digit));
        const cellsWithD2 = emptyCells.filter((c) => hasCandidate(candidates[c], d2 as Digit));

        // Both digits must appear in exactly the same 2 cells
        if (cellsWithD1.length !== 2 || cellsWithD2.length !== 2) continue;
        if (cellsWithD1[0] !== cellsWithD2[0] || cellsWithD1[1] !== cellsWithD2[1]) continue;

        const c1 = cellsWithD1[0];
        const c2 = cellsWithD1[1];

        // Eliminate all other candidates from these two cells
        const eliminations: { cell: CellIndex; digit: Digit }[] = [];
        for (const cell of [c1, c2]) {
          for (const d of bitsToDigits(candidates[cell])) {
            if (d !== d1 && d !== d2) {
              eliminations.push({ cell, digit: d });
            }
          }
        }

        if (eliminations.length > 0) {
          return {
            technique: 'hiddenPairs',
            primaryCells: [c1, c2],
            secondaryCells: [],
            eliminations,
            placements: [],
            explanation: `Hidden pair {${d1},${d2}} in R${getRow(c1) + 1}C${getCol(c1) + 1} and R${getRow(c2) + 1}C${getCol(c2) + 1} in ${house.name}. Eliminates other candidates from these cells.`,
          };
        }
      }
    }
  }
  return null;
}
