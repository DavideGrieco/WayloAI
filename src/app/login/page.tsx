
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Login } from '@/components/login';
import { Register } from '@/components/register';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const router = useRouter();

  if (user) {
    router.push('/planner');
    return null; // or a loading spinner
  }

  return (
     <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8">
          {showLogin ? (
            <>
              <Login />
              <p className="text-center text-sm text-muted-foreground">
                Non hai un account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => setShowLogin(false)}>
                  Registrati
                </Button>
              </p>
            </>
          ) : (
            <>
              <Register />
              <p className="text-center text-sm text-muted-foreground">
                Hai già un account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => setShowLogin(true)}>
                  Accedi
                </Button>
              </p>
            </>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
