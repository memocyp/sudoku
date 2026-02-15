'use client';

import { useTutorial } from '@/hooks/useTutorial';
import { StepNavigator } from './StepNavigator';
import { MiniBoard } from './MiniBoard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface TutorialPlayerProps {
  slug: string;
  /** Optional board state to display alongside the tutorial steps */
  board?: number[];
}

export function TutorialPlayer({ slug, board }: TutorialPlayerProps) {
  const {
    steps,
    currentStep,
    currentIndex,
    next,
    prev,
    progress,
    loading,
    error,
    isComplete,
  } = useTutorial(slug);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Loading tutorial...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentStep) {
    return null;
  }

  const displayBoard =
    board ?? new Array<number>(81).fill(0);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{currentStep.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mini board with highlighted cells */}
        <div className="relative">
          <MiniBoard
            board={displayBoard}
            highlightCells={currentStep.highlightCells}
            highlightDigits={currentStep.highlightDigits}
          />
        </div>

        {/* Step content */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-sm leading-relaxed">{currentStep.content}</p>
        </div>

        {/* Completion banner */}
        {isComplete && (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-center">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Tutorial complete! You've learned this technique.
            </p>
          </div>
        )}

        {/* Step navigation */}
        <StepNavigator
          currentIndex={currentIndex}
          total={steps.length}
          onPrev={prev}
          onNext={next}
          progress={progress}
        />
      </CardContent>
    </Card>
  );
}
