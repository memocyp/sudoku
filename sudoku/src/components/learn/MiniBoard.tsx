'use client';

import { useMemo } from 'react';

interface MiniBoardProps {
  board: number[];
  highlightCells?: number[];
  highlightDigits?: number[];
}

export function MiniBoard({
  board,
  highlightCells = [],
  highlightDigits = [],
}: MiniBoardProps) {
  const highlightCellSet = useMemo(
    () => new Set(highlightCells),
    [highlightCells],
  );
  const highlightDigitSet = useMemo(
    () => new Set(highlightDigits),
    [highlightDigits],
  );

  return (
    <div
      className="grid grid-cols-9 w-full max-w-[16rem] aspect-square border-2 border-gray-800 dark:border-gray-300 rounded-sm mx-auto"
      role="img"
      aria-label="Sudoku tutorial board"
    >
      {Array.from({ length: 81 }, (_, i) => {
        const row = Math.floor(i / 9);
        const col = i % 9;
        const value = board[i];

        const isHighlightedCell = highlightCellSet.has(i);
        const isHighlightedDigit =
          value !== 0 && highlightDigitSet.has(value);

        let bg = 'bg-white dark:bg-gray-900';
        if (isHighlightedCell) {
          bg = 'bg-yellow-200 dark:bg-yellow-800/40';
        } else if (isHighlightedDigit) {
          bg = 'bg-blue-100 dark:bg-blue-900/30';
        }

        const borderClasses = [
          'border-gray-300 dark:border-gray-600',
          col === 2 || col === 5
            ? 'border-r-2 border-r-gray-800 dark:border-r-gray-300'
            : 'border-r',
          row === 2 || row === 5
            ? 'border-b-2 border-b-gray-800 dark:border-b-gray-300'
            : 'border-b',
          col === 0 ? 'border-l' : '',
          row === 0 ? 'border-t' : '',
        ].join(' ');

        return (
          <div
            key={i}
            className={`flex items-center justify-center aspect-square select-none text-[8px] sm:text-[10px] md:text-xs font-medium ${bg} ${borderClasses}`}
          >
            {value !== 0 ? value : ''}
          </div>
        );
      })}
    </div>
  );
}
