'use client';

import { type Difficulty, DIFFICULTY_DISPLAY } from '@/engine/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { motion } from 'framer-motion';

interface DifficultyOption {
  difficulty: Difficulty;
  description: string;
  clues: string;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    difficulty: 'beginner',
    description: 'Perfect for learning. Only naked singles needed.',
    clues: '~45 clues',
  },
  {
    difficulty: 'easy',
    description: 'A gentle challenge. Hidden singles introduced.',
    clues: '~38 clues',
  },
  {
    difficulty: 'medium',
    description: 'Requires pair-finding techniques.',
    clues: '~32 clues',
  },
  {
    difficulty: 'hard',
    description: 'Triple and advanced elimination techniques.',
    clues: '~28 clues',
  },
  {
    difficulty: 'expert',
    description: 'X-Wing and Swordfish patterns required.',
    clues: '~24 clues',
  },
];

interface Props {
  onSelect: (difficulty: Difficulty) => void;
}

const cardVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.03, y: -4 },
};

export function DifficultySelector({ onSelect }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-3xl mx-auto">
      {DIFFICULTY_OPTIONS.map((option) => (
        <motion.div
          key={option.difficulty}
          variants={cardVariants}
          initial="rest"
          whileHover="hover"
          transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
        >
          <Card
            className="cursor-pointer hover:border-primary/50 transition-colors h-full"
            onClick={() => onSelect(option.difficulty)}
            role="button"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(option.difficulty);
              }
            }}
            aria-label={`Select ${DIFFICULTY_DISPLAY[option.difficulty]} difficulty`}
          >
            <CardHeader>
              <CardTitle className="text-lg">
                {DIFFICULTY_DISPLAY[option.difficulty]}
              </CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-xs text-muted-foreground">
                {option.clues}
              </span>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
