// ---------------------------------------------------------------------------
// Core Sudoku engine types
// ---------------------------------------------------------------------------

/** A single digit 1-9 */
export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** Cell index 0-80 (row-major order) */
export type CellIndex = number;

/**
 * Candidate bitmask. Bit `i` (1-based) is set when digit `i` is a candidate.
 * e.g. candidates containing {1,3,7} = (1<<1)|(1<<3)|(1<<7)
 * We use bits 1-9 (bit 0 unused) so digit d -> mask (1 << d).
 */
export type CandidateSet = number;

/** 81-element flat array representing the board. 0 = empty, 1-9 = filled. */
export type Board = number[];

/** 81-element array of candidate bitmasks */
export type CandidateGrid = CandidateSet[];

/** Named difficulty levels */
export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

/** Numeric difficulty level 1-5 */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

/** Map from named difficulty to numeric level */
export const DIFFICULTY_MAP: Record<Difficulty, DifficultyLevel> = {
  beginner: 1,
  easy: 2,
  medium: 3,
  hard: 4,
  expert: 5,
};

/** Display labels for difficulty levels */
export const DIFFICULTY_DISPLAY: Record<Difficulty, string> = {
  beginner: 'Beginner',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

/** Technique identifiers */
export type TechniqueId =
  | 'nakedSingle'
  | 'hiddenSingle'
  | 'nakedPairs'
  | 'hiddenPairs'
  | 'pointingPairs'
  | 'boxLineReduction'
  | 'nakedTriples'
  | 'hiddenTriples'
  | 'xWing'
  | 'swordfish';

/** Result returned by a technique function when it finds a pattern */
export interface TechniqueResult {
  technique: TechniqueId;
  /** Primary cells forming the pattern */
  primaryCells: CellIndex[];
  /** Secondary cells affected by the pattern */
  secondaryCells: CellIndex[];
  /** Candidate eliminations */
  eliminations: { cell: CellIndex; digit: Digit }[];
  /** Digit placements */
  placements: { cell: CellIndex; digit: Digit }[];
  /** Human-readable explanation */
  explanation: string;
}

/** A complete solve step record (technique + board snapshot) */
export interface SolveStep {
  technique: TechniqueId;
  result: TechniqueResult;
  boardAfter: Board;
  candidatesAfter: CandidateGrid;
}

/** Score weight per technique (used for difficulty grading) */
export const TECHNIQUE_WEIGHTS: Record<TechniqueId, number> = {
  nakedSingle: 4,
  hiddenSingle: 14,
  nakedPairs: 40,
  hiddenPairs: 70,
  pointingPairs: 50,
  boxLineReduction: 50,
  nakedTriples: 60,
  hiddenTriples: 100,
  xWing: 140,
  swordfish: 200,
};

/** Difficulty tier for each technique */
export const TECHNIQUE_DIFFICULTY: Record<TechniqueId, Difficulty> = {
  nakedSingle: 'beginner',
  hiddenSingle: 'easy',
  nakedPairs: 'medium',
  hiddenPairs: 'medium',
  pointingPairs: 'medium',
  boxLineReduction: 'medium',
  nakedTriples: 'medium',
  hiddenTriples: 'hard',
  xWing: 'hard',
  swordfish: 'expert',
};

/** Ordered list of techniques from easiest to hardest */
export const TECHNIQUE_ORDER: TechniqueId[] = [
  'nakedSingle',
  'hiddenSingle',
  'nakedPairs',
  'hiddenPairs',
  'pointingPairs',
  'boxLineReduction',
  'nakedTriples',
  'hiddenTriples',
  'xWing',
  'swordfish',
];

/** A technique function signature */
export type TechniqueFunction = (
  board: Board,
  candidates: CandidateGrid,
) => TechniqueResult | null;

/** Puzzle data with solution and difficulty metadata */
export interface PuzzleData {
  puzzle: Board;
  solution: Board;
  difficulty: Difficulty;
  difficultyScore: number;
  techniques: TechniqueId[];
}
