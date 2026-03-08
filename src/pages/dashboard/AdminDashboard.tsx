import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Shield, UserPlus, Activity, Settings, FolderKanban, GraduationCap, FileText, ClipboardList } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import AnimatedCard from "@/components/AnimatedCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, faculty: 0, coordinators: 0, projects: 0, assignments: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [students, faculty, coordinators, projects, assignments, pending] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "faculty"),
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "coordinator"),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("assignments").select("id", { count: "exact", head: true }),
        supabase.from("guide_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setStats({
        students: students.count || 0,
        faculty: faculty.count || 0,
        coordinators: coordinators.count || 0,
        projects: projects.count || 0,
        assignments: assignments.count || 0,
        pendingRequests: pending.count || 0,
      });
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <DashboardHeader title="Admin Dashboard" description="System management and user administration." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={GraduationCap} title="Total Students" value={stats.students} subtitle="Registered students" delay={0} />
        <StatCard icon={UserPlus} title="Total Faculty" value={stats.faculty} subtitle="Active faculty" delay={0.1} />
        <StatCard icon={Shield} title="Total Coordinators" value={stats.coordinators} subtitle="Section coordinators" delay={0.2} />
        <StatCard icon={FolderKanban} title="Total Projects" value={stats.projects} subtitle="All projects" delay={0.3} />
        <StatCard icon={ClipboardList} title="Assignments" value={stats.assignments} subtitle="Faculty-student pairs" delay={0.4} />
        <StatCard icon={FileText} title="Pending Requests" value={stats.pendingRequests} subtitle="Awaiting faculty action" delay={0.5} />
      </div>

      <AnimatedCard delay={0.1}>
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
              transition={{ delay: 0.4 + i * 0.08 }}
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
    </div>
  );
};

export default AdminDashboard;
