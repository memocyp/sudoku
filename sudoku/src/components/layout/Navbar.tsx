'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthButton } from '@/components/layout/AuthButton';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Grid3X3, BookOpen, BarChart3, Trophy, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/play', label: 'Play', icon: Grid3X3 },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg"
        >
          <Grid3X3 className="size-5 text-primary" />
          <span>Sudoku</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Button
              key={href}
              variant={pathname.startsWith(href) ? 'secondary' : 'ghost'}
              size="sm"
              asChild
            >
              <Link href={href} className="flex items-center gap-1.5">
                <Icon className="size-4" />
                {label}
              </Link>
            </Button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <AuthButton />

          {/* Mobile hamburger using Sheet */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Grid3X3 className="size-5 text-primary" />
                  Sudoku
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4 pt-4">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                  <Button
                    key={href}
                    variant={pathname.startsWith(href) ? 'secondary' : 'ghost'}
                    size="sm"
                    className="justify-start"
                    asChild
                    onClick={() => setMobileOpen(false)}
                  >
                    <Link href={href} className={cn('flex items-center gap-2')}>
                      <Icon className="size-4" />
                      {label}
                    </Link>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
