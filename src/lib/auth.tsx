import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { UserProfile } from '@/types';
import { fetchProfile } from './api';
import { DEFAULT_PROFILE } from './mock/data';
import { supabase, isSupabaseConfigured } from './supabase';

/* ---- Universal User type (compatible with Supabase User and Mock User) ---- */
export interface AppUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

/* ---- Universal Session type ---- */
export interface AppSession {
  user: AppUser;
  access_token?: string;
}

export const ADMIN_PROFILE: UserProfile = {
  id: 'admin-mock-user-id',
  email: 'admin@modernstories.com',
  display_name: 'Editorial Admin',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  xp: 3500,
  level: 6,
  bio: 'Lead Editorial Director & Superadmin at The Modern Stories.',
};

export const ADMIN_USER: AppUser = {
  id: 'admin-mock-user-id',
  email: 'admin@modernstories.com',
  user_metadata: {
    full_name: 'Editorial Admin',
    role: 'admin',
  },
  app_metadata: {
    role: 'admin',
  },
};

export const READER_USER: AppUser = {
  id: DEFAULT_PROFILE.id,
  email: DEFAULT_PROFILE.email,
  user_metadata: {
    full_name: DEFAULT_PROFILE.display_name,
    role: 'reader',
  },
};

const STORAGE_KEY = 'tms_mock_session';

function loadMockSession(): AppSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveMockSession(session: AppSession | null) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function mapUserToProfile(appUser: AppUser): UserProfile {
  const meta = (appUser.user_metadata || {}) as Record<string, unknown>;
  const displayName =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    (typeof meta.user_name === 'string' && meta.user_name) ||
    appUser.email?.split('@')[0] ||
    DEFAULT_PROFILE.display_name;

  const avatarUrl =
    (typeof meta.avatar_url === 'string' && meta.avatar_url) ||
    (typeof meta.picture === 'string' && meta.picture) ||
    null;

  return {
    id: appUser.id,
    email: appUser.email || DEFAULT_PROFILE.email,
    display_name: displayName,
    avatar_url: avatarUrl,
    xp: DEFAULT_PROFILE.xp,
    level: DEFAULT_PROFILE.level,
    bio: (typeof meta.bio === 'string' && meta.bio) || DEFAULT_PROFILE.bio,
  };
}

interface AuthContextValue {
  session: Session | AppSession | null;
  user: User | AppUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | AppSession | null>(null);
  const [user, setUser] = useState<User | AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (isConfigured && supabase) {
      // 1. Check active Supabase session
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          fetchProfile(currentSession.user.id)
            .then((p) => setProfile(p || mapUserToProfile(currentSession.user as AppUser)))
            .catch(() => setProfile(mapUserToProfile(currentSession.user as AppUser)))
            .finally(() => setLoading(false));
        } else {
          // Fallback to local demo session if active in localStorage
          const saved = loadMockSession();
          if (saved?.user) {
            setSession(saved);
            setUser(saved.user);
            if (saved.user.email?.toLowerCase() === 'admin@modernstories.com') {
              setProfile(ADMIN_PROFILE);
              setLoading(false);
            } else {
              fetchProfile(saved.user.id)
                .then((p) => setProfile(p || mapUserToProfile(saved.user)))
                .catch(() => setProfile(mapUserToProfile(saved.user)))
                .finally(() => setLoading(false));
            }
          } else {
            setLoading(false);
          }
        }
      });

      // 2. Listen to Supabase auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, newSession: Session | null) => {
        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          try {
            const p = await fetchProfile(newSession.user.id);
            setProfile(p || mapUserToProfile(newSession.user as AppUser));
          } catch {
            setProfile(mapUserToProfile(newSession.user as AppUser));
          }
          setLoading(false);
        } else {
          const saved = loadMockSession();
          if (!saved?.user) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Fallback to local session when Supabase keys are not set in .env
      const saved = loadMockSession();
      if (saved?.user) {
        setSession(saved);
        setUser(saved.user);
        if (saved.user.email?.toLowerCase() === 'admin@modernstories.com') {
          setProfile(ADMIN_PROFILE);
          setLoading(false);
        } else {
          fetchProfile(saved.user.id)
            .then((p) => setProfile(p || mapUserToProfile(saved.user)))
            .catch(() => setProfile(mapUserToProfile(saved.user)))
            .finally(() => setLoading(false));
        }
      } else {
        setLoading(false);
      }
    }
  }, [isConfigured]);

  const applyMockSession = async (mockUser: AppUser, customProfile?: UserProfile) => {
    const sess: AppSession = { user: mockUser };
    saveMockSession(sess);
    setSession(sess);
    setUser(mockUser);
    if (customProfile) {
      setProfile(customProfile);
      return;
    }
    try {
      const p = await fetchProfile(mockUser.id);
      setProfile(p || mapUserToProfile(mockUser));
    } catch {
      setProfile(mapUserToProfile(mockUser));
    }
  };

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isDemoAdmin = cleanEmail === 'admin@modernstories.com';
    const isDemoReader = cleanEmail === 'demo@modernstories.com';

    // 1. Admin Demo Account: instant guaranteed sign in with full Superadmin access
    if (isDemoAdmin) {
      if (isConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (!error && data.user) {
            setUser(data.user);
            setSession(data.session);
            setProfile(ADMIN_PROFILE);
            return;
          }
        } catch {
          // Seamless fallback for local admin demo credentials
        }
      }
      await applyMockSession(ADMIN_USER, ADMIN_PROFILE);
      return;
    }

    // 2. Reader Demo Account: instant guaranteed sign in with reader demo profile
    if (isDemoReader) {
      if (isConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (!error && data.user) {
            setUser(data.user);
            setSession(data.session);
            setProfile(mapUserToProfile(data.user as AppUser));
            return;
          }
        } catch {
          // Seamless fallback for local reader demo credentials
        }
      }
      await applyMockSession(READER_USER, DEFAULT_PROFILE);
      return;
    }

    // 3. Regular account: authenticate against Supabase or fallback to local user
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        setProfile(mapUserToProfile(data.user as AppUser));
      }
    } else {
      const customUser: AppUser = {
        id: `local-user-${Date.now()}`,
        email,
      };
      await applyMockSession(customUser);
    }
  };

  const signUp = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isDemoAdmin = cleanEmail === 'admin@modernstories.com';
    const isDemoReader = cleanEmail === 'demo@modernstories.com';

    if (isDemoAdmin) {
      await applyMockSession(ADMIN_USER, ADMIN_PROFILE);
      return;
    }

    if (isDemoReader) {
      await applyMockSession(READER_USER, DEFAULT_PROFILE);
      return;
    }

    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        setProfile(mapUserToProfile(data.user as AppUser));
      }
    } else {
      const customUser: AppUser = {
        id: `local-user-${Date.now()}`,
        email,
      };
      await applyMockSession(customUser);
    }
  };

  const signInWithGoogle = async () => {
    if (isConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } else {
      // Fallback mock Google authentication when running without Supabase credentials
      await applyMockSession({
        id: DEFAULT_PROFILE.id,
        email: DEFAULT_PROFILE.email,
        user_metadata: {
          full_name: DEFAULT_PROFILE.display_name,
          avatar_url: DEFAULT_PROFILE.avatar_url,
        },
      });
    }
  };

  const signOut = async () => {
    if (isConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    saveMockSession(null);
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const p = await fetchProfile(user.id);
        if (p) {
          setProfile(p);
        } else {
          setProfile(mapUserToProfile(user as AppUser));
        }
      } catch {
        setProfile(mapUserToProfile(user as AppUser));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        isConfigured,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

