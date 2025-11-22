import { useState, useEffect } from 'react';
import { onAuthChange, signInWithGoogle as firebaseSignInWithGoogle, signOut as firebaseSignOut, getUserRoleByEmail, getUserRole } from '@/lib/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user' | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const init = async () => {
      try {
        unsub = onAuthChange(async (fbUser) => {
          if (fbUser) {
            const email = fbUser.email || '';
            let role = await getUserRole(fbUser.uid);
            if (!role) {
              role = (await getUserRoleByEmail(fbUser.email || undefined)) || 'user';
            }
            const userData: User = {
              id: fbUser.uid,
              name: fbUser.displayName || email.split('@')[0] || 'User',
              email: email,
              role: role as 'admin' | 'user' | null,
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            setLoading(false);
          } else {
            // try restore from local storage
            const stored = localStorage.getItem('user');
            if (stored) {
              try {
                setUser(JSON.parse(stored));
              } catch (e) {
                setUser(null);
              }
            } else {
              setUser(null);
            }
            setLoading(false);
          }
        });
      } catch (e) {
        console.error('Auth init error:', e);
        setLoading(false);
      }
    };

    init();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await firebaseSignInWithGoogle();
    } catch (e) {
      console.error('Google sign-in error:', e);
      throw e;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut();
      setUser(null);
      localStorage.removeItem('user');
      window.location.href = '/';
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    logout,
    signInWithGoogle,
  };
}


