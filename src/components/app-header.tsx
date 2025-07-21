
'use client';

import { Plane, LogOut, Briefcase, LogIn } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from './ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppHeader() {
  const { user, logout, isPremium } = useAuth();
  const pathname = usePathname();

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Plane className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground font-headline">
            Waylo AI
          </h1>
        </Link>
        <nav className='flex items-center gap-2 md:gap-4'>
           {user && isPremium && (
             <Link href="/my-trips" passHref>
                <Button variant={pathname === '/my-trips' ? 'secondary' : 'ghost'}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">I Miei Viaggi</span>
                </Button>
            </Link>
          )}
           <Button variant={pathname === '/planner' ? 'secondary' : 'ghost'} asChild>
                <Link href="/planner">Planner</Link>
            </Button>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
              <Button variant="ghost" size="icon" onClick={logout} aria-label="Esci">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
             <Button asChild>
                <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Accedi
                </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
