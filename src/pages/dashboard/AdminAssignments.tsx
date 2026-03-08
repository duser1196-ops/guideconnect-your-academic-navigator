import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AnimatedCard from "@/components/AnimatedCard";
import DashboardHeader from "@/components/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

interface AssignmentRow {
  id: string;
  created_at: string;
  student: { name: string } | null;
  faculty: { name: string } | null;
  project: { title: string; status: string } | null;
}

const AdminAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("assignments")
        .select("id, created_at, student:users!assignments_student_id_fkey(name), faculty:users!assignments_faculty_id_fkey(name), project:projects!assignments_project_id_fkey(title, status)")
        .order("created_at", { ascending: false });
      setAssignments((data as any) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const text = `${a.student?.name || ""} ${a.faculty?.name || ""} ${a.project?.title || ""}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [search, assignments]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <DashboardHeader title="All Assignments" description="Faculty-student assignment records." />
      <AnimatedCard>
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-left">
                {["Student", "Faculty", "Project", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <motion.tr key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{a.student?.name || "—"}</td>
                  <td className="px-4 py-3">{a.faculty?.name || "—"}</td>
                  <td className="px-4 py-3">{a.project?.title || "—"}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{a.project?.status || "—"}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(a.created_at).toLocaleDateString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No assignments found.</div>}
        </div>
        <p className="text-xs text-muted-foreground mt-3">{filtered.length} assignment{filtered.length !== 1 ? "s" : ""}</p>
      </AnimatedCard>
    </div>
  );
};

export default AdminAssignments;
