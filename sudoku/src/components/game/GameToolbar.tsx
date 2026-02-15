'use client';

import { useGameStore } from '@/stores/gameStore';
import { useHints } from '@/hooks/useHints';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Undo2, Redo2, Eraser, Pencil, Lightbulb } from 'lucide-react';

export function GameToolbar() {
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const erase = useGameStore((s) => s.erase);
  const isNotesMode = useGameStore((s) => s.isNotesMode);
  const setNotesMode = useGameStore((s) => s.setNotesMode);
  const historyIndex = useGameStore((s) => s.historyIndex);
  const historyLength = useGameStore((s) => s.history.length);

  const { requestHint, hintsRemaining, canRequestHint } = useHints();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLength - 1;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Undo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={!canUndo}
              aria-label="Undo"
            >
              <Undo2 className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>

        {/* Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={!canRedo}
              aria-label="Redo"
            >
              <Redo2 className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>

        {/* Erase */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={erase}
              aria-label="Erase"
            >
              <Eraser className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Erase</TooltipContent>
        </Tooltip>

        {/* Notes toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isNotesMode ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setNotesMode(!isNotesMode)}
              aria-label={isNotesMode ? 'Notes mode on' : 'Notes mode off'}
              aria-pressed={isNotesMode}
            >
              <Pencil className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isNotesMode ? 'Notes On' : 'Notes Off'}
          </TooltipContent>
        </Tooltip>

        {/* Hint */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={requestHint}
              disabled={!canRequestHint}
              aria-label={`Hint (${hintsRemaining} remaining)`}
              className="relative"
            >
              <Lightbulb className="size-5" />
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]"
              >
                {hintsRemaining}
              </Badge>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Hint ({hintsRemaining} left)</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
