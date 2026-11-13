import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'timo-auth-user';

function readUser() {
  try {
    const value = localStorage.getItem(AUTH_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const value = useMemo(() => ({
    user,
    loginWithTestAccount(id, password) {
      // Portfolio demo only: credentials are checked in the browser. Real apps
      // must authenticate through a trusted server and must not ship secrets.
      if (id !== 'test1234' || password !== 'test1234@') return false;
      const testUser = {
        id: 'test1234',
        nickname: 'TIMO 테스트 유저',
        method: '테스트 계정'
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(testUser));
      setUser(testUser);
      return true;
    },
    logout() {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    }
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
