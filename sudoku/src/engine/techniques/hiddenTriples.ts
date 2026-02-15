import type { Board, CandidateGrid, TechniqueResult, Digit, CellIndex } from '../types';
import { hasCandidate, bitsToDigits, getRow, getCol, getRowCells, getColCells, getBoxCells } from '../utils';

/**
 * Hidden Triples: Three digits that only appear in three cells in a house.
 * All other candidates can be eliminated from those three cells.
 */
export function hiddenTriples(
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
    const placedDigits = new Set(house.cells.map((c) => board[c]).filter((v) => v !== 0));
    const unplacedDigits: Digit[] = [];
    for (let d = 1; d <= 9; d++) {
      if (!placedDigits.has(d)) unplacedDigits.push(d as Digit);
    }
    if (unplacedDigits.length < 3) continue;

    for (let i = 0; i < unplacedDigits.length; i++) {
      for (let j = i + 1; j < unplacedDigits.length; j++) {
        for (let k = j + 1; k < unplacedDigits.length; k++) {
          const d1 = unplacedDigits[i];
          const d2 = unplacedDigits[j];
          const d3 = unplacedDigits[k];

          const cellsWithAny = emptyCells.filter(
            (c) =>
              hasCandidate(candidates[c], d1) ||
              hasCandidate(candidates[c], d2) ||
              hasCandidate(candidates[c], d3),
          );

          if (cellsWithAny.length !== 3) continue;

          const eliminations: { cell: CellIndex; digit: Digit }[] = [];
          for (const c of cellsWithAny) {
            for (const d of bitsToDigits(candidates[c])) {
              if (d !== d1 && d !== d2 && d !== d3) {
                eliminations.push({ cell: c, digit: d });
              }
            }
          }

          if (eliminations.length > 0) {
            return {
              technique: 'hiddenTriples',
              primaryCells: cellsWithAny,
              secondaryCells: [],
              eliminations,
              placements: [],
              explanation: `Hidden triple {${d1},${d2},${d3}} in ${cellsWithAny.map((c) => `R${getRow(c) + 1}C${getCol(c) + 1}`).join(', ')} in ${house.name}.`,
            };
          }
        }
      }
    }
  }
  return null;
}
