import type { Board, CandidateGrid, TechniqueResult, Digit, CellIndex } from '../types';
import { countBits, bitsToDigits, hasCandidate, getRow, getCol, getRowCells, getColCells, getBoxCells } from '../utils';

/**
 * Naked Triples: Three cells in a house whose combined candidates
 * are exactly three digits. Those digits can be eliminated from
 * all other cells in the house.
 */
export function nakedTriples(
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
    const emptyCells = house.cells.filter(
      (c) => board[c] === 0 && countBits(candidates[c]) >= 2 && countBits(candidates[c]) <= 3,
    );
    if (emptyCells.length < 3) continue;

    for (let i = 0; i < emptyCells.length; i++) {
      for (let j = i + 1; j < emptyCells.length; j++) {
        for (let k = j + 1; k < emptyCells.length; k++) {
          const union = candidates[emptyCells[i]] | candidates[emptyCells[j]] | candidates[emptyCells[k]];
          if (countBits(union) !== 3) continue;

          const tripleDigits = bitsToDigits(union);
          const eliminations: { cell: CellIndex; digit: Digit }[] = [];

          for (const c of house.cells) {
            if (board[c] !== 0) continue;
            if (c === emptyCells[i] || c === emptyCells[j] || c === emptyCells[k]) continue;
            for (const d of tripleDigits) {
              if (hasCandidate(candidates[c], d)) {
                eliminations.push({ cell: c, digit: d });
              }
            }
          }

          if (eliminations.length > 0) {
            const cells = [emptyCells[i], emptyCells[j], emptyCells[k]];
            return {
              technique: 'nakedTriples',
              primaryCells: cells,
              secondaryCells: [...new Set(eliminations.map((e) => e.cell))],
              eliminations,
              placements: [],
              explanation: `Naked triple {${tripleDigits.join(',')}} in ${cells.map((c) => `R${getRow(c) + 1}C${getCol(c) + 1}`).join(', ')} in ${house.name}.`,
            };
          }
        }
      }
    }
  }
  return null;
}
