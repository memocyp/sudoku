'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SudokuCellProps {
  index: number;
  value: number;
  isGiven: boolean;
  isSelected: boolean;
  isPeer: boolean;
  isSameDigit: boolean;
  isError: boolean;
  candidates: number;
  showCandidates: boolean;
  notes: number;
}

function getCellBackground(
  isSelected: boolean,
  isPeer: boolean,
  isSameDigit: boolean,
  isError: boolean,
): string {
  if (isError) return 'bg-red-100 dark:bg-red-900/40';
  if (isSelected) return 'bg-blue-200 dark:bg-blue-800/60';
  if (isSameDigit) return 'bg-purple-100 dark:bg-purple-900/30';
  if (isPeer) return 'bg-blue-50 dark:bg-blue-900/20';
  return 'bg-white dark:bg-gray-900';
}

function CandidateGrid({ candidates }: { candidates: number }) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-px">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
        const isSet = (candidates & (1 << d)) !== 0;
        return (
          <span
            key={d}
            className="flex items-center justify-center text-[8px] sm:text-[10px] leading-none text-muted-foreground select-none"
          >
            {isSet ? d : ''}
          </span>
        );
      })}
    </div>
  );
}

function SudokuCellInner({
  index,
  value,
  isGiven,
  isSelected,
  isPeer,
  isSameDigit,
  isError,
  candidates,
  showCandidates,
  notes,
}: SudokuCellProps) {
  const row = Math.floor(index / 9);
  const col = index % 9;

  const bg = getCellBackground(isSelected, isPeer, isSameDigit, isError);

  const borderClasses = [
    'border-gray-300 dark:border-gray-600',
    col === 2 || col === 5 ? 'border-r-2 border-r-gray-800 dark:border-r-gray-300' : 'border-r',
    row === 2 || row === 5 ? 'border-b-2 border-b-gray-800 dark:border-b-gray-300' : 'border-b',
    col === 0 ? 'border-l' : '',
    row === 0 ? 'border-t' : '',
  ].join(' ');

  const textColor = isError
    ? 'text-red-600 dark:text-red-400'
    : isGiven
      ? 'text-gray-900 dark:text-gray-100 font-bold'
      : 'text-blue-600 dark:text-blue-400';

  return (
    <div
      className={`relative flex items-center justify-center aspect-square cursor-pointer select-none transition-colors duration-100 ${bg} ${borderClasses}`}
      data-cell={index}
    >
      <AnimatePresence mode="wait">
        {value !== 0 ? (
          <motion.span
            key={`digit-${value}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15, type: 'spring' as const }}
            className={`text-sm sm:text-lg md:text-xl leading-none ${textColor}`}
          >
            {value}
          </motion.span>
        ) : notes !== 0 ? (
          <motion.div
            key="notes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0"
          >
            <CandidateGrid candidates={notes} />
          </motion.div>
        ) : showCandidates && candidates !== 0 ? (
          <motion.div
            key="candidates"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0"
          >
            <CandidateGrid candidates={candidates} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export const SudokuCell = memo(SudokuCellInner);
