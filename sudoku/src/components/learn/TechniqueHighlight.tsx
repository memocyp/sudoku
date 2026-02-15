'use client';

interface TechniqueHighlightProps {
  cells: number[];
  color?: string;
}

/**
 * Renders a visual overlay highlighting specific cells on a Sudoku board.
 * Used in tutorials to show technique patterns. The overlay is positioned
 * absolutely over a parent board component.
 *
 * Each highlighted cell maps to a position in a 9x9 grid using CSS grid
 * row/column coordinates.
 */
export function TechniqueHighlight({
  cells,
  color = 'rgba(59, 130, 246, 0.3)',
}: TechniqueHighlightProps) {
  if (cells.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 grid grid-cols-9 grid-rows-9"
      aria-hidden="true"
    >
      {cells.map((cellIndex) => {
        const row = Math.floor(cellIndex / 9);
        const col = cellIndex % 9;

        return (
          <div
            key={cellIndex}
            className="rounded-sm"
            style={{
              gridRow: row + 1,
              gridColumn: col + 1,
              backgroundColor: color,
            }}
          />
        );
      })}
    </div>
  );
}
