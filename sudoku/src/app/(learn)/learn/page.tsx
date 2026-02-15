'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Technique data
// ---------------------------------------------------------------------------

interface Technique {
  slug: string;
  name: string;
  description: string;
}

interface TechniqueGroup {
  tier: string;
  tierVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  techniques: Technique[];
}

const TECHNIQUE_GROUPS: TechniqueGroup[] = [
  {
    tier: 'Beginner',
    tierVariant: 'secondary',
    techniques: [
      {
        slug: 'naked-single',
        name: 'Naked Single',
        description:
          'When a cell has only one possible candidate remaining, that digit must go in that cell.',
      },
      {
        slug: 'hidden-single',
        name: 'Hidden Single',
        description:
          'When a digit can only go in one cell within a row, column, or box, it must go there.',
      },
    ],
  },
  {
    tier: 'Intermediate',
    tierVariant: 'outline',
    techniques: [
      {
        slug: 'naked-pairs',
        name: 'Naked Pairs',
        description:
          'When two cells in a house share the same two candidates, those digits can be eliminated from other cells.',
      },
      {
        slug: 'hidden-pairs',
        name: 'Hidden Pairs',
        description:
          'When two digits only appear as candidates in two cells of a house, all other candidates can be removed.',
      },
      {
        slug: 'pointing-pairs',
        name: 'Pointing Pairs',
        description:
          'When a candidate within a box is restricted to a single row or column, it can be eliminated elsewhere in that line.',
      },
      {
        slug: 'box-line-reduction',
        name: 'Box/Line Reduction',
        description:
          'When a candidate in a row or column is confined to a single box, it can be eliminated from other cells in that box.',
      },
      {
        slug: 'naked-triples',
        name: 'Naked Triples',
        description:
          'When three cells in a house have candidates that are a subset of three digits, those digits can be eliminated from other cells.',
      },
    ],
  },
  {
    tier: 'Advanced',
    tierVariant: 'default',
    techniques: [
      {
        slug: 'hidden-triples',
        name: 'Hidden Triples',
        description:
          'When three digits only appear in three cells of a house, all other candidates can be removed from those cells.',
      },
      {
        slug: 'x-wing',
        name: 'X-Wing',
        description:
          'When a candidate appears in exactly two cells in each of two rows (same columns), it can be eliminated from other cells in those columns.',
      },
    ],
  },
  {
    tier: 'Expert',
    tierVariant: 'destructive',
    techniques: [
      {
        slug: 'swordfish',
        name: 'Swordfish',
        description:
          'An extension of X-Wing to three rows and three columns for powerful candidate elimination.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 } as const,
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

export default function LearnPage() {
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
          <BookOpen className="size-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Learn Sudoku</h1>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Master 10 solving techniques from beginner to expert. Each technique includes an
          interactive tutorial and a detailed guide.
        </p>
      </motion.div>

      {/* Technique groups */}
      <motion.div
        className="space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {TECHNIQUE_GROUPS.map((group) => (
          <motion.section key={group.tier} variants={itemVariants}>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant={group.tierVariant}>{group.tier}</Badge>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.techniques.map((technique) => (
                <Card key={technique.slug} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-base">{technique.name}</CardTitle>
                    <CardDescription>{technique.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto flex gap-2">
                    <Button variant="default" size="sm" asChild>
                      <Link href={`/tutorials/${technique.slug}`}>
                        Tutorial
                        <ArrowRight className="size-3.5 ml-1" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/guides/${technique.slug}`}>Guide</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>
        ))}
      </motion.div>
    </div>
  );
}
