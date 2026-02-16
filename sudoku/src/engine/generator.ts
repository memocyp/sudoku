// ---------------------------------------------------------------------------
// Puzzle generator: two-phase generation with difficulty targeting
// ---------------------------------------------------------------------------

import type { Board, Difficulty, Digit, PuzzleData } from './types';
import { shuffle } from './utils';
import { isValidPlacement, countSolutions } from './validator';
import { solveWithBacktracking } from './solver';
import { gradePuzzleFromBoard } from './grader';
import { DIFFICULTY_MAP } from './types';

/** Target clue counts per difficulty [min, max] */
const CLUE_TARGETS: Record<Difficulty, [number, number]> = {
  beginner: [45, 50],
  easy: [36, 44],
  medium: [30, 35],
  hard: [26, 30],
  expert: [22, 26],
};

/**
 * Generate a complete valid Sudoku board by filling the 3 diagonal boxes
 * randomly and then solving the rest via backtracking.
 */
function generateCompleteBoard(): Board {
  const board: Board = new Array(81).fill(0);

  // Fill the three diagonal 3x3 boxes (they don't interfere with each other)
  for (let box = 0; box < 3; box++) {
    const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]) as Digit[];
    const startRow = box * 3;
    const startCol = box * 3;
    let idx = 0;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        board[r * 9 + c] = digits[idx++];
      }
    }
  }

  // Solve the rest via backtracking
  const solution = solveWithBacktracking(board);
  if (!solution) {
    // Should not happen with valid diagonal boxes, but handle gracefully
    return generateCompleteBoard();
  }
  return solution;
}

/**
 * Generate a Sudoku puzzle at the specified difficulty level.
 *
 * Phase 1: Generate a complete board.
 * Phase 2: Remove clues one at a time (in random order), ensuring:
 *   - The puzzle still has a unique solution
 *   - The difficulty stays within the target range
 *   - The clue count stays within bounds
 */
export function generatePuzzle(difficulty: Difficulty): PuzzleData {
  const maxAttempts = 20;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const solution = generateCompleteBoard();
    const puzzle = solution.slice();
    const [minClues, maxClues] = CLUE_TARGETS[difficulty];

    // Shuffle cell indices for random removal order
    const indices = shuffle(Array.from({ length: 81 }, (_, i) => i));

    let clueCount = 81;

    for (const idx of indices) {
      if (clueCount <= minClues) break;

      const saved = puzzle[idx];
      puzzle[idx] = 0;

      // Check unique solution
      const solutions = countSolutions(puzzle, 2);
      if (solutions !== 1) {
        puzzle[idx] = saved;
        continue;
      }

      // Check if difficulty is appropriate
      const grade = gradePuzzleFromBoard(puzzle);
      const targetLevel = DIFFICULTY_MAP[difficulty];
      const gradeLevel = DIFFICULTY_MAP[grade.difficulty];

      if (gradeLevel > targetLevel) {
        // Too hard - undo removal
        puzzle[idx] = saved;
        continue;
      }

      clueCount--;
    }

    // Final grading
    const finalGrade = gradePuzzleFromBoard(puzzle);
    const finalLevel = DIFFICULTY_MAP[finalGrade.difficulty];
    const targetLevel = DIFFICULTY_MAP[difficulty];

    // Accept if difficulty matches or is close enough
    // (for expert, accept hard+ since expert puzzles are rare)
    if (finalLevel === targetLevel) {
      return {
        puzzle: puzzle.slice(),
        solution: solution.slice(),
        difficulty,
        difficultyScore: finalGrade.score,
        techniques: finalGrade.techniques,
      };
    }

    // For easier difficulties, accept if we're at the right level
    if (difficulty === 'beginner' && finalLevel <= 1) {
      return {
        puzzle: puzzle.slice(),
        solution: solution.slice(),
        difficulty,
        difficultyScore: finalGrade.score,
        techniques: finalGrade.techniques,
      };
    }

    if (difficulty === 'expert' && finalLevel >= 4) {
      return {
        puzzle: puzzle.slice(),
        solution: solution.slice(),
        difficulty: 'expert',
        difficultyScore: finalGrade.score,
        techniques: finalGrade.techniques,
      };
    }
  }

  // Fallback: return whatever we can generate
  const solution = generateCompleteBoard();
  const puzzle = solution.slice();
  const [minClues] = CLUE_TARGETS[difficulty];
  const indices = shuffle(Array.from({ length: 81 }, (_, i) => i));
  let clueCount = 81;

  for (const idx of indices) {
    if (clueCount <= minClues) break;
    const saved = puzzle[idx];
    puzzle[idx] = 0;
    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[idx] = saved;
      continue;
    }
    clueCount--;
  }

  const finalGrade = gradePuzzleFromBoard(puzzle);
  return {
    puzzle: puzzle.slice(),
    solution: solution.slice(),
    difficulty: finalGrade.difficulty,
    difficultyScore: finalGrade.score,
    techniques: finalGrade.techniques,
  };
}
