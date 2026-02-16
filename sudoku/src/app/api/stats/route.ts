import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';

export async function GET(_request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ stats: [] });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('solve_times')
    .select('id, difficulty, solve_time_ms, hints_used, mistakes_made, puzzle_hash, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stats: data });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { difficulty, solveTimeMs, hintsUsed, mistakesMade, puzzleHash } = body as {
    difficulty: number;
    solveTimeMs: number;
    hintsUsed: number;
    mistakesMade: number;
    puzzleHash?: string;
  };

  if (!difficulty || !solveTimeMs) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Ensure profile exists (trigger may not have fired for pre-existing users)
  // Uses admin client (service_role) to bypass RLS — profiles table has no INSERT policy
  const admin = createServiceClient();
  if (admin) {
    const { error: profileError } = await admin
      .from('profiles')
      .upsert(
        { id: user.id, display_name: user.user_metadata?.name ?? user.email ?? 'Anonymous' },
        { onConflict: 'id', ignoreDuplicates: true },
      );

    if (profileError) {
      console.error('Profile upsert failed:', profileError.message);
    }
  }

  const { data, error } = await supabase
    .from('solve_times')
    .insert({
      user_id: user.id,
      difficulty,
      solve_time_ms: solveTimeMs,
      hints_used: hintsUsed ?? 0,
      mistakes_made: mistakesMade ?? 0,
      puzzle_hash: puzzleHash ?? null,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id });
}
