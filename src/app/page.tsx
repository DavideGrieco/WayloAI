'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Login } from '@/components/login';
import { Register } from '@/components/register';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
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
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Benvenuto!</h1>
            <p className="mb-8">Sei autenticato come {user.email}.</p>
            <div className="space-x-4">
                <Button onClick={() => window.location.href='/planner'}>Vai al Planner</Button>
                <Button variant="outline" onClick={logout}>Esci</Button>
            </div>
        </div>
    </div>
  );
}
