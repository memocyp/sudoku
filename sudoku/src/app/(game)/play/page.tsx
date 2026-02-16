'use client';

import { Suspense, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { useKeyboard } from '@/hooks/useKeyboard';
import type { Difficulty } from '@/engine/types';
import { DIFFICULTY_DISPLAY, DIFFICULTY_MAP } from '@/engine/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration } from '@/lib/scoring';
import { useAuth } from '@/hooks/useAuth';

// ---------------------------------------------------------------------------
// Difficulty Selector (inline, for when no game is active)
// ---------------------------------------------------------------------------

const DIFFICULTIES: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  easy: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  expert: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// ---------------------------------------------------------------------------
// Timer display component
// ---------------------------------------------------------------------------

function TimerDisplay() {
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const isTimerRunning = useGameStore((s) => s.isTimerRunning);
  const tick = useGameStore((s) => s.tick);

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, tick]);

  return (
    <div className="text-2xl font-mono font-semibold tabular-nums">
      {formatDuration(elapsedMs)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pause Overlay
// ---------------------------------------------------------------------------

function PauseOverlay() {
  const isTimerRunning = useGameStore((s) => s.isTimerRunning);
  const isComplete = useGameStore((s) => s.isComplete);
  const puzzle = useGameStore((s) => s.puzzle);
  const startTimer = useGameStore((s) => s.startTimer);

  const hasGame = puzzle.some((v) => v !== 0);
  const isPaused = hasGame && !isTimerRunning && !isComplete;

  if (!isPaused) return null;

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 } as const}
    >
      <Pause className="size-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium mb-4">Game Paused</p>
      <Button onClick={startTimer} size="lg">
        <Play className="size-5 mr-2" />
        Resume
      </Button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Game Complete Dialog (inline)
// ---------------------------------------------------------------------------

function GameOverDialog() {
  const isComplete = useGameStore((s) => s.isComplete);
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const difficulty = useGameStore((s) => s.difficulty);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const mistakesMade = useGameStore((s) => s.mistakesMade);
  const puzzle = useGameStore((s) => s.puzzle);
  const newGame = useGameStore((s) => s.newGame);
  const { user } = useAuth();
  const submittedRef = useRef(false);

  // Reset the submitted flag when a new game starts
  useEffect(() => {
    if (!isComplete) {
      submittedRef.current = false;
    }
  }, [isComplete]);

  useEffect(() => {
    if (!isComplete || !user || submittedRef.current) return;
    submittedRef.current = true;

    fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        difficulty: DIFFICULTY_MAP[difficulty],
        solveTimeMs: elapsedMs,
        hintsUsed,
        mistakesMade,
        puzzleHash: puzzle.join(''),
      }),
    })
      .then((res) => {
        if (!res.ok) res.json().then((b) => console.error('Stats save failed:', res.status, b));
      })
      .catch((err) => console.error('Stats save failed:', err));
  }, [isComplete, user, difficulty, elapsedMs, hintsUsed, mistakesMade, puzzle]);

  if (!isComplete) return null;

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' } as const}
    >
      <Card className="w-full max-w-sm mx-4">
        <CardHeader>
          <CardTitle className="text-center text-xl">Puzzle Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="text-lg font-semibold">{formatDuration(elapsedMs)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Difficulty</p>
              <p className="text-lg font-semibold">{DIFFICULTY_DISPLAY[difficulty]}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hints Used</p>
              <p className="text-lg font-semibold">{hintsUsed}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mistakes</p>
              <p className="text-lg font-semibold">{mistakesMade}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => newGame(difficulty)}>
              Play Again
            </Button>
            <Button className="flex-1" variant="outline" asChild>
              <Link href="/play">New Difficulty</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Hint Overlay
// ---------------------------------------------------------------------------

function HintOverlay() {
  const hintResult = useGameStore((s) => s.hintResult);
  const currentHintLevel = useGameStore((s) => s.currentHintLevel);
  const dismissHint = useGameStore((s) => s.dismissHint);
  const requestMoreDetail = useGameStore((s) => s.requestMoreDetail);

  if (!hintResult) return null;

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 } as const}
    >
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4 space-y-2">
          <p className="text-sm font-medium">
            Try looking for a {hintResult.techniqueName}
          </p>
          {currentHintLevel >= 2 && hintResult.region && (
            <p className="text-xs text-muted-foreground">
              Look in {hintResult.region}
            </p>
          )}
          {currentHintLevel >= 3 && hintResult.primaryCells && hintResult.primaryCells.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Focus on cell{hintResult.primaryCells.length > 1 ? 's' : ''}{' '}
              {hintResult.primaryCells.map((c) => `R${Math.floor(c / 9) + 1}C${(c % 9) + 1}`).join(', ')}
            </p>
          )}
          {currentHintLevel >= 4 && hintResult.explanation && (
            <p className="text-xs text-muted-foreground">{hintResult.explanation}</p>
          )}
          <div className="flex items-center gap-2 pt-1">
            {currentHintLevel < 4 && (
              <Button variant="outline" size="sm" onClick={requestMoreDetail}>
                More Detail
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={dismissHint}>
              Got it
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Board placeholder (renders the 9x9 grid)
// ---------------------------------------------------------------------------

function CandidateGrid({ mask }: { mask: number }) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-px">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
        <span
          key={d}
          className="flex items-center justify-center text-[8px] sm:text-[10px] leading-none text-muted-foreground"
        >
          {mask & (1 << d) ? d : ''}
        </span>
      ))}
    </div>
  );
}

