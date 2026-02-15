// ---------------------------------------------------------------------------
// Naked Pairs: Two cells in a house each have exactly the same two candidates.
// Those two digits can be eliminated from all other cells in the house.
// ---------------------------------------------------------------------------

import type { Board, CandidateGrid, TechniqueResult, Digit, CellIndex } from '../types';
import {
  countBits, bitsToDigits, hasCandidate,
  getRow, getCol, getRowCells, getColCells, getBoxCells,
} from '../utils';

export function nakedPairs(
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
    const pairCells = emptyCells.filter((c) => countBits(candidates[c]) === 2);

    for (let i = 0; i < pairCells.length; i++) {
      for (let j = i + 1; j < pairCells.length; j++) {
        if (candidates[pairCells[i]] !== candidates[pairCells[j]]) continue;

        const pairDigits = bitsToDigits(candidates[pairCells[i]]);
        const eliminations: { cell: CellIndex; digit: Digit }[] = [];

        for (const c of emptyCells) {
          if (c === pairCells[i] || c === pairCells[j]) continue;
          for (const d of pairDigits) {
            if (hasCandidate(candidates[c], d)) {
              eliminations.push({ cell: c, digit: d });
            }
          }
        }

        if (eliminations.length > 0) {
          const secondaryCells = [...new Set(eliminations.map((e) => e.cell))];
          return {
            technique: 'nakedPairs',
            primaryCells: [pairCells[i], pairCells[j]],
            secondaryCells,
            eliminations,
            placements: [],
            explanation: `Naked pair {${pairDigits.join(',')}} in R${getRow(pairCells[i]) + 1}C${getCol(pairCells[i]) + 1} and R${getRow(pairCells[j]) + 1}C${getCol(pairCells[j]) + 1} in ${house.name}. Eliminates ${pairDigits.join(',')} from other cells.`,
          };
        }
      }
    }
  }
  return null;
}
