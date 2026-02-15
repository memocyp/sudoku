'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Grid3X3, BookOpen, Clock, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Difficulty } from '@/engine/types';
import { DIFFICULTY_DISPLAY } from '@/engine/types';

const DIFFICULTIES: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  easy: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  expert: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const FEATURES = [
  {
    icon: Grid3X3,
    title: '5 Difficulty Levels',
    description: 'From beginner to expert, challenge yourself with puzzles tailored to your skill level.',
  },
  {
    icon: BookOpen,
    title: 'Interactive Tutorials',
    description: 'Learn solving techniques step-by-step with guided, interactive lessons.',
  },
  {
    icon: Clock,
    title: 'Solve-time Tracking',
    description: 'Track your progress and see how your solving speed improves over time.',
  },
  {
    icon: Trophy,
    title: 'Global Leaderboards',
    description: 'Compete with players worldwide and climb the ranks on our leaderboards.',
  },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    } as const,
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' } as const,
  },
} as const;

export default function HomePage() {
  const router = useRouter();

  function handleDifficultySelect(difficulty: Difficulty) {
    router.push(`/play?difficulty=${difficulty}`);
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <motion.section
        className="flex flex-col items-center text-center gap-6 mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' } as const}
      >
        <div className="flex items-center gap-3 mb-2">
          <Grid3X3 className="size-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Sudoku
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Play, learn, and master Sudoku with 5 difficulty levels, interactive tutorials,
          and global leaderboards. Start your journey now.
        </p>
        <Button size="lg" onClick={() => router.push('/play?difficulty=medium')} className="mt-2">
          <Grid3X3 className="size-5 mr-2" />
          Play Now
        </Button>
      </motion.section>

      {/* Difficulty Cards */}
      <motion.section
        className="mb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-2xl font-semibold text-center mb-8"
          variants={itemVariants}
        >
          Choose Your Difficulty
        </motion.h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {DIFFICULTIES.map((difficulty) => (
            <motion.div key={difficulty} variants={itemVariants}>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleDifficultySelect(difficulty)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-base">
                    {DIFFICULTY_DISPLAY[difficulty]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${DIFFICULTY_COLORS[difficulty]}`}
                  >
                    {DIFFICULTY_DISPLAY[difficulty]}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-2xl font-semibold text-center mb-8"
          variants={itemVariants}
        >
          Features
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                      <feature.icon className="size-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
