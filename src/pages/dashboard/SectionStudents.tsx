import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Download, Filter, AlertCircle } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import AnimatedCard from "@/components/AnimatedCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

interface SectionStudent {
  id: string;
  name: string;
  registration_number: string | null;
  projectTitle: string | null;
  projectStatus: string | null;
  facultyName: string | null;
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  assigned: "default",
  request_sent: "secondary",
  completed: "outline",
  draft: "destructive",
};

const SectionStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<SectionStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: sections } = await supabase
        .from("coordinator_sections")
        .select("department, section")
        .eq("coordinator_id", user.id);

      if (!sections || sections.length === 0) { setLoading(false); return; }
      const sec = sections[0];

      const { data: studentData } = await supabase
        .from("users")
        .select("id, name, registration_number")
        .eq("role", "student")
        .eq("department", sec.department)
        .eq("section", sec.section);

      const enriched: SectionStudent[] = await Promise.all(
        (studentData || []).map(async (s) => {
          const { data: projects } = await supabase
            .from("projects")
            .select("title, status")
            .eq("student_id", s.id)
            .order("created_at", { ascending: false })
            .limit(1);

          let facultyName: string | null = null;
          const proj = projects && projects.length > 0 ? projects[0] : null;
          if (proj?.status === "assigned") {
            const { data: asg } = await supabase
              .from("assignments")
              .select("faculty:users!assignments_faculty_id_fkey(name)")
              .eq("student_id", s.id)
              .limit(1)
              .single();
            facultyName = (asg as any)?.faculty?.name || null;
          }

          return {
            id: s.id,
            name: s.name,
            registration_number: s.registration_number,
            projectTitle: proj?.title || null,
            projectStatus: proj?.status || null,
            facultyName,
          };
        })
      );

      setStudents(enriched);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.registration_number || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.projectTitle || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "unassigned" && !s.facultyName) ||
        (statusFilter === "assigned" && s.facultyName) ||
        s.projectStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, students]);

  const handleExport = () => {
    const csv = [
      "Name,Registration,Project,Faculty,Status",
      ...students.map(s =>
        `"${s.name}","${s.registration_number || ""}","${s.projectTitle || "No Project"}","${s.facultyName || "Unassigned"}","${s.projectStatus || "N/A"}"`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "section-students.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export Complete", description: "CSV file downloaded." });
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <DashboardHeader title="Section Students" description="View and monitor students in your assigned section." />

      <AnimatedCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, registration, or project…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unassigned">Without Guide</SelectItem>
              <SelectItem value="assigned">With Guide</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="request_sent">Request Sent</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-left">
                {["Student Name", "Reg. Number", "Project Title", "Assigned Faculty", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((s, i) => (
                  <motion.tr key={s.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, delay: i * 0.03 }} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{s.registration_number || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{s.projectTitle || <span className="text-muted-foreground">No project</span>}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {s.facultyName || (
                        <span className="text-destructive text-xs font-medium flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[s.projectStatus || "draft"] || "outline"}>
                        {s.projectStatus || "No project"}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">No students match your search.</div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default SectionStudents;
