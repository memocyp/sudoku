'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Difficulty } from '@/engine/types';
import { DIFFICULTY_DISPLAY } from '@/engine/types';
import { formatDuration } from '@/lib/scoring';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeaderboardEntry {
  rank: number;
  username: string;
  solveTime: string;
  date: string;
}

interface ApiEntry {
  rank: number;
  displayName: string;
  solveTimeMs: number;
  hintsUsed: number;
  mistakesMade: number;
  createdAt: string;
}

const DIFFICULTIES: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 } as const,
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' } as const,
  },
} as const;

// ---------------------------------------------------------------------------
// Rank icon helper
// ---------------------------------------------------------------------------

function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1) return <Medal className="size-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="size-5 text-gray-400" />;
  if (rank === 3) return <Medal className="size-5 text-amber-700" />;
  return <span className="text-sm font-medium text-muted-foreground w-5 text-center">{rank}</span>;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LeaderboardPage() {
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>('medium');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchLeaderboard() {
      try {
        const res = await fetch(`/api/leaderboard?difficulty=${activeDifficulty}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Failed to fetch leaderboard (${res.status})`);
        }
        const data = (await res.json()) as { entries: ApiEntry[]; total: number };
        if (!cancelled) {
          setEntries(
            (data.entries ?? []).map((e) => ({
              rank: e.rank,
              username: e.displayName,
              solveTime: formatDuration(e.solveTimeMs),
              date: formatDate(e.createdAt),
            })),
          );
          setTotal(data.total ?? 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchLeaderboard();
    return () => { cancelled = true; };
  }, [activeDifficulty]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 } as const}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="size-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto">
          See the fastest solvers across all difficulty levels. Sign in and complete puzzles to
          appear on the leaderboard.
        </p>
      </motion.div>

      {/* Tabs for each difficulty */}
      <Tabs
        defaultValue="medium"
        value={activeDifficulty}
        onValueChange={(v) => setActiveDifficulty(v as Difficulty)}
        className="max-w-2xl mx-auto"
      >
        <TabsList className="w-full grid grid-cols-5">
          {DIFFICULTIES.map((d) => (
            <TabsTrigger key={d} value={d} className="text-xs sm:text-sm">
              {DIFFICULTY_DISPLAY[d]}
            </TabsTrigger>
          ))}
        </TabsList>

        {DIFFICULTIES.map((d) => (
          <TabsContent key={d} value={d}>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="size-5" />
                  {DIFFICULTY_DISPLAY[d]} Leaderboard
                  <Badge variant="outline" className="ml-auto">
                    {d === activeDifficulty ? total : 0} entries
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {d === activeDifficulty && loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                ) : d === activeDifficulty && error ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">Failed to load leaderboard: {error}</p>
                  </div>
                ) : d === activeDifficulty && entries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="size-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">No entries yet.</p>
                    <p className="text-xs mt-1">
                      Be the first to complete a {DIFFICULTY_DISPLAY[d].toLowerCase()} puzzle!
                    </p>
                  </div>
                ) : d === activeDifficulty ? (
                  <motion.div
                    className="space-y-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Table header */}
                    <div className="grid grid-cols-[40px_1fr_100px_100px] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                      <span>Rank</span>
                      <span>Player</span>
                      <span className="text-right">Time</span>
                      <span className="text-right">Date</span>
                    </div>

                    {/* Entries */}
                    {entries.map((entry) => (
                      <motion.div
                        key={entry.rank}
                        variants={itemVariants}
                        className="grid grid-cols-[40px_1fr_100px_100px] gap-2 items-center px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <RankDisplay rank={entry.rank} />
                        <span className="text-sm font-medium truncate">{entry.username}</span>
                        <span className="text-sm text-right font-mono">{entry.solveTime}</span>
                        <span className="text-xs text-muted-foreground text-right">
                          {entry.date}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
