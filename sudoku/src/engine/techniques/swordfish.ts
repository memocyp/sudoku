import type { Board, CandidateGrid, TechniqueResult, Digit, CellIndex } from '../types';
import { hasCandidate, getRowCells, getColCells, getRow, getCol } from '../utils';

/**
 * Swordfish: Extension of X-Wing to three rows/columns.
 */
export function swordfish(
  board: Board,
  candidates: CandidateGrid,
): TechniqueResult | null {
  for (let d = 1; d <= 9; d++) {
    const digit = d as Digit;

    // Row-based swordfish
    const rowData: { row: number; cols: Set<number> }[] = [];
    for (let r = 0; r < 9; r++) {
      const cols = new Set<number>();
      for (const c of getRowCells(r)) {
        if (board[c] === 0 && hasCandidate(candidates[c], digit)) cols.add(getCol(c));
      }
      if (cols.size >= 2 && cols.size <= 3) rowData.push({ row: r, cols });
    }

    if (rowData.length >= 3) {
      for (let i = 0; i < rowData.length; i++) {
        for (let j = i + 1; j < rowData.length; j++) {
          for (let k = j + 1; k < rowData.length; k++) {
            const unionCols = new Set([...rowData[i].cols, ...rowData[j].cols, ...rowData[k].cols]);
            if (unionCols.size !== 3) continue;

            const fishRows = [rowData[i].row, rowData[j].row, rowData[k].row];
            const fishCols = Array.from(unionCols);
            const eliminations: { cell: CellIndex; digit: Digit }[] = [];
            const primaryCells: CellIndex[] = [];

            for (const col of fishCols) {
              for (const cell of getColCells(col)) {
                const r = getRow(cell);
                if (fishRows.includes(r)) {
                  if (board[cell] === 0 && hasCandidate(candidates[cell], digit)) primaryCells.push(cell);
                } else {
                  if (board[cell] === 0 && hasCandidate(candidates[cell], digit)) eliminations.push({ cell, digit });
                }
              }
            }

            if (eliminations.length > 0) {
              return {
                technique: 'swordfish',
                primaryCells,
                secondaryCells: eliminations.map((e) => e.cell),
                eliminations,
                placements: [],
                explanation: `Swordfish: ${digit} in rows ${fishRows.map((r) => r + 1).join(',')} and columns ${fishCols.map((c) => c + 1).join(',')}.`,
              };
            }
          }
        }
      }
    }

    // Column-based swordfish
    const colData: { col: number; rows: Set<number> }[] = [];
    for (let c = 0; c < 9; c++) {
      const rows = new Set<number>();
      for (const cell of getColCells(c)) {
        if (board[cell] === 0 && hasCandidate(candidates[cell], digit)) rows.add(getRow(cell));
      }
      if (rows.size >= 2 && rows.size <= 3) colData.push({ col: c, rows });
    }

    if (colData.length >= 3) {
      for (let i = 0; i < colData.length; i++) {
        for (let j = i + 1; j < colData.length; j++) {
          for (let k = j + 1; k < colData.length; k++) {
            const unionRows = new Set([...colData[i].rows, ...colData[j].rows, ...colData[k].rows]);
            if (unionRows.size !== 3) continue;

            const fishCols = [colData[i].col, colData[j].col, colData[k].col];
            const fishRows = Array.from(unionRows);
            const eliminations: { cell: CellIndex; digit: Digit }[] = [];
            const primaryCells: CellIndex[] = [];

            for (const row of fishRows) {
              for (const cell of getRowCells(row)) {
                const c = getCol(cell);
                if (fishCols.includes(c)) {
                  if (board[cell] === 0 && hasCandidate(candidates[cell], digit)) primaryCells.push(cell);
                } else {
                  if (board[cell] === 0 && hasCandidate(candidates[cell], digit)) eliminations.push({ cell, digit });
                }
              }
            }

            if (eliminations.length > 0) {
              return {
                technique: 'swordfish',
                primaryCells,
                secondaryCells: eliminations.map((e) => e.cell),
                eliminations,
                placements: [],
                explanation: `Swordfish: ${digit} in columns ${fishCols.map((c) => c + 1).join(',')} and rows ${fishRows.map((r) => r + 1).join(',')}.`,
              };
            }
          }
        }
      }
    }
  }
  return null;
}
