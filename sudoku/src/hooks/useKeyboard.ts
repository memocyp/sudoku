'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';

/**
 * Row / column helpers for arrow-key navigation on the 9x9 grid.
 */
function rowOf(cell: number): number {
  return Math.floor(cell / 9);
}

function colOf(cell: number): number {
  return cell % 9;
}

function cellAt(row: number, col: number): number {
  return row * 9 + col;
}

/**
 * Move selection in a cardinal direction, clamping at board edges.
 * Returns the new cell index.
 */
function moveSelection(current: number, direction: string): number {
  const row = rowOf(current);
  const col = colOf(current);

  switch (direction) {
    case 'ArrowUp':
      return row > 0 ? cellAt(row - 1, col) : current;
    case 'ArrowDown':
      return row < 8 ? cellAt(row + 1, col) : current;
    case 'ArrowLeft':
      return col > 0 ? cellAt(row, col - 1) : current;
    case 'ArrowRight':
      return col < 8 ? cellAt(row, col + 1) : current;
    default:
      return current;
  }
}

/**
 * Global keyboard handler for Sudoku game controls.
 *
 * - Arrow keys: move the selected cell
 * - Digits 1-9: enter digit (or toggle note if notes mode is active)
 * - Delete / Backspace: erase current cell
 * - Ctrl+Z: undo
 * - Ctrl+Y / Ctrl+Shift+Z: redo
 * - N: toggle notes mode
 */
export function useKeyboard() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore events when an input / textarea is focused
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const state = useGameStore.getState();
      const { selectedCell, isNotesMode, isComplete } = state;

      // Do nothing if the game is complete
      if (isComplete) return;

      // Arrow keys — move selection
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const from = selectedCell ?? 40; // default to centre cell
        state.selectCell(moveSelection(from, e.key));
        return;
      }

      // Digits 1-9
      const digit = parseInt(e.key, 10);
      if (digit >= 1 && digit <= 9) {
        e.preventDefault();
        if (isNotesMode) {
          state.toggleNote(digit);
        } else {
          state.enterDigit(digit);
        }
        return;
      }

      // Delete / Backspace — erase
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        state.erase();
        return;
      }

      // Ctrl+Z — undo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        state.undo();
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z — redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')
      ) {
        e.preventDefault();
        state.redo();
        return;
      }

      // N — toggle notes mode
      if (e.key === 'n' || e.key === 'N') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          state.setNotesMode(!isNotesMode);
          return;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
