import React, { createContext, useContext, useState } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  });

  const persist = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token); setUser(user);
  };

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    persist(data.token, data.user);
    return data.user;
  };

  const register = async (name, email, password, ward, district, city) => {
    const data = await authAPI.register(name, email, password, ward, district, city);
    persist(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(""); setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      token, user, isAdmin: user?.role === "admin",
      adminLevel: user?.adminLevel || 0,
      isLoggedIn: !!token, login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);