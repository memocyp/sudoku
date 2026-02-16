'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function AuthButton() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) return null;

  if (user) {
    const initial = (user.email?.[0] ?? 'U').toUpperCase();
    return (
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold"
          aria-label="User avatar"
        >
          {initial}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await signOut();
            router.push('/');
          }}
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/login">Sign In</Link>
    </Button>
  );
}
