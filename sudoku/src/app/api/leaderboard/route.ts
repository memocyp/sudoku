import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get('difficulty') ?? 'medium';
  const limit = parseInt(searchParams.get('limit') ?? '50', 10);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  // TODO: Fetch leaderboard entries from Supabase
  // For now, return placeholder data
  console.log('Leaderboard query:', { difficulty, limit, offset });

  return NextResponse.json({
    entries: [],
    total: 0,
  });
}
