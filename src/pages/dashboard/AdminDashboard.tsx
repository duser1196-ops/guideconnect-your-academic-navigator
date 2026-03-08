import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Shield, UserPlus, Settings, FolderKanban, GraduationCap,
  FileText, ClipboardList, AlertCircle, BarChart3, PieChart, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend, RadialBarChart, RadialBar,
  AreaChart, Area,
} from "recharts";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

const MODERN_COLORS = [
  "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd",
  "#818cf8", "#7c3aed", "#6d28d9", "#5b21b6",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  accepted: "#10b981",
  rejected: "#ef4444",
  cancelled: "#94a3b8",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

interface FacultyLoad { name: string; assigned: number; max: number; fill: string; }
interface UnassignedStudent { id: string; name: string; projectTitle: string; department: string | null; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-muted-foreground">{p.name || p.dataKey}:</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl px-4 py-3 shadow-xl">
      <div className="flex items-center gap-2 text-xs">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.payload.fill }} />
        <span className="font-semibold text-foreground">{d.name}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {d.value} project{d.value !== 1 ? "s" : ""} ({((d.percent || 0) * 100).toFixed(0)}%)
      </p>
    </div>
  );
};

const ChartCard = ({ children, title, icon: Icon, delay = 0 }: { children: React.ReactNode; title: string; icon: typeof BarChart3; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    className="rounded-2xl border border-border/40 bg-background/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
  >
    <div className="flex items-center gap-2.5 mb-5">
      <div className="gradient-primary rounded-xl p-2 shadow-sm">
        <Icon className="h-4 w-4 text-primary-foreground" />
      </div>
      <h3 className="font-display font-semibold text-base">{title}</h3>
    </div>
    {children}
  </motion.div>
);

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

      const { data: facData } = await supabase.from("users").select("id, name, max_students").eq("role", "faculty");
      const loadData: FacultyLoad[] = await Promise.all(
        (facData || []).map(async (f, i) => {
          const { count } = await supabase.from("assignments").select("id", { count: "exact", head: true }).eq("faculty_id", f.id);
          return { name: f.name, assigned: count || 0, max: f.max_students || 5, fill: MODERN_COLORS[i % MODERN_COLORS.length] };
        })
      );
      setFacultyLoad(loadData.sort((a, b) => b.assigned - a.assigned));

      const { data: projData } = await supabase.from("projects").select("domain");
      const domainMap: Record<string, number> = {};
      (projData || []).forEach((p) => { const d = p.domain || "Unspecified"; domainMap[d] = (domainMap[d] || 0) + 1; });
      setDomainData(Object.entries(domainMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));

      const { data: reqData } = await supabase.from("guide_requests").select("status");
      const statusMap: Record<string, number> = { pending: 0, accepted: 0, rejected: 0, cancelled: 0 };
      (reqData || []).forEach((r) => { statusMap[r.status] = (statusMap[r.status] || 0) + 1; });
      setRequestStatus(Object.entries(statusMap).map(([name, value]) => ({ name, value })));

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

  const assignmentRate = stats.projects > 0 ? Math.round((stats.assignments / stats.projects) * 100) : 0;

  return (
    <div>
      <DashboardHeader title="Admin Dashboard" description="Platform analytics and system management." />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <StatCard icon={GraduationCap} title="Students" value={stats.students} delay={0} />
        <StatCard icon={UserPlus} title="Faculty" value={stats.faculty} delay={0.05} />
        <StatCard icon={Shield} title="Coordinators" value={stats.coordinators} delay={0.1} />
        <StatCard icon={FolderKanban} title="Projects" value={stats.projects} delay={0.15} />
        <StatCard icon={ClipboardList} title="Assignments" value={stats.assignments} delay={0.2} />
        <StatCard icon={FileText} title="Requests" value={stats.totalRequests} subtitle={`${stats.pendingRequests} pending`} delay={0.25} />
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="bg-muted/40 backdrop-blur-sm rounded-xl p-1 border border-border/30">
          <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4 mr-2" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="unassigned" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <AlertCircle className="h-4 w-4 mr-2" /> Unassigned ({unassigned.length})
          </TabsTrigger>
          <TabsTrigger value="actions" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Settings className="h-4 w-4 mr-2" /> Quick Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Faculty Load - Modern horizontal bar chart */}
          <ChartCard title="Faculty Load Analysis" icon={BarChart3} delay={0.1}>
            {facultyLoad.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(250, facultyLoad.length * 52)}>
                <BarChart data={facultyLoad} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }} barGap={4}>
                  <defs>
                    <linearGradient id="assignedGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="maxGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--muted))" />
                      <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.3, radius: 8 }} />
                  <Bar dataKey="assigned" fill="url(#assignedGrad)" radius={[0, 8, 8, 0]} name="Assigned" barSize={18} animationDuration={1200} animationEasing="ease-out" />
                  <Bar dataKey="max" fill="url(#maxGrad)" radius={[0, 8, 8, 0]} name="Capacity" barSize={18} animationDuration={1200} animationEasing="ease-out" />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, paddingBottom: 12 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No faculty data available.</p>
            )}
          </ChartCard>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Domain Distribution - Modern donut */}
            <ChartCard title="Project Domains" icon={PieChart} delay={0.2}>
              {domainData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <defs>
                      {domainData.map((_, i) => (
                        <linearGradient key={i} id={`domainGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={MODERN_COLORS[i % MODERN_COLORS.length]} />
                          <stop offset="100%" stopColor={MODERN_COLORS[i % MODERN_COLORS.length]} stopOpacity={0.7} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={domainData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={110}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={3}
                      cornerRadius={6}
                      animationDuration={1200}
                      animationEasing="ease-out"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                    >
                      {domainData.map((_, i) => (
                        <Cell key={i} fill={`url(#domainGrad${i})`} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">No project data available.</p>
              )}
            </ChartCard>

            {/* Request Status - Modern styled */}
            <ChartCard title="Request Status" icon={TrendingUp} delay={0.3}>
              {requestStatus.some((s) => s.value > 0) ? (
                <div>
                  <ResponsiveContainer width="100%" height={220}>
                    <RechartsPie>
                      <Pie
                        data={requestStatus.filter(s => s.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        dataKey="value"
                        stroke="none"
                        paddingAngle={4}
                        cornerRadius={6}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      >
                        {requestStatus.filter(s => s.value > 0).map((entry) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </RechartsPie>
                  </ResponsiveContainer>
                  {/* Custom legend */}
                  <div className="grid grid-cols-2 gap-2 mt-2 px-2">
                    {requestStatus.map((s) => (
                      <div key={s.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[s.name] }} />
                        <span className="text-xs text-muted-foreground">{STATUS_LABELS[s.name]}</span>
                        <span className="text-xs font-semibold text-foreground ml-auto">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">No request data available.</p>
              )}
            </ChartCard>
          </div>

          {/* Assignment Rate Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="rounded-2xl border border-border/40 bg-background/80 backdrop-blur-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-base flex items-center gap-2">
                <div className="gradient-primary rounded-xl p-2 shadow-sm">
                  <TrendingUp className="h-4 w-4 text-primary-foreground" />
                </div>
                Assignment Rate
              </h3>
              <span className="text-2xl font-bold font-display text-primary">{assignmentRate}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-muted/50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${assignmentRate}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.assignments} of {stats.projects} projects have faculty assignments
            </p>
          </motion.div>
        </TabsContent>

        <TabsContent value="unassigned">
          <ChartCard title="Students Without Faculty Guide" icon={AlertCircle}>
            {unassigned.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-border/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30">
                      {["Student Name", "Project Title", "Department", "Status"].map((h) => (
                        <th key={h} className="px-4 py-3 font-medium text-muted-foreground text-left whitespace-nowrap text-xs uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {unassigned.map((s, i) => (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-t border-border/30 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3.5 font-medium whitespace-nowrap">{s.name}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">{s.projectTitle}</td>
                        <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{s.department || "—"}</td>
                        <td className="px-4 py-3.5">
                          <Badge variant="destructive" className="text-[10px] uppercase tracking-wide">Unassigned</Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  <CheckCircle className="h-4 w-4" /> All students are assigned! 🎉
                </div>
              </div>
            )}
          </ChartCard>
        </TabsContent>

        <TabsContent value="actions">
          <ChartCard title="Quick Actions" icon={Settings}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Add Faculty", icon: UserPlus, href: "/dashboard/admin/add-faculty", color: "from-indigo-500 to-purple-500" },
                { label: "Add Coordinator", icon: Shield, href: "/dashboard/admin/add-coordinator", color: "from-emerald-500 to-teal-500" },
                { label: "Manage Users", icon: Users, href: "/dashboard/admin/users", color: "from-amber-500 to-orange-500" },
                { label: "View Projects", icon: FolderKanban, href: "/dashboard/admin/projects", color: "from-rose-500 to-pink-500" },
              ].map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border/40 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer bg-background/60"
                >
                  <div className={`bg-gradient-to-br ${item.color} rounded-xl p-3 shadow-sm`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold">{item.label}</span>
                </motion.a>
              ))}
            </div>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
