import type { Board, CandidateGrid, TechniqueResult, Digit, CellIndex } from '../types';
import { hasCandidate, getRowCells, getColCells, getRow, getCol, cellAt } from '../utils';

/**
 * X-Wing: If a digit has exactly two candidates in each of two rows,
 * and those candidates are in the same two columns, eliminate the digit
 * from all other cells in those columns (and vice versa).
 */
export function xWing(
  board: Board,
  candidates: CandidateGrid,
): TechniqueResult | null {
  for (let d = 1; d <= 9; d++) {
    const digit = d as Digit;

    // Row-based X-Wing
    const rowsWithTwo: { row: number; cols: number[] }[] = [];
    for (let r = 0; r < 9; r++) {
      const cols: number[] = [];
      for (const c of getRowCells(r)) {
        if (board[c] === 0 && hasCandidate(candidates[c], digit)) {
          cols.push(getCol(c));
        }
      }
      if (cols.length === 2) rowsWithTwo.push({ row: r, cols });
    }

    for (let i = 0; i < rowsWithTwo.length; i++) {
      for (let j = i + 1; j < rowsWithTwo.length; j++) {
        const a = rowsWithTwo[i];
        const b = rowsWithTwo[j];
        if (a.cols[0] !== b.cols[0] || a.cols[1] !== b.cols[1]) continue;

        const eliminations: { cell: CellIndex; digit: Digit }[] = [];
        for (const col of a.cols) {
          for (const c of getColCells(col)) {
            if (getRow(c) !== a.row && getRow(c) !== b.row && board[c] === 0 && hasCandidate(candidates[c], digit)) {
              eliminations.push({ cell: c, digit });
            }
          }
        }

        if (eliminations.length > 0) {
          return {
            technique: 'xWing',
            primaryCells: [
              cellAt(a.row, a.cols[0]), cellAt(a.row, a.cols[1]),
              cellAt(b.row, b.cols[0]), cellAt(b.row, b.cols[1]),
            ],
            secondaryCells: eliminations.map((e) => e.cell),
            eliminations,
            placements: [],
            explanation: `X-Wing: ${digit} in rows ${a.row + 1},${b.row + 1} and columns ${a.cols[0] + 1},${a.cols[1] + 1}.`,
          };
        }
      }
    }

    // Column-based X-Wing
    const colsWithTwo: { col: number; rows: number[] }[] = [];
    for (let c = 0; c < 9; c++) {
      const rows: number[] = [];
      for (const cell of getColCells(c)) {
        if (board[cell] === 0 && hasCandidate(candidates[cell], digit)) {
          rows.push(getRow(cell));
        }
      }
      if (rows.length === 2) colsWithTwo.push({ col: c, rows });
    }

    for (let i = 0; i < colsWithTwo.length; i++) {
      for (let j = i + 1; j < colsWithTwo.length; j++) {
        const a = colsWithTwo[i];
        const b = colsWithTwo[j];
        if (a.rows[0] !== b.rows[0] || a.rows[1] !== b.rows[1]) continue;

        const eliminations: { cell: CellIndex; digit: Digit }[] = [];
        for (const row of a.rows) {
          for (const c of getRowCells(row)) {
            if (getCol(c) !== a.col && getCol(c) !== b.col && board[c] === 0 && hasCandidate(candidates[c], digit)) {
              eliminations.push({ cell: c, digit });
            }
          }
        }

        if (eliminations.length > 0) {
          return {
            technique: 'xWing',
            primaryCells: [
              cellAt(a.rows[0], a.col), cellAt(a.rows[1], a.col),
              cellAt(a.rows[0], b.col), cellAt(a.rows[1], b.col),
            ],
            secondaryCells: eliminations.map((e) => e.cell),
            eliminations,
            placements: [],
            explanation: `X-Wing: ${digit} in columns ${a.col + 1},${b.col + 1} and rows ${a.rows[0] + 1},${a.rows[1] + 1}.`,
          };
        }
      }
    }
  }
  return null;
}
