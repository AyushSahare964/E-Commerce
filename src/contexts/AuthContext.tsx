import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null; // Supabase access token (not used for manual fetches, but kept for compatibility)
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper to load the current Supabase user + profile
  const loadProfileFromSupabase = async () => {
    try {
      setLoading(true);

      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        setUser(null);
        setToken(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .eq('id', authUser.id)
        .single();

      if (profileError || !profile) {
        setUser(null);
        setToken(null);
        return;
      }

      setUser(profile as AuthUser);

      const { data: sessionData } = await supabase.auth.getSession();
      setToken(sessionData.session?.access_token ?? 'supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfileFromSupabase();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, _session) => {
      // Whenever auth state changes, refresh profile context
      void loadProfileFromSupabase();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Trigger profile load (handle_new_user trigger inserts into profiles)
      await loadProfileFromSupabase();

      toast({
        title: 'Account created!',
        description: 'Welcome to ShopKart! Check your email for verification if required.',
      });
      return { error: null };
    } catch (e) {
      const err = e as Error;
      toast({
        title: 'Sign up failed',
        description: err.message,
        variant: 'destructive',
      });
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await loadProfileFromSupabase();

      toast({
        title: 'Welcome back!',
        description: "You've successfully signed in.",
      });
      return { error: null };
    } catch (e) {
      const err = e as Error;
      toast({
        title: 'Sign in failed',
        description: err.message,
        variant: 'destructive',
      });
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
    toast({
      title: 'Signed out',
      description: "You've been signed out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
