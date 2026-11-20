import React, { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const ALLOWED_ADMIN_EMAILS = [
  'captaina381924@gmail.com',
  'drstrange334433@gmail.com',
];

const ADMIN_CREDENTIALS: Record<string, string> = {
  'captaina381924@gmail.com': 'office@95',
};

const ADMIN_STORAGE_KEY = 'gadgetzone_admin_session';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email && ALLOWED_ADMIN_EMAILS.includes(parsed.email.toLowerCase())) {
          return parsed;
        }
      }
    } catch {
      // ignore parsing error
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    // Check saved local admin session first
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email && ALLOWED_ADMIN_EMAILS.includes(parsed.email.toLowerCase())) {
          setUser(parsed);
          setLoading(false);
        }
      }
    } catch {
      // ignore
    }

    // Session restore from Supabase
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user?.email && ALLOWED_ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
          const adminUser: AdminUser = {
            id: session.user.id,
            email: session.user.email,
            role: 'admin',
          };
          setUser(adminUser);
          localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // Auth state listener from Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email && ALLOWED_ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
        const adminUser: AdminUser = {
          id: session.user.id,
          email: session.user.email,
          role: 'admin',
        };
        setUser(adminUser);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    // Block anyone except allowed admin emails
    if (!ALLOWED_ADMIN_EMAILS.includes(normalizedEmail)) {
      setLoading(false);
      return { success: false, error: 'Access denied.' };
    }

    // Direct password match for authorized administrator
    if (ADMIN_CREDENTIALS[normalizedEmail] && password === ADMIN_CREDENTIALS[normalizedEmail]) {
      const adminUser: AdminUser = {
        id: 'admin-' + normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_'),
        email: normalizedEmail,
        role: 'admin',
      };
      setUser(adminUser);
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));

      if (isSupabaseConfigured()) {
        try {
          await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: password,
          });
        } catch {
          // Keep successful direct login
        }
      }

      setLoading(false);
      return { success: true };
    }

    // Attempt Supabase sign in for configured accounts
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      if (error) {
        setLoading(false);
        return { success: false, error: 'Invalid email or password.' };
      }

      if (data.user) {
        const adminUser: AdminUser = {
          id: data.user.id,
          email: data.user.email!,
          role: 'admin',
        };
        setUser(adminUser);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
        setLoading(false);
        return { success: true };
      }

      setLoading(false);
      return { success: false, error: 'Login failed. Try again.' };
    } catch {
      setLoading(false);
      return { success: false, error: 'Invalid email or password.' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isSupabaseConnected: configured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm animate-pulse">Authenticating Admin Access...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
