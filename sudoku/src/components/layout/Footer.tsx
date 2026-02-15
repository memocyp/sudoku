'use client';

import Link from 'next/link';
import { Grid3X3 } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Grid3X3 className="size-4" />
          <span>Sudoku</span>
          <span className="mx-1">&middot;</span>
          <span>&copy; {year} All rights reserved</span>
        </div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link
            href="/play"
            className="hover:text-foreground transition-colors"
          >
            Play
          </Link>
          <Link
            href="/learn"
            className="hover:text-foreground transition-colors"
          >
            Learn
          </Link>
          <Link
            href="/stats"
            className="hover:text-foreground transition-colors"
          >
            Stats
          </Link>
          <Link
            href="/leaderboard"
            className="hover:text-foreground transition-colors"
          >
            Leaderboard
          </Link>
        </nav>
      </div>
    </footer>
  );
}
