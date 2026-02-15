// ---------------------------------------------------------------------------
// Puzzle difficulty grader
// ---------------------------------------------------------------------------

import type { Board, SolveStep, Difficulty, TechniqueId } from './types';
import { TECHNIQUE_WEIGHTS } from './types';
import { solve } from './solver';

export interface GradeResult {
  difficulty: Difficulty;
  score: number;
  techniques: TechniqueId[];
}

/**
 * Difficulty thresholds based on techniques used:
 * - beginner: nakedSingle only
 * - easy: + hiddenSingle
 * - medium: + nakedPairs, hiddenPairs, pointingPairs, boxLineReduction
 * - hard: + nakedTriples, hiddenTriples, xWing
 * - expert: + swordfish (or any remaining)
 */
const TECHNIQUE_TIERS: Record<TechniqueId, Difficulty> = {
  nakedSingle: 'beginner',
  hiddenSingle: 'easy',
  nakedPairs: 'medium',
  hiddenPairs: 'medium',
  pointingPairs: 'medium',
  boxLineReduction: 'medium',
  nakedTriples: 'hard',
  hiddenTriples: 'hard',
  xWing: 'hard',
  swordfish: 'expert',
};

const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];

/**
 * Score thresholds for difficulty classification.
 * These provide a secondary classification based on cumulative score.
 */
const SCORE_THRESHOLDS: { max: number; difficulty: Difficulty }[] = [
  { max: 80, difficulty: 'beginner' },
  { max: 250, difficulty: 'easy' },
  { max: 500, difficulty: 'medium' },
  { max: 900, difficulty: 'hard' },
  { max: Infinity, difficulty: 'expert' },
];

/**
 * Grade a puzzle based on the solve steps produced by the technique solver.
 */
export function gradePuzzle(steps: SolveStep[]): GradeResult {
  const techniqueSet = new Set<TechniqueId>();
  let score = 0;

  for (const step of steps) {
    const id = step.technique;
    techniqueSet.add(id);
    score += TECHNIQUE_WEIGHTS[id];
  }

  const techniques = Array.from(techniqueSet);

  // Determine difficulty from hardest technique used
  let techniqueDifficulty: Difficulty = 'beginner';
  for (const id of techniques) {
    const tier = TECHNIQUE_TIERS[id];
    if (DIFFICULTY_ORDER.indexOf(tier) > DIFFICULTY_ORDER.indexOf(techniqueDifficulty)) {
      techniqueDifficulty = tier;
    }
  }

  // Also consider the score for secondary classification
  let scoreDifficulty: Difficulty = 'beginner';
  for (const threshold of SCORE_THRESHOLDS) {
    if (score <= threshold.max) {
      scoreDifficulty = threshold.difficulty;
      break;
    }
  }

  // Take the higher of the two difficulty assessments
  const difficulty =
    DIFFICULTY_ORDER.indexOf(techniqueDifficulty) >= DIFFICULTY_ORDER.indexOf(scoreDifficulty)
      ? techniqueDifficulty
      : scoreDifficulty;

  return { difficulty, score, techniques };
}

/**
 * Solve a board with the technique solver, then grade the result.
 */
export function gradePuzzleFromBoard(board: Board): GradeResult {
  const result = solve(board);
  return gradePuzzle(result.steps);
}
