'use client';

import { create } from 'zustand';
import type { Board, CandidateGrid, Difficulty } from '@/engine/types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface HintDisplayData {
  level: number;
  techniqueName: string;
  region?: string;
  primaryCells?: number[];
  secondaryCells?: number[];
  explanation?: string;
}

interface HistoryEntry {
  board: Board;
  candidates: CandidateGrid;
}

export interface GameState {
  // Puzzle state
  puzzle: Board;
  solution: Board;
  board: Board;
  candidates: CandidateGrid;
  notes: CandidateGrid;
  difficulty: Difficulty;

  // Game state
  selectedCell: number | null;
  isNotesMode: boolean;
  isComplete: boolean;
  hintsUsed: number;
  mistakesMade: number;

  // Timer
  elapsedMs: number;
  isTimerRunning: boolean;

  // History for undo / redo
  history: HistoryEntry[];
  historyIndex: number;

  // Hint
  hintResult: HintDisplayData | null;
  currentHintLevel: number;

  // Actions
  newGame: (difficulty: Difficulty) => void;
  selectCell: (cell: number | null) => void;
  enterDigit: (digit: number) => void;
  toggleNote: (digit: number) => void;
  erase: () => void;
  undo: () => void;
  redo: () => void;
  setNotesMode: (on: boolean) => void;
  requestHint: () => void;
  requestMoreDetail: () => void;
  dismissHint: () => void;
  tick: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyBoard(): Board {
  return new Array<number>(81).fill(0);
}

function emptyCandidates(): CandidateGrid {
  return new Array<number>(81).fill(0);
}

function cloneBoard(b: Board): Board {
  return [...b];
}

function cloneCandidates(c: CandidateGrid): CandidateGrid {
  return [...c];
}

/** Convert a digit (1-9) to its candidate bitmask */
function digitToBit(d: number): number {
  return 1 << d;
}

/** Check whether two boards are identical */
function boardsEqual(a: Board, b: Board): boolean {
  for (let i = 0; i < 81; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** Push a new history entry, truncating any future entries beyond the current index. */
function pushHistory(
  history: HistoryEntry[],
  historyIndex: number,
  board: Board,
  candidates: CandidateGrid,
): { history: HistoryEntry[]; historyIndex: number } {
  const truncated = history.slice(0, historyIndex + 1);
  truncated.push({ board: cloneBoard(board), candidates: cloneCandidates(candidates) });
  return { history: truncated, historyIndex: truncated.length - 1 };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGameStore = create<GameState>((set, get) => ({
  // -- Initial state --
  puzzle: emptyBoard(),
  solution: emptyBoard(),
  board: emptyBoard(),
  candidates: emptyCandidates(),
  notes: emptyCandidates(),
  difficulty: 'easy' as Difficulty,

  selectedCell: null,
  isNotesMode: false,
  isComplete: false,
  hintsUsed: 0,
  mistakesMade: 0,

  elapsedMs: 0,
  isTimerRunning: false,

  history: [],
  historyIndex: -1,

  hintResult: null,
  currentHintLevel: 0,

  // -- Actions --

  newGame: async (difficulty: Difficulty) => {
    // Dynamic imports to avoid bundling the engine in every chunk
    const { generatePuzzle } = await import('@/engine/generator');
    const { computeCandidates } = await import('@/engine/candidates');

    const puzzleData = generatePuzzle(difficulty);
    const board = cloneBoard(puzzleData.puzzle);
    const candidates = computeCandidates(board);

    const initialHistory: HistoryEntry[] = [
      { board: cloneBoard(board), candidates: cloneCandidates(candidates) },
    ];

    set({
      puzzle: cloneBoard(puzzleData.puzzle),
      solution: cloneBoard(puzzleData.solution),
      board,
      candidates,
      notes: emptyCandidates(),
      difficulty,
      selectedCell: null,
      isNotesMode: false,
      isComplete: false,
      hintsUsed: 0,
      mistakesMade: 0,
      elapsedMs: 0,
      isTimerRunning: true,
      history: initialHistory,
      historyIndex: 0,
      hintResult: null,
      currentHintLevel: 0,
    });
  },

  selectCell: (cell: number | null) => {
    set({ selectedCell: cell });
  },

  enterDigit: async (digit: number) => {
    const state = get();
    const { selectedCell, puzzle, solution, board, candidates, notes, history, historyIndex } = state;
    if (selectedCell === null) return;

    // Cannot overwrite a given cell
    if (puzzle[selectedCell] !== 0) return;

    const newBoard = cloneBoard(board);
    newBoard[selectedCell] = digit;

    // Clear notes for the cell that was just filled
    const newNotes = cloneCandidates(notes);
    newNotes[selectedCell] = 0;

    // Check for mistake
    let newMistakes = state.mistakesMade;
    if (solution[selectedCell] !== 0 && digit !== solution[selectedCell]) {
      newMistakes += 1;
    }

    // Recompute candidates
    const { computeCandidates } = await import('@/engine/candidates');
    const newCandidates = computeCandidates(newBoard);

    // Push history
    const newHistory = pushHistory(history, historyIndex, newBoard, newCandidates);

    // Check completion
    const complete = boardsEqual(newBoard, solution);

    set({
      board: newBoard,
      candidates: newCandidates,
      notes: newNotes,
      mistakesMade: newMistakes,
      isComplete: complete,
      isTimerRunning: complete ? false : state.isTimerRunning,
      hintResult: null,
      currentHintLevel: 0,
      ...newHistory,
    });
  },

  toggleNote: (digit: number) => {
    const state = get();
    const { selectedCell, puzzle, board, notes } = state;
    if (selectedCell === null) return;

    // Cannot annotate a given or filled cell
    if (puzzle[selectedCell] !== 0 || board[selectedCell] !== 0) return;

    const newNotes = cloneCandidates(notes);
    newNotes[selectedCell] = newNotes[selectedCell] ^ digitToBit(digit);

    set({ notes: newNotes });
  },

  erase: async () => {
    const state = get();
    const { selectedCell, puzzle, board, candidates, history, historyIndex } = state;
    if (selectedCell === null) return;

    // Cannot erase a given cell
    if (puzzle[selectedCell] !== 0) return;

    // Nothing to erase
    if (board[selectedCell] === 0) return;

    const newBoard = cloneBoard(board);
    newBoard[selectedCell] = 0;

    // Recompute candidates
    const { computeCandidates } = await import('@/engine/candidates');
    const newCandidates = computeCandidates(newBoard);

    const newHistory = pushHistory(history, historyIndex, newBoard, newCandidates);

    set({
      board: newBoard,
      candidates: newCandidates,
      hintResult: null,
      currentHintLevel: 0,
      ...newHistory,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;

    const prevIndex = historyIndex - 1;
    const entry = history[prevIndex];

    set({
      board: cloneBoard(entry.board),
      candidates: cloneCandidates(entry.candidates),
      historyIndex: prevIndex,
      hintResult: null,
      currentHintLevel: 0,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;

    const nextIndex = historyIndex + 1;
    const entry = history[nextIndex];

    set({
      board: cloneBoard(entry.board),
      candidates: cloneCandidates(entry.candidates),
      historyIndex: nextIndex,
      hintResult: null,
      currentHintLevel: 0,
    });
  },

  setNotesMode: (on: boolean) => {
    set({ isNotesMode: on });
  },

  requestHint: async () => {
    const state = get();
    const { board, hintsUsed, difficulty, elapsedMs } = state;

    try {
      const { getHint, calculateHintPenalty } = await import('@/engine/hint');
      const result = getHint(board, 1);

      if (result) {
        const hintDisplay: HintDisplayData = {
          level: result.level,
          techniqueName: result.techniqueName,
          region: result.region,
          primaryCells: result.primaryCells,
          secondaryCells: result.secondaryCells,
          explanation: result.explanation,
        };

        const penalty = calculateHintPenalty(1, difficulty);

        set({
          hintResult: hintDisplay,
          currentHintLevel: 1,
          hintsUsed: hintsUsed + 1,
          elapsedMs: elapsedMs + penalty,
        });
      }
    } catch {
      // Hint engine not available — silently ignore
    }
  },

  requestMoreDetail: async () => {
    const state = get();
    const { board, currentHintLevel, difficulty, elapsedMs } = state;
    if (currentHintLevel >= 4 || currentHintLevel === 0) return;

    try {
      const { getHint, calculateHintPenalty } = await import('@/engine/hint');
      const newLevel = currentHintLevel + 1;
      const result = getHint(board, newLevel);

      if (result) {
        const hintDisplay: HintDisplayData = {
          level: result.level,
          techniqueName: result.techniqueName,
          region: result.region,
          primaryCells: result.primaryCells,
          secondaryCells: result.secondaryCells,
          explanation: result.explanation,
        };

        const penalty = calculateHintPenalty(newLevel, difficulty);

        set({
          hintResult: hintDisplay,
          currentHintLevel: newLevel,
          elapsedMs: elapsedMs + penalty,
        });
      }
    } catch {
      // Hint engine not available — silently ignore
    }
  },

  dismissHint: () => {
    set({ hintResult: null, currentHintLevel: 0 });
  },

  tick: () => {
    set((s) => ({ elapsedMs: s.elapsedMs + 1000 }));
  },

  startTimer: () => {
    set({ isTimerRunning: true });
  },

  pauseTimer: () => {
    set({ isTimerRunning: false });
  },

  resetTimer: () => {
    set({ elapsedMs: 0, isTimerRunning: false });
  },
}));
