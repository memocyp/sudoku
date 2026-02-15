import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    // TODO: Exchange code for session via Supabase
    // const supabase = createServerClient(...)
    // await supabase.auth.exchangeCodeForSession(code)
    // For now, just redirect to the intended destination
  }

  return NextResponse.redirect(`${origin}${next}`);
}
