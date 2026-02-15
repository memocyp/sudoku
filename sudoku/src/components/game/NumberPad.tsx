'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';

export function NumberPad() {
  const board = useGameStore((s) => s.board);
  const isNotesMode = useGameStore((s) => s.isNotesMode);
  const enterDigit = useGameStore((s) => s.enterDigit);
  const toggleNote = useGameStore((s) => s.toggleNote);

  // Count how many of each digit are placed on the board
  const digitCounts = useMemo(() => {
    const counts = new Array<number>(10).fill(0);
    for (let i = 0; i < 81; i++) {
      const v = board[i];
      if (v >= 1 && v <= 9) {
        counts[v]++;
      }
    }
    return counts;
  }, [board]);

  const handleDigitClick = (digit: number) => {
    if (isNotesMode) {
      toggleNote(digit);
    } else {
      enterDigit(digit);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full max-w-[14rem]">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
        const count = digitCounts[digit];
        const isDisabled = count >= 9;
        const remaining = 9 - count;

        return (
          <Button
            key={digit}
            variant="outline"
            className="relative h-11 sm:h-12 text-lg sm:text-xl font-semibold"
            disabled={isDisabled}
            onClick={() => handleDigitClick(digit)}
            aria-label={`Digit ${digit}, ${remaining} remaining`}
          >
            {digit}
            {remaining < 9 && (
              <span className="absolute top-0.5 right-1 text-[10px] text-muted-foreground font-normal">
                {remaining}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
