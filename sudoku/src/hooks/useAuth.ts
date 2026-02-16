'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Get the initial session
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user ?? null);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: { user: User | null } | null) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const notConfiguredError = 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.';

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: notConfiguredError };
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: notConfiguredError };
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return { user, loading, signIn, signUp, signOut };
}
