'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepNavigatorProps {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  progress: number; // 0-1
}

export function StepNavigator({
  currentIndex,
  total,
  onPrev,
  onNext,
  progress,
}: StepNavigatorProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= total - 1;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${Math.round(progress * 100)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tutorial progress"
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={isFirst}
          aria-label="Previous step"
        >
          <ChevronLeft className="size-4 mr-1" />
          Previous
        </Button>

        <span className="text-sm text-muted-foreground tabular-nums">
          {currentIndex + 1} / {total}
        </span>

        <Button
          variant={isLast ? 'default' : 'outline'}
          size="sm"
          onClick={onNext}
          disabled={isLast}
          aria-label="Next step"
        >
          Next
          <ChevronRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
