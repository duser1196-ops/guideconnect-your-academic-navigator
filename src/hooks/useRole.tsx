import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "student" | "faculty" | "coordinator";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType>({ role: "student", setRole: () => {} });

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>("student");
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
};

export const useRole = () => useContext(RoleContext);
