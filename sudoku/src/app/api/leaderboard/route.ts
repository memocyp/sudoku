import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

const DIFFICULTY_NAME_TO_LEVEL: Record<string, number> = {
  beginner: 1,
  easy: 2,
  medium: 3,
  hard: 4,
  expert: 5,
};

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ entries: [], total: 0 });
  }

  const { searchParams } = new URL(request.url);
  const difficultyParam = searchParams.get('difficulty') ?? 'medium';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  const difficultyLevel = DIFFICULTY_NAME_TO_LEVEL[difficultyParam] ?? 3;

  const supabase = await createClient();

  // Get total count for this difficulty
  const { count } = await supabase
    .from('solve_times')
    .select('*', { count: 'exact', head: true })
    .eq('difficulty', difficultyLevel);

  // Get leaderboard entries with profile display names
  const { data, error } = await supabase
    .from('solve_times')
    .select('id, solve_time_ms, hints_used, mistakes_made, created_at, user_id, profiles(display_name)')
    .eq('difficulty', difficultyLevel)
    .order('solve_time_ms', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries = (data ?? []).map((row, index) => {
    const profile = row.profiles as unknown as { display_name: string | null } | null;
    return {
      rank: offset + index + 1,
      displayName: profile?.display_name ?? 'Anonymous',
      solveTimeMs: row.solve_time_ms,
      hintsUsed: row.hints_used,
      mistakesMade: row.mistakes_made,
      createdAt: row.created_at,
    };
  });

  return NextResponse.json({
    entries,
    total: count ?? 0,
  });
}
