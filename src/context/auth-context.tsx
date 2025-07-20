
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  type User 
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isPremium: boolean;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const auth = getAuth(app);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      // Logica per determinare lo stato Premium
      // Per ora, controlliamo se l'email contiene "+premium"
      if (user && user.email?.includes('+premium')) {
        setIsPremium(true);
      } else {
        setIsPremium(false);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);
  
  const register = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Errore di registrazione:", error);
      toast({
        title: "Errore di registrazione",
        description: error.message || "Impossibile completare la registrazione.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Errore di accesso:", error);
       toast({
        title: "Errore di accesso",
        description: "Email o password non validi. Riprova.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
       console.error("Errore di logout:", error);
       toast({
        title: "Errore",
        description: "Impossibile effettuare il logout.",
        variant: "destructive",
      });
    }
  };


  const value = {
    user,
    isPremium,
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
}
