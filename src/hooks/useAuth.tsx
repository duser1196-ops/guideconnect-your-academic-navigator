import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AuthRole = "student" | "faculty" | "coordinator" | "admin";

export interface AuthUser {
  id: string;
  authId: string;
  email: string;
  name: string;
  role: AuthRole;
}

export interface StudentRegisterData {
  name: string;
  email: string;
  password: string;
  department: string;
  registration_number: string;
  section: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: StudentRegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: "",
  login: async () => false,
  register: async () => false,
  logout: async () => {},
});

export const roleRedirects: Record<AuthRole, string> = {
  student: "/dashboard",
  faculty: "/dashboard",
  coordinator: "/dashboard",
  admin: "/dashboard",
};

async function fetchUserProfile(authId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, auth_id, email, name, role")
    .eq("auth_id", authId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    authId: data.auth_id!,
    email: data.email,
    name: data.name,
    role: data.role as AuthRole,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            setUser(profile);
            setLoading(false);
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return false;
    }

    if (data.user) {
      const profile = await fetchUserProfile(data.user.id);
      if (!profile) {
        setError("User profile not found. Contact administrator.");
        await supabase.auth.signOut();
        return false;
      }
      setUser(profile);
      return true;
    }

    return false;
  };

  const register = async (data: StudentRegisterData): Promise<boolean> => {
    setError("");

    // Sign up with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return false;
    }

    if (authData.user) {
      // Insert user profile
      const { error: insertError } = await supabase.from("users").insert({
        auth_id: authData.user.id,
        email: data.email,
        name: data.name,
        role: "student" as const,
        department: data.department,
        registration_number: data.registration_number,
        section: data.section,
      });

      if (insertError) {
        setError("Registration failed: " + insertError.message);
        return false;
      }

      const profile = await fetchUserProfile(authData.user.id);
      setUser(profile);
      return true;
    }

    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setError("");
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
