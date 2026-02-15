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

/** Map technique IDs to human-readable names */
const TECHNIQUE_DISPLAY_NAMES: Record<string, string> = {
  nakedSingle: 'Naked Single',
  hiddenSingle: 'Hidden Single',
  nakedPairs: 'Naked Pairs',
  hiddenPairs: 'Hidden Pairs',
  pointingPairs: 'Pointing Pairs',
  boxLineReduction: 'Box/Line Reduction',
  nakedTriples: 'Naked Triples',
  hiddenTriples: 'Hidden Triples',
  xWing: 'X-Wing',
  swordfish: 'Swordfish',
};

function getTechniqueDisplayName(id: string): string {
  return TECHNIQUE_DISPLAY_NAMES[id] ?? id;
}

export function HintOverlay() {
  const hintResult = useGameStore((s) => s.hintResult);
  const dismissHint = useGameStore((s) => s.dismissHint);

  if (!hintResult) return null;

  const { level, techniqueName, region, explanation } = hintResult;
  const displayName = getTechniqueDisplayName(techniqueName);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
      <Card className="shadow-lg border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">
              Hint
              {level >= 1 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  (Level {level})
                </span>
              )}
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
          {level >= 1 && (
            <p>
              <span className="font-medium">Technique:</span> {displayName}
            </p>
          )}

          {/* Level 2+: Region info */}
          {level >= 2 && region && (
            <p>
              <span className="font-medium">Where to look:</span> {region}
            </p>
          )}

          {/* Level 3+: Full explanation */}
          {level >= 3 && explanation && (
            <p>
              <span className="font-medium">Explanation:</span> {explanation}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
