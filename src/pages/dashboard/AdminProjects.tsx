import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FolderKanban, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnimatedCard from "@/components/AnimatedCard";
import DashboardHeader from "@/components/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

interface ProjectRow {
  id: string;
  title: string;
  domain: string | null;
  status: string;
  created_at: string;
  student: { name: string } | null;
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  assigned: "default",
  request_sent: "secondary",
  completed: "outline",
  draft: "destructive",
};

const AdminProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, title, domain, status, created_at, student:users!projects_student_id_fkey(name)")
        .order("created_at", { ascending: false });
      setProjects((data as any) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || (p.student?.name || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, projects]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <DashboardHeader title="All Projects" description="System-wide project monitoring." />
      <AnimatedCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search projects or students…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="request_sent">Request Sent</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-left">
                {["Project Title", "Student", "Domain", "Status", "Created"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.student?.name || "—"}</td>
                  <td className="px-4 py-3">{p.domain || "—"}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant[p.status] || "outline"}>{p.status}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No projects found.</div>}
        </div>
        <p className="text-xs text-muted-foreground mt-3">{filtered.length} project{filtered.length !== 1 ? "s" : ""}</p>
      </AnimatedCard>
    </div>
  );
};

export default AdminProjects;
