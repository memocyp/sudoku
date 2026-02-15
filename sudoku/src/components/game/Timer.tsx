'use client';

import { useTimer, formatTime } from '@/hooks/useTimer';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';

export function Timer() {
  const { elapsedMs, isTimerRunning } = useTimer();
  const startTimer = useGameStore((s) => s.startTimer);
  const pauseTimer = useGameStore((s) => s.pauseTimer);
  const isComplete = useGameStore((s) => s.isComplete);

  const handleToggle = () => {
    if (isTimerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className="font-mono text-lg tabular-nums tracking-wider min-w-[3.5rem] text-center"
        aria-label={`Elapsed time: ${formatTime(elapsedMs)}`}
      >
        {formatTime(elapsedMs)}
      </span>
      {!isComplete && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleToggle}
          aria-label={isTimerRunning ? 'Pause timer' : 'Resume timer'}
        >
          {isTimerRunning ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
        </Button>
      )}
    </div>
  );
}
