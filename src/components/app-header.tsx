'use client';

import { Plane, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from './ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { user, logout, isPremium } = useAuth();
  const pathname = usePathname();

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/planner" className="flex items-center gap-2">
          <Plane className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground font-headline">
            Waylo AI
          </h1>
        </Link>
        <nav className='flex items-center gap-4'>
          {user && isPremium && (
             <Link href="/my-trips" passHref>
                <Button variant={pathname === '/my-trips' ? 'secondary' : 'ghost'}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    I Miei Viaggi
                </Button>
            </Link>
          )}
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
              <Button variant="ghost" size="icon" onClick={logout} aria-label="Esci">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
