import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserCheck, UserX, FolderKanban, Search, Download, Filter,
  AlertCircle, BarChart3, GraduationCap, Clock,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import AnimatedCard from "@/components/AnimatedCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

interface SectionStudent {
  id: string;
  name: string;
  registration_number: string | null;
  project: { title: string; status: string } | null;
  facultyName: string | null;
}

interface FacultyInfo {
  id: string;
  name: string;
  department: string | null;
  max_students: number;
  assignedCount: number;
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  assigned: "default",
  request_sent: "secondary",
  completed: "outline",
  draft: "destructive",
};

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<SectionStudent[]>([]);
  const [faculty, setFaculty] = useState<FacultyInfo[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [coordSection, setCoordSection] = useState<{ department: string; section: string } | null>(null);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    // Get coordinator's assigned sections
    const { data: sections } = await supabase
      .from("coordinator_sections")
      .select("department, section")
      .eq("coordinator_id", user.id);

    if (!sections || sections.length === 0) {
      setLoading(false);
      return;
    }

    const sec = sections[0];
    setCoordSection(sec);

    const { data: studentData } = await supabase
      .from("users")
      .select("id, name, registration_number, section, department")
      .eq("role", "student")
      .eq("department", sec.department)
      .eq("section", sec.section);

    const studentList = studentData || [];

    const enriched: SectionStudent[] = await Promise.all(
      studentList.map(async (s) => {
        const { data: projects } = await supabase
          .from("projects")
          .select("title, status")
          .eq("student_id", s.id)
          .order("created_at", { ascending: false })
          .limit(1);

        let facultyName: string | null = null;
        if (projects && projects.length > 0 && projects[0].status === "assigned") {
          const { data: assignment } = await supabase
            .from("assignments")
            .select("faculty:users!assignments_faculty_id_fkey(name)")
            .eq("student_id", s.id)
            .limit(1)
            .single();
          facultyName = (assignment as any)?.faculty?.name || null;
        }

        return {
          id: s.id,
          name: s.name,
          registration_number: s.registration_number,
          project: projects && projects.length > 0 ? projects[0] : null,
          facultyName,
        };
      })
    );

    setStudents(enriched);

    const { data: facultyData } = await supabase
      .from("users")
      .select("id, name, department, max_students")
      .eq("role", "faculty")
      .eq("department", sec.department);

    const facultyList = await Promise.all(
      (facultyData || []).map(async (f) => {
        const { count } = await supabase
          .from("assignments")
          .select("id", { count: "exact", head: true })
          .eq("faculty_id", f.id);
        return { ...f, max_students: f.max_students || 5, assignedCount: count || 0 };
      })
    );
    setFaculty(facultyList);

    const { count: pendCount } = await supabase
      .from("guide_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    setPendingRequests(pendCount || 0);

    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('coordinator-dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'assignments' }, () => {
        toast({ title: "📋 New Assignment", description: "A project assignment has been updated." });
        fetchAll();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'guide_requests' }, () => {
        fetchAll();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchAll]);

  const withGuide = students.filter((s) => s.facultyName !== null).length;
  const withoutGuide = students.length - withGuide;
  const projectCount = students.filter((s) => s.project !== null).length;

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.registration_number || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.project?.title || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "unassigned" && !s.facultyName) ||
        (statusFilter === "assigned" && s.facultyName) ||
        s.project?.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, students]);

  const handleExport = () => {
    const csv = [
      "Name,Registration,Project,Faculty,Status",
      ...students.map(s =>
        `"${s.name}","${s.registration_number || ""}","${s.project?.title || "No Project"}","${s.facultyName || "Unassigned"}","${s.project?.status || "No Project"}"`
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
      <DashboardHeader title="Coordinator Dashboard" description={coordSection ? `${coordSection.department} — Section ${coordSection.section}` : "Manage your section's students and faculty assignments."} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} title="Total Students" value={students.length} subtitle={coordSection ? `Section ${coordSection.section}` : ""} delay={0} />
        <StatCard icon={UserX} title="Without Guide" value={withoutGuide} subtitle="Need assignment" delay={0.1} trend={withoutGuide > 0 ? { value: `${withoutGuide}`, positive: false } : undefined} />
        <StatCard icon={UserCheck} title="With Guide" value={withGuide} subtitle="Assigned faculty" delay={0.2} trend={students.length > 0 ? { value: `${Math.round((withGuide / students.length) * 100)}%`, positive: true } : undefined} />
        <StatCard icon={Clock} title="Pending Requests" value={pendingRequests} subtitle="Awaiting faculty action" delay={0.3} />
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="bg-muted/50 backdrop-blur-sm">
          <TabsTrigger value="students" className="data-[state=active]:bg-background">
            <GraduationCap className="h-4 w-4 mr-2" /> Student List
          </TabsTrigger>
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">
            <BarChart3 className="h-4 w-4 mr-2" /> Faculty Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
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
                        <td className="px-4 py-3 whitespace-nowrap">{s.project?.title || <span className="text-muted-foreground">No project</span>}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {s.facultyName || (
                            <span className="text-destructive text-xs font-medium flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant[s.project?.status || "draft"] || "outline"}>
                            {s.project?.status || "No project"}
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
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-3 gap-4">
            {faculty.map((f, i) => (
              <AnimatedCard key={f.id} delay={i * 0.08}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="gradient-primary rounded-full h-10 w-10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold">{f.name}</h4>
                    <p className="text-xs text-muted-foreground">{f.department}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Capacity</span>
                    <span>{f.assignedCount} / {f.max_students}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div className="h-full rounded-full gradient-primary" initial={{ width: 0 }} whileInView={{ width: `${(f.assignedCount / f.max_students) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{f.max_students - f.assignedCount} slots available</p>
                </div>
              </AnimatedCard>
            ))}
            {faculty.length === 0 && (
              <p className="text-center py-10 text-muted-foreground text-sm col-span-3">No faculty found in your department.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoordinatorDashboard;
