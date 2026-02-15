'use client';

import { useGameStore } from '@/stores/gameStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/hooks/useTimer';
import { DIFFICULTY_DISPLAY } from '@/engine/types';

interface GameOverDialogProps {
  onNewGame?: () => void;
  onChangeDifficulty?: () => void;
}

export function GameOverDialog({
  onNewGame,
  onChangeDifficulty,
}: GameOverDialogProps) {
  const isComplete = useGameStore((s) => s.isComplete);
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const difficulty = useGameStore((s) => s.difficulty);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const mistakesMade = useGameStore((s) => s.mistakesMade);
  const newGame = useGameStore((s) => s.newGame);

  const handleNewGame = () => {
    if (onNewGame) {
      onNewGame();
    } else {
      newGame(difficulty);
    }
  };

  const handleChangeDifficulty = () => {
    if (onChangeDifficulty) {
      onChangeDifficulty();
    }
  };

  return (
    <Dialog open={isComplete}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Puzzle Complete!
          </DialogTitle>
          <DialogDescription className="text-center">
            You solved the {DIFFICULTY_DISPLAY[difficulty]} puzzle.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex flex-col items-center gap-1 rounded-lg bg-muted p-3">
            <span className="text-sm text-muted-foreground">Time</span>
            <span className="text-xl font-semibold tabular-nums">
              {formatTime(elapsedMs)}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-lg bg-muted p-3">
            <span className="text-sm text-muted-foreground">Difficulty</span>
            <span className="text-xl font-semibold">
              {DIFFICULTY_DISPLAY[difficulty]}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-lg bg-muted p-3">
            <span className="text-sm text-muted-foreground">Hints Used</span>
            <span className="text-xl font-semibold tabular-nums">
              {hintsUsed}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-lg bg-muted p-3">
            <span className="text-sm text-muted-foreground">Mistakes</span>
            <span className="text-xl font-semibold tabular-nums">
              {mistakesMade}
            </span>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleNewGame} className="w-full">
            New Game ({DIFFICULTY_DISPLAY[difficulty]})
          </Button>
          {onChangeDifficulty && (
            <Button
              variant="outline"
              onClick={handleChangeDifficulty}
              className="w-full"
            >
              Change Difficulty
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
