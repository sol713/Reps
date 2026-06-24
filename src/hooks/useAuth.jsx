import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { insforge } from "../lib/insforge.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    insforge.auth.getCurrentSession().then(({ data, error }) => {
      if (!isMounted) return;
      setUser(data?.session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await insforge.auth.signUp({ email, password });
    if (!error && data?.user) {
      setUser(data.user);
    }
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (!error && data?.user) {
      setUser(data.user);
    }
    return { data, error };
  };

  const signOut = async () => {
    await insforge.auth.signOut();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signUp,
      signIn,
      signOut,
      isAuthenticated: Boolean(user)
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
