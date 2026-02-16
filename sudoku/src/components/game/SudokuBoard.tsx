'use client';

import { useCallback, useMemo } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { SudokuCell } from './SudokuCell';
import { getPeers } from '@/engine/utils';

export function SudokuBoard() {
  const board = useGameStore((s) => s.board);
  const puzzle = useGameStore((s) => s.puzzle);
  const solution = useGameStore((s) => s.solution);
  const selectedCell = useGameStore((s) => s.selectedCell);
  const candidates = useGameStore((s) => s.candidates);
  const notes = useGameStore((s) => s.notes);
  const selectCell = useGameStore((s) => s.selectCell);

  const highlightPeers = useSettingsStore((s) => s.highlightPeers);
  const highlightSameDigit = useSettingsStore((s) => s.highlightSameDigit);
  const showErrors = useSettingsStore((s) => s.showErrors);
  const showCandidates = useSettingsStore((s) => s.showCandidates);

  // Build peer set for selected cell
  const peerSet = useMemo(() => {
    if (selectedCell === null) return new Set<number>();
    return new Set(getPeers(selectedCell));
  }, [selectedCell]);

  // Get the selected digit for same-digit highlighting
  const selectedDigit = useMemo(() => {
    if (selectedCell === null) return 0;
    return board[selectedCell];
  }, [selectedCell, board]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const cellEl = target.closest('[data-cell]') as HTMLElement | null;
      if (cellEl) {
        const index = Number(cellEl.dataset.cell);
        if (!isNaN(index) && index >= 0 && index < 81) {
          selectCell(index);
        }
      }
    },
    [selectCell],
  );

  return (
    <div
      className="grid grid-cols-9 w-full max-w-[min(100vw-2rem,28rem)] aspect-square border-2 border-gray-800 dark:border-gray-300 rounded-sm mx-auto"
      onClick={handleClick}
      role="grid"
      aria-label="Sudoku board"
    >
      {Array.from({ length: 81 }, (_, i) => {
        const value = board[i];
        const isGiven = puzzle[i] !== 0;
        const isSelected = selectedCell === i;
        const isPeer = highlightPeers && selectedCell !== null && peerSet.has(i);
        const isSameDigit =
          highlightSameDigit &&
          selectedDigit !== 0 &&
          value !== 0 &&
          value === selectedDigit &&
          !isSelected;
        const isError =
          showErrors &&
          value !== 0 &&
          solution[i] !== 0 &&
          value !== solution[i];

        return (
          <SudokuCell
            key={i}
            index={i}
            value={value}
            isGiven={isGiven}
            isSelected={isSelected}
            isPeer={isPeer}
            isSameDigit={isSameDigit}
            isError={isError}
            candidates={candidates[i]}
            showCandidates={showCandidates}
            notes={notes[i]}
          />
        );
      })}
    </div>
  );
}
