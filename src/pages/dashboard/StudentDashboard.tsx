import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, Send, CheckCircle, FolderKanban, Users } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import AnimatedCard from "@/components/AnimatedCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

const quickActions = [
  { label: "View Faculty", icon: Users, path: "/dashboard/faculty", color: "from-primary to-primary/70" },
  { label: "Create Project", icon: FolderKanban, path: "/dashboard/projects/create", color: "from-secondary to-secondary/70" },
  { label: "Send Request", icon: Send, path: "/dashboard/requests/send", color: "from-accent to-accent/70" },
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, requestsSent: 0, accepted: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [assignedFaculty, setAssignedFaculty] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [projectsRes, requestsRes, assignmentRes] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact" }).eq("student_id", user.id),
        supabase.from("guide_requests").select("id, status").eq("student_id", user.id),
        supabase.from("assignments").select("faculty_id, users!assignments_faculty_id_fkey(name)").eq("student_id", user.id).maybeSingle(),
      ]);

      const requests = requestsRes.data || [];
      setStats({
        projects: projectsRes.count || 0,
        requestsSent: requests.length,
        accepted: requests.filter((r) => r.status === "accepted").length,
        pending: requests.filter((r) => r.status === "pending").length,
      });

      if (assignmentRes.data) {
        const faculty = assignmentRes.data.users as any;
        setAssignedFaculty(faculty?.name || null);
      }
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <DashboardHeader title="Student Dashboard" description="Track your academic progress and connect with mentors." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FolderKanban} title="Total Projects" value={stats.projects} subtitle="Your projects" delay={0} />
        <StatCard icon={Send} title="Requests Sent" value={stats.requestsSent} subtitle="Total requests" delay={0.1} />
        <StatCard icon={CheckCircle} title="Accepted" value={stats.accepted} subtitle={stats.requestsSent > 0 ? `${Math.round((stats.accepted / stats.requestsSent) * 100)}% rate` : "No requests yet"} delay={0.2} trend={stats.accepted > 0 ? { value: `${stats.accepted}`, positive: true } : undefined} />
        <StatCard icon={Clock} title="Pending" value={stats.pending} subtitle="Awaiting response" delay={0.3} />
      </div>

      {assignedFaculty && (
        <AnimatedCard className="mb-6">
          <div className="flex items-center gap-3">
            <div className="gradient-primary rounded-lg p-2">
              <CheckCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display font-semibold">Assigned Guide</p>
              <p className="text-sm text-muted-foreground">{assignedFaculty}</p>
            </div>
          </div>
        </AnimatedCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            whileHover={{ y: -4, boxShadow: "0 20px 60px hsla(239,84%,67%,0.12)" }}
            onClick={() => navigate(action.path)}
            className="glass rounded-xl p-5 flex items-center gap-4 text-left transition-colors"
          >
            <div className={`bg-gradient-to-br ${action.color} rounded-xl p-3`}>
              <action.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm">{action.label}</p>
              <p className="text-xs text-muted-foreground">Quick access</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
