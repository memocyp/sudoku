'use client';

import { useGameStore } from '@/stores/gameStore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function HintOverlay() {
  const hintResult = useGameStore((s) => s.hintResult);
  const currentHintLevel = useGameStore((s) => s.currentHintLevel);
  const dismissHint = useGameStore((s) => s.dismissHint);
  const requestMoreDetail = useGameStore((s) => s.requestMoreDetail);

  if (!hintResult) return null;

  const { techniqueName, region, primaryCells, explanation } = hintResult;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
      <Card className="shadow-lg border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">
              Hint
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (Level {currentHintLevel})
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={dismissHint}
              aria-label="Dismiss hint"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {/* Level 1+: Technique name */}
          <p>
            <span className="font-medium">Technique:</span> {techniqueName}
          </p>

          {/* Level 2+: Region info */}
          {currentHintLevel >= 2 && region && (
            <p>
              <span className="font-medium">Where to look:</span> {region}
            </p>
          )}

          {/* Level 3+: Cells */}
          {currentHintLevel >= 3 && primaryCells && primaryCells.length > 0 && (
            <p>
              <span className="font-medium">Cells:</span>{' '}
              {primaryCells.map((c) => `R${Math.floor(c / 9) + 1}C${(c % 9) + 1}`).join(', ')}
            </p>
          )}

          {/* Level 4: Full explanation */}
          {currentHintLevel >= 4 && explanation && (
            <p>
              <span className="font-medium">Explanation:</span> {explanation}
            </p>
          )}

          {/* More Detail button */}
          {currentHintLevel < 4 && (
            <Button variant="outline" size="sm" onClick={requestMoreDetail}>
              More Detail
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
