import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export type AuthRole = "student" | "faculty" | "coordinator" | "admin";

export interface AuthUser {
  email: string;
  name: string;
  role: AuthRole;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => boolean;
  register: (data: StudentRegisterData) => boolean;
  logout: () => void;
}

export interface StudentRegisterData {
  name: string;
  email: string;
  password: string;
  department: string;
  rollNumber: string;
  year: string;
  section: string;
  projectType: string;
}

const dummyAccounts: { email: string; password: string; name: string; role: AuthRole }[] = [
  { email: "student@test.com", password: "123456", name: "Alex Johnson", role: "student" },
  { email: "faculty@test.com", password: "123456", name: "Dr. Sarah Chen", role: "faculty" },
  { email: "coordinator@test.com", password: "123456", name: "Prof. Williams", role: "coordinator" },
  { email: "admin@test.com", password: "123456", name: "System Admin", role: "admin" },
];

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: "",
  login: () => false,
  register: () => false,
  logout: () => {},
});

export const roleRedirects: Record<AuthRole, string> = {
  student: "/dashboard",
  faculty: "/dashboard",
  coordinator: "/dashboard",
  admin: "/dashboard",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("guideconnect_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    setError("");
    const account = dummyAccounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!account) {
      setError("Invalid email or password");
      return false;
    }
    const authUser: AuthUser = {
      email: account.email,
      name: account.name,
      role: account.role,
      token: `dummy-token-${Date.now()}`,
    };
    setUser(authUser);
    localStorage.setItem("guideconnect_user", JSON.stringify(authUser));
    return true;
  };

  const register = (data: StudentRegisterData): boolean => {
    setError("");
    if (dummyAccounts.find((a) => a.email.toLowerCase() === data.email.toLowerCase())) {
      setError("Email already registered");
      return false;
    }
    const authUser: AuthUser = {
      email: data.email,
      name: data.name,
      role: "student",
      token: `dummy-token-${Date.now()}`,
    };
    dummyAccounts.push({ email: data.email, password: data.password, name: data.name, role: "student" });
    setUser(authUser);
    localStorage.setItem("guideconnect_user", JSON.stringify(authUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    setError("");
    localStorage.removeItem("guideconnect_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
