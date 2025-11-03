"use client";
import { createContext, useState, useEffect, ReactNode } from "react";

interface UserData {
  id: number;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/dashboard", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.user) setUser(data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
