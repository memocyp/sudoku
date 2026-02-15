// ---------------------------------------------------------------------------
// Progressive hint system
// ---------------------------------------------------------------------------

import type { Board, CandidateGrid, TechniqueId, Difficulty, Digit, CellIndex } from './types';
import { DIFFICULTY_MAP } from './types';
import { computeCandidates } from './candidates';
import { TECHNIQUES_ORDERED } from './techniques';
import { getRow, getCol, getBox } from './utils';

/** Maximum number of hints allowed per puzzle */
export const MAX_HINTS_PER_PUZZLE = 5;

/** Time penalty in ms for each error */
export const ERROR_PENALTY_MS = 15000;

/** Cumulative time penalties per hint level (in ms) */
export const HINT_PENALTIES = [30000, 30000, 60000, 60000];

/** Hint data returned to the UI at different detail levels */
export interface HintData {
  /** Detail level 1-4 */
  level: number;
  /** Display name of the technique */
  techniqueName: string;
  /** Region description (e.g. "row 3", "box 5") */
  region?: string;
  /** Primary cells forming the pattern */
  primaryCells?: CellIndex[];
  /** Secondary cells affected */
  secondaryCells?: CellIndex[];
  /** Full explanation text */
  explanation?: string;
  /** Candidate eliminations */
  eliminations?: { cell: CellIndex; digit: Digit }[];
  /** Digit placements */
  placements?: { cell: CellIndex; digit: Digit }[];
}

/** Technique display names */
const TECHNIQUE_LABELS: Record<TechniqueId, string> = {
  nakedSingle: 'Naked Single',
  hiddenSingle: 'Hidden Single',
  nakedPairs: 'Naked Pairs',
  hiddenPairs: 'Hidden Pairs',
  pointingPairs: 'Pointing Pairs',
  boxLineReduction: 'Box/Line Reduction',
  nakedTriples: 'Naked Triples',
  hiddenTriples: 'Hidden Triples',
  xWing: 'X-Wing',
  swordfish: 'Swordfish',
};

/**
 * Get a human-readable label for a technique ID.
 */
export function getTechniqueLabel(id: TechniqueId): string {
  return TECHNIQUE_LABELS[id] ?? id;
}

/**
 * Determine a region description from the primary cells of a technique result.
 */
function inferRegion(primaryCells: CellIndex[]): string | undefined {
  if (primaryCells.length === 0) return undefined;

  const rows = new Set(primaryCells.map(getRow));
  const cols = new Set(primaryCells.map(getCol));
  const boxes = new Set(primaryCells.map(getBox));

  if (rows.size === 1) return `row ${Array.from(rows)[0] + 1}`;
  if (cols.size === 1) return `column ${Array.from(cols)[0] + 1}`;
  if (boxes.size === 1) return `box ${Array.from(boxes)[0] + 1}`;

  return undefined;
}

/**
 * Get a progressive hint for the current board state.
 *
 * Level 1: Technique name only ("Try looking for a Naked Single")
 * Level 2: Technique name + region ("Look for a Hidden Single in row 3")
 * Level 3: Technique + highlighted cells
 * Level 4: Full explanation with eliminations/placements
 *
 * @param board - Current board state
 * @param level - Detail level 1-4
 * @returns HintData or null if no hint can be found
 */
export function getHint(board: Board, level: number): HintData | null {
  const candidates = computeCandidates(board);

  for (const { fn } of TECHNIQUES_ORDERED) {
    const result = fn(board, candidates);
    if (!result) continue;

    const techniqueName = getTechniqueLabel(result.technique);
    const region = inferRegion(result.primaryCells);

    // Level 1: technique name only
    if (level <= 1) {
      return {
        level: 1,
        techniqueName,
      };
    }

    // Level 2: technique name + region
    if (level === 2) {
      return {
        level: 2,
        techniqueName,
        region,
      };
    }

    // Level 3: technique + highlighted cells
    if (level === 3) {
      return {
        level: 3,
        techniqueName,
        region,
        primaryCells: result.primaryCells,
        secondaryCells: result.secondaryCells,
      };
    }

    // Level 4: full details
    return {
      level: 4,
      techniqueName,
      region,
      primaryCells: result.primaryCells,
      secondaryCells: result.secondaryCells,
      explanation: result.explanation,
      eliminations: result.eliminations,
      placements: result.placements,
    };
  }

  return null;
}

/**
 * Calculate the time penalty for requesting a hint at a given level
 * and difficulty.
 *
 * @param level - Hint level (1-4)
 * @param difficulty - Puzzle difficulty
 * @returns Penalty in milliseconds
 */
export function calculateHintPenalty(level: number, difficulty: Difficulty): number {
  const clampedLevel = Math.max(1, Math.min(level, HINT_PENALTIES.length));
  const basePenalty = HINT_PENALTIES[clampedLevel - 1];

  // Scale penalty by difficulty: easier puzzles get smaller penalties
  const difficultyLevel = DIFFICULTY_MAP[difficulty];
  const scale = 0.5 + (difficultyLevel - 1) * 0.25; // 0.5, 0.75, 1.0, 1.25, 1.5

  return Math.round(basePenalty * scale);
}
