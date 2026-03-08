import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Shield, UserPlus, Settings, FolderKanban, GraduationCap,
  FileText, ClipboardList, AlertCircle, BarChart3, PieChart,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend } from "recharts";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import AnimatedCard from "@/components/AnimatedCard";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
  "#6366f1",
  "#f59e0b",
  "#10b981",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  accepted: "#10b981",
  rejected: "#ef4444",
  cancelled: "#94a3b8",
};

interface FacultyLoad { name: string; assigned: number; max: number; }
interface UnassignedStudent { id: string; name: string; projectTitle: string; department: string | null; }

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, faculty: 0, coordinators: 0, projects: 0, assignments: 0, pendingRequests: 0, totalRequests: 0 });
  const [facultyLoad, setFacultyLoad] = useState<FacultyLoad[]>([]);
  const [domainData, setDomainData] = useState<{ name: string; value: number }[]>([]);
  const [requestStatus, setRequestStatus] = useState<{ name: string; value: number }[]>([]);
  const [unassigned, setUnassigned] = useState<UnassignedStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      // Stats
      const [studentsR, facultyR, coordR, projectsR, assignR, pendR, allReqR] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "faculty"),
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "coordinator"),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("assignments").select("id", { count: "exact", head: true }),
        supabase.from("guide_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("guide_requests").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        students: studentsR.count || 0,
        faculty: facultyR.count || 0,
        coordinators: coordR.count || 0,
        projects: projectsR.count || 0,
        assignments: assignR.count || 0,
        pendingRequests: pendR.count || 0,
        totalRequests: allReqR.count || 0,
      });

      // Faculty load
      const { data: facData } = await supabase.from("users").select("id, name, max_students").eq("role", "faculty");
      const loadData: FacultyLoad[] = await Promise.all(
        (facData || []).map(async (f) => {
          const { count } = await supabase.from("assignments").select("id", { count: "exact", head: true }).eq("faculty_id", f.id);
          return { name: f.name, assigned: count || 0, max: f.max_students || 5 };
        })
      );
      setFacultyLoad(loadData.sort((a, b) => b.assigned - a.assigned));

      // Domain distribution
      const { data: projData } = await supabase.from("projects").select("domain");
      const domainMap: Record<string, number> = {};
      (projData || []).forEach((p) => {
        const d = p.domain || "Unspecified";
        domainMap[d] = (domainMap[d] || 0) + 1;
      });
      setDomainData(Object.entries(domainMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));

      // Request status distribution
      const { data: reqData } = await supabase.from("guide_requests").select("status");
      const statusMap: Record<string, number> = { pending: 0, accepted: 0, rejected: 0, cancelled: 0 };
      (reqData || []).forEach((r) => { statusMap[r.status] = (statusMap[r.status] || 0) + 1; });
      setRequestStatus(Object.entries(statusMap).map(([name, value]) => ({ name, value })));

      // Unassigned students (have project but no assignment)
      const { data: allStudents } = await supabase.from("users").select("id, name, department").eq("role", "student");
      const unassignedList: UnassignedStudent[] = [];
      for (const s of allStudents || []) {
        const { data: proj } = await supabase.from("projects").select("id, title, status").eq("student_id", s.id).in("status", ["draft", "request_sent"]).limit(1);
        if (proj && proj.length > 0) {
          const { count } = await supabase.from("assignments").select("id", { count: "exact", head: true }).eq("student_id", s.id);
          if (!count || count === 0) {
            unassignedList.push({ id: s.id, name: s.name, projectTitle: proj[0].title, department: s.department });
          }
        }
      }
      setUnassigned(unassignedList);
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <DashboardHeader title="Admin Dashboard" description="Platform analytics and system management." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard icon={GraduationCap} title="Students" value={stats.students} delay={0} />
        <StatCard icon={UserPlus} title="Faculty" value={stats.faculty} delay={0.05} />
        <StatCard icon={Shield} title="Coordinators" value={stats.coordinators} delay={0.1} />
        <StatCard icon={FolderKanban} title="Projects" value={stats.projects} delay={0.15} />
        <StatCard icon={ClipboardList} title="Assignments" value={stats.assignments} delay={0.2} />
        <StatCard icon={FileText} title="Requests" value={stats.totalRequests} subtitle={`${stats.pendingRequests} pending`} delay={0.25} />
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="bg-muted/50 backdrop-blur-sm">
          <TabsTrigger value="analytics" className="data-[state=active]:bg-background">
            <BarChart3 className="h-4 w-4 mr-2" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="unassigned" className="data-[state=active]:bg-background">
            <AlertCircle className="h-4 w-4 mr-2" /> Unassigned ({unassigned.length})
          </TabsTrigger>
          <TabsTrigger value="actions" className="data-[state=active]:bg-background">
            <Settings className="h-4 w-4 mr-2" /> Quick Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Faculty Load */}
          <AnimatedCard>
            <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Faculty Load Analysis
            </h3>
            {facultyLoad.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={facultyLoad} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                    formatter={(value: number, name: string) => [value, name === "assigned" ? "Assigned" : "Max Capacity"]}
                  />
                  <Bar dataKey="assigned" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="assigned" />
                  <Bar dataKey="max" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} name="max" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No faculty data available.</p>
            )}
          </AnimatedCard>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Domain Distribution */}
            <AnimatedCard delay={0.1}>
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" /> Project Domain Distribution
              </h3>
              {domainData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPie>
                    <Pie data={domainData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                      {domainData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">No project data available.</p>
              )}
            </AnimatedCard>

            {/* Request Status */}
            <AnimatedCard delay={0.15}>
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Request Status Distribution
              </h3>
              {requestStatus.some((s) => s.value > 0) ? (
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPie>
                    <Pie data={requestStatus} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {requestStatus.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">No request data available.</p>
              )}
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="unassigned">
          <AnimatedCard>
            <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" /> Students Without Faculty Guide
            </h3>
            {unassigned.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 text-left">
                      {["Student Name", "Project Title", "Department", "Status"].map((h) => (
                        <th key={h} className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {unassigned.map((s) => (
                      <tr key={s.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{s.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{s.projectTitle}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{s.department || "—"}</td>
                        <td className="px-4 py-3">
                          <Badge variant="destructive" className="text-xs">Unassigned</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">All students with projects have been assigned a faculty guide. 🎉</p>
            )}
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="actions">
          <AnimatedCard>
            <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Add Faculty", icon: UserPlus, href: "/dashboard/admin/add-faculty" },
                { label: "Add Coordinator", icon: Shield, href: "/dashboard/admin/add-coordinator" },
                { label: "Manage Users", icon: Users, href: "/dashboard/admin/users" },
                { label: "View Projects", icon: FolderKanban, href: "/dashboard/admin/projects" },
              ].map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer"
                >
                  <div className="gradient-primary rounded-lg p-2">
                    <item.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.a>
              ))}
            </div>
          </AnimatedCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;