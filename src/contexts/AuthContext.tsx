import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AuthUser } from '../types';
import { CREDENTIALS } from '../data/credentials';

interface AuthContextType {
  user: AuthUser | null;
  login: (usuario: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('cal_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((usuario: string, password: string): boolean => {
    const cred = CREDENTIALS.find(c => c.usuario === usuario.toLowerCase());
    if (!cred || cred.password !== password) return false;

    const authUser: AuthUser = {
      usuario: cred.usuario,
      equipo: cred.equipo,
      role: cred.usuario === 'admin' || cred.usuario === 'direccion' ? 'admin' : 'team',
      isAdmin: cred.usuario === 'admin' || cred.usuario === 'direccion',
    };

    setUser(authUser);
    localStorage.setItem('cal_user', JSON.stringify(authUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cal_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.isAdmin ?? false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
