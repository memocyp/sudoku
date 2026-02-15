import type { Board, CandidateGrid, TechniqueResult, Digit, CellIndex } from '../types';
import { hasCandidate, getRowCells, getColCells, getBoxCells, getRow, getCol, getBox } from '../utils';

/**
 * Box/Line Reduction: If all candidates for a digit in a row/column
 * within a particular box are confined to that box, eliminate the digit
 * from other cells in the box not in that row/column.
 */
export function boxLineReduction(
  board: Board,
  candidates: CandidateGrid,
): TechniqueResult | null {
  // Check rows
  for (let row = 0; row < 9; row++) {
    const cells = getRowCells(row);
    for (let d = 1; d <= 9; d++) {
      const digit = d as Digit;
      const cellsWithDigit = cells.filter(
        (c) => board[c] === 0 && hasCandidate(candidates[c], digit),
      );
      if (cellsWithDigit.length < 2 || cellsWithDigit.length > 3) continue;

      const boxes = new Set(cellsWithDigit.map(getBox));
      if (boxes.size !== 1) continue;

      const box = getBox(cellsWithDigit[0]);
      const eliminations: { cell: CellIndex; digit: Digit }[] = [];
      for (const c of getBoxCells(box)) {
        if (getRow(c) !== row && board[c] === 0 && hasCandidate(candidates[c], digit)) {
          eliminations.push({ cell: c, digit });
        }
      }

      if (eliminations.length > 0) {
        return {
          technique: 'boxLineReduction',
          primaryCells: cellsWithDigit,
          secondaryCells: eliminations.map((e) => e.cell),
          eliminations,
          placements: [],
          explanation: `Box/line reduction: ${digit} in row ${row + 1} is confined to box ${box + 1}. Eliminates ${digit} from other cells in box ${box + 1}.`,
        };
      }
    }
  }

  // Check columns
  for (let col = 0; col < 9; col++) {
    const cells = getColCells(col);
    for (let d = 1; d <= 9; d++) {
      const digit = d as Digit;
      const cellsWithDigit = cells.filter(
        (c) => board[c] === 0 && hasCandidate(candidates[c], digit),
      );
      if (cellsWithDigit.length < 2 || cellsWithDigit.length > 3) continue;

      const boxes = new Set(cellsWithDigit.map(getBox));
      if (boxes.size !== 1) continue;

      const box = getBox(cellsWithDigit[0]);
      const eliminations: { cell: CellIndex; digit: Digit }[] = [];
      for (const c of getBoxCells(box)) {
        if (getCol(c) !== col && board[c] === 0 && hasCandidate(candidates[c], digit)) {
          eliminations.push({ cell: c, digit });
        }
      }

      if (eliminations.length > 0) {
        return {
          technique: 'boxLineReduction',
          primaryCells: cellsWithDigit,
          secondaryCells: eliminations.map((e) => e.cell),
          eliminations,
          placements: [],
          explanation: `Box/line reduction: ${digit} in column ${col + 1} is confined to box ${box + 1}. Eliminates ${digit} from other cells in box ${box + 1}.`,
        };
      }
    }
  }

  return null;
}
