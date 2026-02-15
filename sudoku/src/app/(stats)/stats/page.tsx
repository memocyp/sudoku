'use client';

import { motion } from 'framer-motion';
import { BarChart3, Clock, Trophy, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Difficulty } from '@/engine/types';
import { DIFFICULTY_DISPLAY } from '@/engine/types';

// ---------------------------------------------------------------------------
// Placeholder stats (will be replaced by Supabase or local storage data)
// ---------------------------------------------------------------------------

interface StatsSummary {
  totalGames: number;
  totalWins: number;
  totalTime: string;
  averageTime: string;
  bestTime: string;
  currentStreak: number;
  longestStreak: number;
  byDifficulty: {
    difficulty: Difficulty;
    games: number;
    wins: number;
    bestTime: string;
    avgTime: string;
  }[];
}

const PLACEHOLDER_STATS: StatsSummary = {
  totalGames: 0,
  totalWins: 0,
  totalTime: '0s',
  averageTime: '--',
  bestTime: '--',
  currentStreak: 0,
  longestStreak: 0,
  byDifficulty: [
    { difficulty: 'beginner', games: 0, wins: 0, bestTime: '--', avgTime: '--' },
    { difficulty: 'easy', games: 0, wins: 0, bestTime: '--', avgTime: '--' },
    { difficulty: 'medium', games: 0, wins: 0, bestTime: '--', avgTime: '--' },
    { difficulty: 'hard', games: 0, wins: 0, bestTime: '--', avgTime: '--' },
    { difficulty: 'expert', games: 0, wins: 0, bestTime: '--', avgTime: '--' },
  ],
};

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
  const stats = PLACEHOLDER_STATS;

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
              <p className="text-2xl font-bold">{stats.totalGames}</p>
              <p className="text-xs text-muted-foreground">Games Played</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="flex flex-col items-center pt-6">
              <Trophy className="size-6 text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.totalWins}</p>
              <p className="text-xs text-muted-foreground">Games Won</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="flex flex-col items-center pt-6">
              <Clock className="size-6 text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.bestTime}</p>
              <p className="text-xs text-muted-foreground">Best Time</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="flex flex-col items-center pt-6">
              <TrendingUp className="size-6 text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
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
          {stats.byDifficulty.map((entry) => (
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
                    {entry.wins} wins &middot; Best: {entry.bestTime} &middot; Avg: {entry.avgTime}
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
