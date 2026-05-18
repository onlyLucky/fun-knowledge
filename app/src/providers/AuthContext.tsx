import { createContext, useState, ReactNode } from 'react';

export interface AuthUser {
  name: string;
  email?: string;
  phone?: string;
  loginType: 'email' | 'phone' | 'wechat' | 'apple';
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (userData: AuthUser, token: string) => {
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    localStorage.setItem('access_token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

