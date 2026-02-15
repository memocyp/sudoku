import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(_request: NextRequest) {
  // TODO: Fetch stats from Supabase for the authenticated user
  // For now, return placeholder stats
  return NextResponse.json({
    stats: [],
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // TODO: Save solve time to Supabase
  // Expected body: { difficulty, solveTimeMs, hintsUsed, mistakesMade, score }
  const { difficulty, solveTimeMs, hintsUsed, mistakesMade, score } = body as {
    difficulty: string;
    solveTimeMs: number;
    hintsUsed: number;
    mistakesMade: number;
    score: number;
  };

  // Placeholder: log and acknowledge
  console.log('Stats submission:', { difficulty, solveTimeMs, hintsUsed, mistakesMade, score });

  return NextResponse.json({ success: true });
}
