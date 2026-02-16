'use client';

import { use } from 'react';
import { useTutorial } from '@/hooks/useTutorial';
import { MiniBoard } from '@/components/learn/MiniBoard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';

function TutorialPlayer({ slug }: { slug: string }) {
  const {
    steps,
    currentStep,
    currentIndex,
    next,
    prev,
    goTo,
    isComplete,
    progress,
    loading,
    error,
  } = useTutorial(slug);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">Loading tutorial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" asChild>
          <Link href="/learn">
            <ArrowLeft className="size-4 mr-2" />
            Back to Learn
          </Link>
        </Button>
      </div>
    );
  }

  if (!currentStep) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <p className="text-muted-foreground">No tutorial steps found.</p>
        <Button variant="outline" asChild>
          <Link href="/learn">
            <ArrowLeft className="size-4 mr-2" />
            Back to Learn
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/learn">
              <ArrowLeft className="size-4 mr-1" />
              Back
            </Link>
          </Button>
          <Badge variant="outline">
            Step {currentIndex + 1} of {steps.length}
          </Badge>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStep.title}</CardTitle>
          {currentStep.action && (
            <CardDescription>Action: {currentStep.action}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{currentStep.content}</p>

          {(currentStep.board || currentStep.highlightCells?.length || currentStep.highlightDigits?.length) && (
            <div className="mt-4">
              <MiniBoard
                board={currentStep.board ?? Array(81).fill(0)}
                highlightCells={currentStep.highlightCells}
                highlightDigits={currentStep.highlightDigits}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={prev}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="size-4 mr-1" />
          Previous
        </Button>

        <div className="flex gap-1">
          {steps.map((_, i) => (
            <button
              key={i}
              className={`size-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
              onClick={() => goTo(i)}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {isComplete ? (
          <Button size="sm" onClick={() => goTo(0)}>
            <RotateCcw className="size-4 mr-1" />
            Restart
          </Button>
        ) : (
          <Button size="sm" onClick={next}>
            Next
            <ArrowRight className="size-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function TutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  return (
    <div className="container mx-auto py-8 px-4">
      <TutorialPlayer slug={slug} />
    </div>
  );
}
