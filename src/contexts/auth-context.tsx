import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  ready: boolean;
  configured: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    void getSupabase().then((supabase) => {
      if (!active) return;
      if (!supabase) {
        setReady(true);
        return;
      }
      void supabase.auth.getSession().then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setReady(true);
      });
      const { data } = supabase.auth.onAuthStateChange((_event, next) => {
        setSession(next);
        setReady(true);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = await getSupabase();
    await supabase?.auth.signOut();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user: session?.user ?? null, ready, configured, signOut }),
    [session, ready, configured, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
