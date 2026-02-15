'use client';

import { useMemo } from 'react';
import { useLocalStats } from '@/hooks/useLocalStats';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDuration } from '@/lib/scoring';
import type { Difficulty } from '@/engine/types';
import { DIFFICULTY_DISPLAY } from '@/engine/types';

const DIFFICULTIES: Difficulty[] = [
  'beginner',
  'easy',
  'medium',
  'hard',
  'expert',
];

export function StatsOverview() {
  const { getLocalStats, getBestTime } = useLocalStats();

  const records = useMemo(() => getLocalStats(), [getLocalStats]);

  const gamesPlayed = records.length;

  const totalHintsUsed = useMemo(
    () => records.reduce((sum, r) => sum + r.hintsUsed, 0),
    [records],
  );

  const averageTimeMs = useMemo(() => {
    if (records.length === 0) return null;
    const total = records.reduce((sum, r) => sum + r.solveTimeMs, 0);
    return Math.round(total / records.length);
  }, [records]);

  const bestTimes = useMemo(() => {
    const map: Partial<Record<Difficulty, number | null>> = {};
    for (const d of DIFFICULTIES) {
      map[d] = getBestTime(d);
    }
    return map;
  }, [getBestTime]);

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Games Played
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{gamesPlayed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Average Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {averageTimeMs !== null ? formatDuration(averageTimeMs) : '--'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Total Hints Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{totalHintsUsed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Best times per difficulty */}
      <Card>
        <CardHeader>
          <CardTitle>Best Times</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DIFFICULTIES.map((d) => {
              const best = bestTimes[d];
              return (
                <div
                  key={d}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm font-medium">
                    {DIFFICULTY_DISPLAY[d]}
                  </span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {best !== null && best !== undefined
                      ? formatDuration(best)
                      : '--'}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
