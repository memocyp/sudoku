'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AuthButton() {
  // Placeholder: Supabase integration comes later.
  // For now, always show "Sign In".
  const isLoggedIn = false;

  if (isLoggedIn) {
    return (
      <div className="relative">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold"
          aria-label="User menu"
        >
          U
        </button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/login">Sign In</Link>
    </Button>
  );
}
