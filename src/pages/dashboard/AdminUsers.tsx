import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Shield, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AnimatedCard from "@/components/AnimatedCard";
import DashboardHeader from "@/components/DashboardHeader";

const usersData = [
  { id: 1, name: "Alex Johnson", email: "student@test.com", role: "student", department: "CSE", status: "Active" },
  { id: 2, name: "Dr. Sarah Chen", email: "faculty@test.com", role: "faculty", department: "CSE", status: "Active" },
  { id: 3, name: "Prof. Williams", email: "coordinator@test.com", role: "coordinator", department: "Engineering", status: "Active" },
  { id: 4, name: "Maria Garcia", email: "maria@test.com", role: "student", department: "ECE", status: "Active" },
  { id: 5, name: "Dr. Ramesh Kumar", email: "ramesh@test.com", role: "faculty", department: "CSE", status: "Active" },
  { id: 6, name: "James Lee", email: "james@test.com", role: "student", department: "CSE", status: "Inactive" },
];

const roleBadge: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  student: "default", faculty: "secondary", coordinator: "outline", admin: "destructive",
};

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const filtered = usersData.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <DashboardHeader title="User Management" description="View and manage all system users." />

      <AnimatedCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-left">
                {["Name", "Email", "Role", "Department", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant={roleBadge[u.role]}>{u.role}</Badge></td>
                  <td className="px-4 py-3">{u.department}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${u.status === "Active" ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                      {u.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default AdminUsers;
