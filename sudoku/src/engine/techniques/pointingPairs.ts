import type { Board, CandidateGrid, TechniqueResult, Digit, CellIndex } from '../types';
import { hasCandidate, getBoxCells, getRowCells, getColCells, getRow, getCol, getBox } from '../utils';

/**
 * Pointing Pairs/Triples: If all candidates for a digit in a box
 * are confined to a single row or column, eliminate that digit
 * from the rest of that row/column outside the box.
 */
export function pointingPairs(
  board: Board,
  candidates: CandidateGrid,
): TechniqueResult | null {
  for (let box = 0; box < 9; box++) {
    const cells = getBoxCells(box);
    const emptyCells = cells.filter((c) => board[c] === 0);

    for (let d = 1; d <= 9; d++) {
      const digit = d as Digit;
      const cellsWithDigit = emptyCells.filter((c) => hasCandidate(candidates[c], digit));
      if (cellsWithDigit.length < 2 || cellsWithDigit.length > 3) continue;

      // Check if all in same row
      const rows = new Set(cellsWithDigit.map(getRow));
      if (rows.size === 1) {
        const row = getRow(cellsWithDigit[0]);
        const eliminations: { cell: CellIndex; digit: Digit }[] = [];
        for (const c of getRowCells(row)) {
          if (getBox(c) !== box && board[c] === 0 && hasCandidate(candidates[c], digit)) {
            eliminations.push({ cell: c, digit });
          }
        }
        if (eliminations.length > 0) {
          return {
            technique: 'pointingPairs',
            primaryCells: cellsWithDigit,
            secondaryCells: eliminations.map((e) => e.cell),
            eliminations,
            placements: [],
            explanation: `Pointing ${cellsWithDigit.length === 2 ? 'pair' : 'triple'}: ${digit} in box ${box + 1} is confined to row ${row + 1}. Eliminates ${digit} from rest of row ${row + 1}.`,
          };
        }
      }

      // Check if all in same column
      const cols = new Set(cellsWithDigit.map(getCol));
      if (cols.size === 1) {
        const col = getCol(cellsWithDigit[0]);
        const eliminations: { cell: CellIndex; digit: Digit }[] = [];
        for (const c of getColCells(col)) {
          if (getBox(c) !== box && board[c] === 0 && hasCandidate(candidates[c], digit)) {
            eliminations.push({ cell: c, digit });
          }
        }
        if (eliminations.length > 0) {
          return {
            technique: 'pointingPairs',
            primaryCells: cellsWithDigit,
            secondaryCells: eliminations.map((e) => e.cell),
            eliminations,
            placements: [],
            explanation: `Pointing ${cellsWithDigit.length === 2 ? 'pair' : 'triple'}: ${digit} in box ${box + 1} is confined to column ${col + 1}. Eliminates ${digit} from rest of column ${col + 1}.`,
          };
        }
      }
    }
  }
  return null;
}
