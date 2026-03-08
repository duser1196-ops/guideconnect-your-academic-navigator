import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, Ban, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnimatedCard from "@/components/AnimatedCard";
import DashboardHeader from "@/components/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserRow {
  id: string;
  auth_id: string | null;
  name: string;
  email: string;
  role: string;
  department: string | null;
  created_at: string;
}

const roleBadge: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  student: "default", faculty: "secondary", coordinator: "outline", admin: "destructive",
};

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("users")
      .select("id, auth_id, name, email, role, department, created_at")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchUsers(); }, [user]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [search, roleFilter, users]);

  const handleDeactivate = async (targetUser: UserRow) => {
    if (!targetUser.auth_id) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Use edge function to deactivate (ban) user
      const res = await supabase.functions.invoke("admin-create-user", {
        body: { action: "deactivate", target_auth_id: targetUser.auth_id },
      });

      if (res.error || res.data?.error) {
        throw new Error(res.data?.error || res.error?.message || "Failed to deactivate user");
      }

      toast({ title: "User Deactivated", description: `${targetUser.name} has been deactivated.` });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <DashboardHeader title="User Management" description="View and manage all system users." />

      <AnimatedCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="faculty">Faculty</SelectItem>
              <SelectItem value="coordinator">Coordinators</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-left">
                {["Name", "Email", "Role", "Department", "Joined", "Actions"].map((h) => (
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
                  transition={{ delay: i * 0.03 }}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant={roleBadge[u.role] || "outline"}>{u.role}</Badge></td>
                  <td className="px-4 py-3">{u.department || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {u.role !== "admin" && u.auth_id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-xs text-destructive gap-1">
                            <Ban className="h-3 w-3" /> Deactivate
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deactivate {u.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will prevent the user from logging in. This action can be reversed later.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeactivate(u)} className="bg-destructive text-destructive-foreground">
                              Deactivate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">No users found.</div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-3">{filtered.length} user{filtered.length !== 1 ? "s" : ""} found</p>
      </AnimatedCard>
    </div>
  );
};

export default AdminUsers;
