'use client';

import { formatDuration } from '@/lib/scoring';

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  solveTimeMs: number;
  completedAt: string;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  loading: boolean;
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

function getRankDisplay(rank: number): string {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
}

function getRankColor(rank: number): string {
  if (rank === 1) return 'text-yellow-500';
  if (rank === 2) return 'text-gray-400';
  if (rank === 3) return 'text-amber-600';
  return 'text-muted-foreground';
}

export function LeaderboardTable({ entries, loading }: LeaderboardTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Loading leaderboard...
          </p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          No entries yet. Be the first to complete a puzzle!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-3 px-2 font-medium text-muted-foreground w-16">
              Rank
            </th>
            <th className="py-3 px-2 font-medium text-muted-foreground">
              Player
            </th>
            <th className="py-3 px-2 font-medium text-muted-foreground text-right">
              Time
            </th>
            <th className="py-3 px-2 font-medium text-muted-foreground text-right hidden sm:table-cell">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={`${entry.rank}-${entry.displayName}`}
              className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
            >
              <td className="py-3 px-2">
                <span
                  className={`font-semibold tabular-nums ${getRankColor(entry.rank)}`}
                >
                  {getRankDisplay(entry.rank)}
                </span>
              </td>
              <td className="py-3 px-2 font-medium truncate max-w-[12rem]">
                {entry.displayName}
              </td>
              <td className="py-3 px-2 text-right tabular-nums">
                {formatDuration(entry.solveTimeMs)}
              </td>
              <td className="py-3 px-2 text-right text-muted-foreground hidden sm:table-cell">
                {formatDate(entry.completedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
