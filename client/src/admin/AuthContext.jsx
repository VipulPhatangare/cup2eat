import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { adm, setUnauthorizedHandler } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setAdmin(null)); // any 401 sends the person back to the login page
    adm.get('/auth/me').then((d) => setAdmin(d.admin)).catch(() => setAdmin(null)).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const d = await adm.post('/auth/login', { email, password });
    setAdmin(d.admin);
  }, []);

  const logout = useCallback(async () => {
    try { await adm.post('/auth/logout'); } catch { /* cookie is cleared server-side; either way we leave */ }
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({ admin, loading, login, logout, isOwner: admin?.role === 'owner' }), [admin, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
