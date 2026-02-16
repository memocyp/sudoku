'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Trophy, Target, TrendingUp, Loader2, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Difficulty } from '@/engine/types';
import { DIFFICULTY_DISPLAY, DIFFICULTY_MAP } from '@/engine/types';
import { formatDuration } from '@/lib/scoring';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatRecord {
  id: string;
  difficulty: number;
  solve_time_ms: number;
  hints_used: number;
  mistakes_made: number;
  puzzle_hash: string | null;
  created_at: string;
}

interface StatsSummary {
  totalGames: number;
  totalWins: number;
  averageTime: string;
  bestTime: string;
  byDifficulty: {
    difficulty: Difficulty;
    games: number;
    bestTime: string;
    avgTime: string;
  }[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LEVEL_TO_DIFFICULTY: Record<number, Difficulty> = {
  1: 'beginner',
  2: 'easy',
  3: 'medium',
  4: 'hard',
  5: 'expert',
};

function computeStats(records: StatRecord[]): StatsSummary {
  const totalGames = records.length;
  const totalWins = totalGames; // all records are completions

  let bestTime = '--';
  let averageTime = '--';

  if (totalGames > 0) {
    const times = records.map((r) => r.solve_time_ms);
    const minTime = Math.min(...times);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    bestTime = formatDuration(minTime);
    averageTime = formatDuration(avgTime);
  }

  // Group by difficulty
  const ALL_DIFFICULTIES: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
  const byDifficulty = ALL_DIFFICULTIES.map((diff) => {
    const level = DIFFICULTY_MAP[diff];
    const group = records.filter((r) => r.difficulty === level);

    if (group.length === 0) {
      return { difficulty: diff, games: 0, bestTime: '--', avgTime: '--' };
    }

    const times = group.map((r) => r.solve_time_ms);
    return {
      difficulty: diff,
      games: group.length,
      bestTime: formatDuration(Math.min(...times)),
      avgTime: formatDuration(times.reduce((a, b) => a + b, 0) / times.length),
    };
  });

  return { totalGames, totalWins, bestTime, averageTime, byDifficulty };
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 } as const,
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' } as const,
  },
} as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function StatsPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Failed to fetch stats (${res.status})`);
        }
        const { stats: records } = (await res.json()) as { stats: StatRecord[] };
        if (!cancelled) {
          setStats(computeStats(records ?? []));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load stats');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 } as const}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="size-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your Statistics</h1>
          </div>
          <div className="mt-12 flex flex-col items-center gap-4 text-muted-foreground">
            <LogIn className="size-12 opacity-30" />
            <p>Sign in to track your stats.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <LogIn className="size-4" />
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading
  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BarChart3 className="size-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your Statistics</h1>
        </div>
        <div className="flex justify-center py-24">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BarChart3 className="size-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your Statistics</h1>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Failed to load stats: {error}</p>
        </div>
      </div>
    );
  }

  const s = stats!;

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
          <BarChart3 className="size-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your Statistics</h1>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Track your Sudoku progress. Play more games to see your stats here.
        </p>
      </motion.div>

      {/* Overview cards */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="flex flex-col items-center pt-6">
              <Target className="size-6 text-primary mb-2" />
              <p className="text-2xl font-bold">{s.totalGames}</p>
              <p className="text-xs text-muted-foreground">Games Played</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="flex flex-col items-center pt-6">
              <Trophy className="size-6 text-primary mb-2" />
              <p className="text-2xl font-bold">{s.totalWins}</p>
              <p className="text-xs text-muted-foreground">Games Won</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="flex flex-col items-center pt-6">
              <Clock className="size-6 text-primary mb-2" />
              <p className="text-2xl font-bold">{s.bestTime}</p>
              <p className="text-xs text-muted-foreground">Best Time</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="flex flex-col items-center pt-6">
              <TrendingUp className="size-6 text-primary mb-2" />
              <p className="text-2xl font-bold">{s.averageTime}</p>
              <p className="text-xs text-muted-foreground">Average Time</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Per-difficulty breakdown */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-xl font-semibold mb-6"
          variants={itemVariants}
        >
          By Difficulty
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {s.byDifficulty.map((entry) => (
            <motion.div key={entry.difficulty} variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {DIFFICULTY_DISPLAY[entry.difficulty]}
                    </CardTitle>
                    <Badge variant="outline">{entry.games} games</Badge>
                  </div>
                  <CardDescription>
                    Best: {entry.bestTime} &middot; Avg: {entry.avgTime}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