function SudokuBoard() {
  const board = useGameStore((s) => s.board);
  const puzzle = useGameStore((s) => s.puzzle);
  const solution = useGameStore((s) => s.solution);
  const notes = useGameStore((s) => s.notes);
  const selectedCell = useGameStore((s) => s.selectedCell);
  const selectCell = useGameStore((s) => s.selectCell);
  const isComplete = useGameStore((s) => s.isComplete);

  // Only show errors when the board is fully filled but not correct
  const isBoardFull = board.every((v) => v !== 0);
  const showErrors = isBoardFull && !isComplete;

  return (
    <div className="grid grid-cols-9 gap-0 border-2 border-foreground/80 rounded-md overflow-hidden aspect-square w-full max-w-[450px]">
      {board.map((value, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const isGiven = puzzle[index] !== 0;
        const isSelected = selectedCell === index;
        const isEmpty = value === 0;
        const hasNotes = isEmpty && notes[index] !== 0;
        const isError = showErrors && value !== 0 && solution[index] !== 0 && value !== solution[index];

        return (
          <button
            key={index}
            className={`
              flex items-center justify-center text-sm sm:text-base font-medium aspect-square
              border border-muted-foreground/20
              ${col % 3 === 2 && col !== 8 ? 'border-r-2 border-r-foreground/60' : ''}
              ${row % 3 === 2 && row !== 8 ? 'border-b-2 border-b-foreground/60' : ''}
              ${isError ? 'bg-red-100 dark:bg-red-900/40' : isSelected ? 'bg-primary/20' : 'hover:bg-muted/60'}
              ${isError ? 'text-red-600 dark:text-red-400' : isGiven ? 'font-bold text-foreground' : 'text-primary'}
              transition-colors
            `}
            onClick={() => selectCell(index)}
            aria-label={`Cell row ${row + 1} column ${col + 1}${value ? ` value ${value}` : ' empty'}`}
          >
            {value !== 0 ? value : hasNotes ? <CandidateGrid mask={notes[index]} /> : ''}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Number Pad
// ---------------------------------------------------------------------------

function NumberPad() {
  const enterDigit = useGameStore((s) => s.enterDigit);
  const toggleNote = useGameStore((s) => s.toggleNote);
  const isNotesMode = useGameStore((s) => s.isNotesMode);

  const handleDigit = useCallback(
    (digit: number) => {
      if (isNotesMode) {
        toggleNote(digit);
      } else {
        enterDigit(digit);
      }
    },
    [isNotesMode, enterDigit, toggleNote],
  );

  return (
    <div className="grid grid-cols-9 gap-1 w-full max-w-[450px]">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
        <Button
          key={digit}
          variant="outline"
          className="aspect-square text-lg font-semibold"
          onClick={() => handleDigit(digit)}
        >
          {digit}
        </Button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Game Toolbar
// ---------------------------------------------------------------------------

function GameToolbar() {
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const erase = useGameStore((s) => s.erase);
  const isNotesMode = useGameStore((s) => s.isNotesMode);
  const setNotesMode = useGameStore((s) => s.setNotesMode);
  const requestHint = useGameStore((s) => s.requestHint);
  const pauseTimer = useGameStore((s) => s.pauseTimer);
  const isTimerRunning = useGameStore((s) => s.isTimerRunning);
  const startTimer = useGameStore((s) => s.startTimer);

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <Button variant="outline" size="sm" onClick={undo}>
        Undo
      </Button>
      <Button variant="outline" size="sm" onClick={redo}>
        Redo
      </Button>
      <Button variant="outline" size="sm" onClick={erase}>
        Erase
      </Button>
      <Button
        variant={isNotesMode ? 'default' : 'outline'}
        size="sm"
        onClick={() => setNotesMode(!isNotesMode)}
      >
        Notes {isNotesMode ? 'ON' : 'OFF'}
      </Button>
      <Button variant="outline" size="sm" onClick={requestHint}>
        Hint
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => (isTimerRunning ? pauseTimer() : startTimer())}
      >
        {isTimerRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Play Page Content (inside Suspense)
// ---------------------------------------------------------------------------

function PlayPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const difficultyParam = searchParams.get('difficulty') as Difficulty | null;

  const puzzle = useGameStore((s) => s.puzzle);
  const newGame = useGameStore((s) => s.newGame);

  const currentDifficulty = useGameStore((s) => s.difficulty);
  const hasGame = puzzle.some((v) => v !== 0);

  // Only auto-start when an explicit difficulty query param is provided
  useEffect(() => {
    if (difficultyParam && (!hasGame || difficultyParam !== currentDifficulty)) {
      newGame(difficultyParam);
    }
  }, [difficultyParam]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard controls
  useKeyboard();

  // Show difficulty selector when no game is active or no difficulty was chosen
  if (!hasGame || !difficultyParam) {
    return (
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 } as const}
        >
          <h1 className="text-3xl font-bold mb-8">Select Difficulty</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {DIFFICULTIES.map((d) => (
              <Card
                key={d}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  router.push(`/play?difficulty=${d}`);
                  newGame(d);
                }}
              >
                <CardContent className="flex flex-col items-center gap-2 pt-6">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${DIFFICULTY_COLORS[d]}`}
                  >
                    {DIFFICULTY_DISPLAY[d]}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
        {/* Left / Main column */}
        <div className="flex flex-col items-center gap-4 w-full max-w-[450px]">
          {/* Timer */}
          <div className="flex items-center gap-4">
            <TimerDisplay />
          </div>

          {/* Board container (relative for overlays) */}
          <div className="relative w-full">
            <SudokuBoard />
            <PauseOverlay />
            <GameOverDialog />
          </div>

          {/* Hint card (between board and toolbar) */}
          <HintOverlay />

          {/* Toolbar */}
          <GameToolbar />

          {/* Number Pad */}
          <NumberPad />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Export (with Suspense boundary)
// ---------------------------------------------------------------------------

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <PlayPageContent />
    </Suspense>
  );
}
