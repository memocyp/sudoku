import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Play } from 'lucide-react';

// ---------------------------------------------------------------------------
// Technique reference data
// ---------------------------------------------------------------------------

const TECHNIQUES: Record<
  string,
  { title: string; difficulty: string; description: string; details: string }
> = {
  'naked-single': {
    title: 'Naked Single',
    difficulty: 'Beginner',
    description:
      'When a cell has only one possible candidate remaining, that digit must go in that cell.',
    details:
      'A Naked Single occurs when all other digits (1-9) have been eliminated from a cell by the values already present in its row, column, and box. Since only one possibility remains, that digit is the answer for the cell. This is the most fundamental Sudoku solving technique and is often the first one beginners learn. Scan each empty cell and count how many candidates it has. If only one candidate remains, you have found a Naked Single.',
  },
  'hidden-single': {
    title: 'Hidden Single',
    difficulty: 'Beginner',
    description:
      'When a digit can only go in one cell within a row, column, or box, it must go there.',
    details:
      'A Hidden Single is found by examining each house (row, column, or box) and checking where each digit 1-9 can possibly be placed. If a digit can only go in one cell within a particular house, then that cell must contain that digit, regardless of what other candidates the cell may have. The single is "hidden" because the cell might have multiple candidates, but only one of them is unique to that house.',
  },
  'naked-pairs': {
    title: 'Naked Pairs',
    difficulty: 'Intermediate',
    description:
      'When two cells in a house share the same two candidates, those digits can be eliminated from other cells in the house.',
    details:
      'When two cells within the same row, column, or box each contain exactly the same two candidates (and no others), those two digits must be distributed between those two cells. Therefore, those two digits can be safely removed as candidates from all other cells in the shared house. This technique extends naturally to Naked Triples and Naked Quads.',
  },
  'hidden-pairs': {
    title: 'Hidden Pairs',
    difficulty: 'Intermediate',
    description:
      'When two digits only appear as candidates in two cells of a house, all other candidates can be removed from those cells.',
    details:
      'If two digits appear as candidates in only two cells within a house, those two digits must go in those two cells. All other candidates can be removed from those two cells. The pair is "hidden" because the cells may contain additional candidates that obscure the pattern. Look at each house and count how many cells contain each digit as a candidate.',
  },
  'pointing-pairs': {
    title: 'Pointing Pairs',
    difficulty: 'Intermediate',
    description:
      'When a candidate within a box is restricted to a single row or column, that candidate can be eliminated from the rest of that row or column.',
    details:
      'Within a 3x3 box, if a particular candidate appears only in cells that share the same row (or column), then that digit must be placed in one of those cells. Since the digit is locked into that row (or column) within the box, it can be eliminated from all other cells in that row (or column) outside the box. This is sometimes called a "locked candidate" technique.',
  },
  'box-line-reduction': {
    title: 'Box/Line Reduction',
    difficulty: 'Intermediate',
    description:
      'When a candidate in a row or column is confined to a single box, it can be eliminated from other cells in that box.',
    details:
      'This is the complement of Pointing Pairs. If a candidate in a row or column only appears within a single box, then within that box, the candidate can be eliminated from all cells not in the intersecting row or column. The logic is that the digit must appear in that row/column within the box, so it cannot appear elsewhere in the box.',
  },
  'naked-triples': {
    title: 'Naked Triples',
    difficulty: 'Intermediate',
    description:
      'When three cells in a house have candidates that are a subset of three digits, those digits can be eliminated from other cells.',
    details:
      'A Naked Triple occurs when three cells in a house collectively contain only three different candidates. Not every cell needs to contain all three candidates. The key is that the union of candidates across the three cells contains exactly three digits. Those three digits can then be eliminated from all other cells in the house. This is a generalization of Naked Pairs.',
  },
  'hidden-triples': {
    title: 'Hidden Triples',
    difficulty: 'Advanced',
    description:
      'When three digits only appear in three cells of a house, all other candidates can be removed from those cells.',
    details:
      'If three digits appear as candidates in only three cells within a house, those three digits must be placed in those three cells. All other candidates can be safely removed from those three cells. Like Hidden Pairs, the triple is "hidden" because other candidates in the cells may mask the pattern. This technique requires careful analysis of candidate distributions.',
  },
  'x-wing': {
    title: 'X-Wing',
    difficulty: 'Advanced',
    description:
      'When a candidate appears in exactly two cells in each of two rows, and those cells are in the same two columns, the candidate can be eliminated from other cells in those columns.',
    details:
      'The X-Wing pattern forms a rectangle on the grid. If a candidate digit appears in exactly two cells in row A, and exactly two cells in row B, and these four cells occupy the same two columns, then the candidate must be placed in two diagonally opposite corners of the rectangle. This means the candidate can be eliminated from all other cells in those two columns. The pattern can also be found with columns as the base and rows for elimination.',
  },
  swordfish: {
    title: 'Swordfish',
    difficulty: 'Expert',
    description: 'An extension of X-Wing to three rows and three columns.',
    details:
      'The Swordfish is a generalization of the X-Wing pattern from 2 rows/columns to 3. If a candidate appears in at most 2-3 cells in each of three rows, and these cells are confined to exactly three columns, then the candidate can be eliminated from all other cells in those three columns. The cells form an irregular pattern (not necessarily a full 3x3 rectangle). This is one of the more advanced techniques and requires systematic scanning of candidate positions.',
  },
};

const DIFFICULTY_VARIANT: Record<string, 'secondary' | 'outline' | 'default' | 'destructive'> = {
  Beginner: 'secondary',
  Intermediate: 'outline',
  Advanced: 'default',
  Expert: 'destructive',
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const technique = TECHNIQUES[slug];

  if (!technique) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      {/* Back link */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/learn">
            <ArrowLeft className="size-4 mr-1" />
            Back to Learn
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="size-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{technique.title}</h1>
        </div>
        <Badge variant={DIFFICULTY_VARIANT[technique.difficulty] ?? 'outline'}>
          {technique.difficulty}
        </Badge>
      </div>

      {/* Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Overview</CardTitle>
          <CardDescription>{technique.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground/90">{technique.details}</p>
        </CardContent>
      </Card>

      {/* Call to action */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4 pt-6">
          <div className="flex-1">
            <p className="font-medium">Ready to practice?</p>
            <p className="text-sm text-muted-foreground">
              Try the interactive tutorial to see this technique in action.
            </p>
          </div>
          <Button asChild>
            <Link href={`/tutorials/${slug}`}>
              <Play className="size-4 mr-2" />
              Start Tutorial
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
