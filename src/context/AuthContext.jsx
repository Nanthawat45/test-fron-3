import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import UserService from "../service/userService";

// ----- Context + Hook -----
export const AuthContext = createContext(null);
export const useAuthContext = () => useContext(AuthContext);

// ----- Provider -----
function AuthProvider({ children }) {   // ⬅️ ไม่ export ที่นี่
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await UserService.getUserProfile();
      setUser(res?.data ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshProfile(); }, [refreshProfile]);

  const login = useCallback(async (payload) => {
    await UserService.loginUser(payload);
    await refreshProfile();
  }, [refreshProfile]);

  const logout = useCallback(async () => {
    try { await UserService.logoutUser(); } finally { setUser(null); }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;   
export { AuthProvider };      