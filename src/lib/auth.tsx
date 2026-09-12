/**
 * Mock authentication provider.
 * Replaces the Supabase auth dependency with a localStorage-backed mock.
 * Same context interface — swap back to the Supabase version when connecting your backend.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { UserProfile } from '@/types';
import { fetchProfile, updateProfile } from './api';
import { DEFAULT_PROFILE } from './mock/data';

/* ---- Minimal User type (replaces @supabase/supabase-js User) ---- */
export interface MockUser {
  id: string;
  email: string;
}

/* ---- Minimal Session type (replaces @supabase/supabase-js Session) ---- */
export interface MockSession {
  user: MockUser;
}

const STORAGE_KEY = 'tms_mock_session';

function loadSession(): MockSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session: MockSession | null) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

interface AuthContextValue {
  session: MockSession | null;
  user: MockUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<MockSession | null>(null);
  const [user, setUser] = useState<MockUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setSession(saved);
      setUser(saved.user);
      fetchProfile(saved.user.id)
        .then(setProfile)
        .catch(() => setProfile(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const applySession = async (mockUser: MockUser) => {
    const sess: MockSession = { user: mockUser };
    saveSession(sess);
    setSession(sess);
    setUser(mockUser);
    try {
      const p = await fetchProfile(mockUser.id);
      setProfile(p);
    } catch {
      setProfile(null);
    }
  };

  const signIn = async (email: string, _password: string) => {
    // Mock: any email/password accepted
    await applySession({ id: DEFAULT_PROFILE.id, email });
  };

  const signUp = async (email: string, _password: string) => {
    // Mock: create session immediately (no email confirmation)
    await applySession({ id: DEFAULT_PROFILE.id, email });
  };

  const signInWithGoogle = async () => {
    // Mock: simulate Google sign-in
    await applySession({ id: DEFAULT_PROFILE.id, email: DEFAULT_PROFILE.email });
  };

  const signOut = async () => {
    saveSession(null);
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const p = await fetchProfile(user.id);
        setProfile(p);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signIn, signUp, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
