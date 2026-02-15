// ---------------------------------------------------------------------------
// Board geometry utilities and precomputed lookup tables
// ---------------------------------------------------------------------------

import type { CellIndex, Digit, CandidateSet } from './types';

// ---------------------------------------------------------------------------
// Basic geometry
// ---------------------------------------------------------------------------

/** Get the row (0-8) for a cell index */
export function getRow(cell: CellIndex): number {
  return Math.floor(cell / 9);
}

/** Get the column (0-8) for a cell index */
export function getCol(cell: CellIndex): number {
  return cell % 9;
}

/** Get the box (0-8) for a cell index */
export function getBox(cell: CellIndex): number {
  return Math.floor(getRow(cell) / 3) * 3 + Math.floor(getCol(cell) / 3);
}

// ---------------------------------------------------------------------------
// Precomputed house arrays
// ---------------------------------------------------------------------------

/** ROW_CELLS[r] = array of 9 cell indices in row r */
export const ROW_CELLS: CellIndex[][] = [];

/** COL_CELLS[c] = array of 9 cell indices in column c */
export const COL_CELLS: CellIndex[][] = [];

/** BOX_CELLS[b] = array of 9 cell indices in box b */
export const BOX_CELLS: CellIndex[][] = [];

/** PEERS[cell] = array of 20 cell indices sharing row/col/box with cell */
export const PEERS: CellIndex[][] = [];

// Initialize ROW_CELLS, COL_CELLS, BOX_CELLS
for (let i = 0; i < 9; i++) {
  ROW_CELLS.push([]);
  COL_CELLS.push([]);
  BOX_CELLS.push([]);
}

for (let c = 0; c < 81; c++) {
  ROW_CELLS[getRow(c)].push(c);
  COL_CELLS[getCol(c)].push(c);
  BOX_CELLS[getBox(c)].push(c);
}

// Build PEERS (all cells that share a row, col, or box, excluding self)
for (let c = 0; c < 81; c++) {
  const peerSet = new Set<CellIndex>();
  for (const p of ROW_CELLS[getRow(c)]) if (p !== c) peerSet.add(p);
  for (const p of COL_CELLS[getCol(c)]) if (p !== c) peerSet.add(p);
  for (const p of BOX_CELLS[getBox(c)]) if (p !== c) peerSet.add(p);
  PEERS.push(Array.from(peerSet));
}

// ---------------------------------------------------------------------------
// House accessor functions
// ---------------------------------------------------------------------------

/** Get all 9 cell indices in a given row */
export function getRowCells(row: number): CellIndex[] {
  return ROW_CELLS[row];
}

/** Get all 9 cell indices in a given column */
export function getColCells(col: number): CellIndex[] {
  return COL_CELLS[col];
}

/** Get all 9 cell indices in a given box */
export function getBoxCells(box: number): CellIndex[] {
  return BOX_CELLS[box];
}

/** Get all 20 peers of a cell (cells sharing row, col, or box) */
export function getPeers(cell: CellIndex): CellIndex[] {
  return PEERS[cell];
}

// ---------------------------------------------------------------------------
// Bitmask helpers
// ---------------------------------------------------------------------------

/** Full candidate mask: bits 1-9 set = 0b1111111110 = 1022 */
export const ALL_CANDIDATES: CandidateSet = 0b1111111110;

/** Convert a digit (1-9) to its bitmask */
export function digitToBit(d: Digit): CandidateSet {
  return 1 << d;
}

/** Convert a single-bit mask back to the digit it represents */
export function bitToDigit(bit: CandidateSet): Digit {
  let d = 0;
  let b = bit;
  while (b > 1) {
    b >>= 1;
    d++;
  }
  return d as Digit;
}

/** Count the number of set bits in a candidate mask (bits 1-9) */
export function countBits(mask: CandidateSet): number {
  let count = 0;
  let m = mask >> 1; // skip bit 0
  while (m) {
    count += m & 1;
    m >>= 1;
  }
  return count;
}

/** Convert a candidate bitmask to an array of digits */
export function bitsToDigits(mask: CandidateSet): Digit[] {
  const digits: Digit[] = [];
  for (let d = 1; d <= 9; d++) {
    if (mask & (1 << d)) digits.push(d as Digit);
  }
  return digits;
}

/** Check if a candidate mask contains a given digit */
export function hasCandidate(mask: CandidateSet, d: Digit): boolean {
  return (mask & (1 << d)) !== 0;
}

/** Add a digit to a candidate mask */
export function addCandidate(mask: CandidateSet, d: Digit): CandidateSet {
  return mask | (1 << d);
}

/** Remove a digit from a candidate mask */
export function removeCandidate(mask: CandidateSet, d: Digit): CandidateSet {
  return mask & ~(1 << d);
}

// ---------------------------------------------------------------------------
// Array utilities
// ---------------------------------------------------------------------------

/** Fisher-Yates shuffle. Returns a new shuffled array (does not mutate input). */
export function shuffle<T>(array: T[]): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------------------------------------------------------------------------
// Legacy aliases (backward compatibility)
// ---------------------------------------------------------------------------

/** @deprecated Use getRow */
export const rowOf = getRow;

/** @deprecated Use getCol */
export const colOf = getCol;

/** @deprecated Use getBox */
export const boxOf = getBox;

/** @deprecated Use getRowCells */
export const rowCells = getRowCells;

/** @deprecated Use getColCells */
export const colCells = getColCells;

/** @deprecated Use getBoxCells */
export const boxCells = getBoxCells;

/** @deprecated Use countBits */
export const candidateCount = countBits;

/** @deprecated Use bitsToDigits */
export const candidateList = bitsToDigits;

/** @deprecated Use bitsToDigits */
export const candidateDigits = bitsToDigits;

/** @deprecated Use digitToBit */
export const digitMask = digitToBit;

/** @deprecated Use getPeers */
export const peers = getPeers;

/** Get the cell index for a given row and column */
export function cellAt(row: number, col: number): CellIndex {
  return row * 9 + col;
}

/** Get all 27 houses (9 rows + 9 cols + 9 boxes) */
export function allHouses(): CellIndex[][] {
  return [...ROW_CELLS, ...COL_CELLS, ...BOX_CELLS];
}
