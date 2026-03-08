import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, Send, CheckCircle, FolderKanban, Users, Sparkles, Star } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import AnimatedCard from "@/components/AnimatedCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";
import { toast } from "@/hooks/use-toast";

const quickActions = [
  { label: "View Faculty", icon: Users, path: "/dashboard/faculty", color: "from-primary to-primary/70" },
  { label: "Create Project", icon: FolderKanban, path: "/dashboard/projects/create", color: "from-secondary to-secondary/70" },
  { label: "Send Request", icon: Send, path: "/dashboard/requests/send", color: "from-accent to-accent/70" },
];

interface FacultyRec {
  id: string;
  name: string;
  department: string | null;
  expertise: string[];
  max_students: number;
  assignedCount: number;
  score: number;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, requestsSent: 0, accepted: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [assignedFaculty, setAssignedFaculty] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<FacultyRec[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [projectsRes, requestsRes, assignmentRes] = await Promise.all([
        supabase.from("projects").select("id, domain, technologies, status").eq("student_id", user.id).order("created_at", { ascending: false }),
        supabase.from("guide_requests").select("id, status").eq("student_id", user.id),
        supabase.from("assignments").select("faculty_id, users!assignments_faculty_id_fkey(name)").eq("student_id", user.id).maybeSingle(),
      ]);

      const requests = requestsRes.data || [];
      const projects = projectsRes.data || [];
      setStats({
        projects: projects.length,
        requestsSent: requests.length,
        accepted: requests.filter((r) => r.status === "accepted").length,
        pending: requests.filter((r) => r.status === "pending").length,
      });

      if (assignmentRes.data) {
        const faculty = assignmentRes.data.users as any;
        setAssignedFaculty(faculty?.name || null);
      }

      // Calculate recommendations if student has a project and no assignment
      const activeProject = projects.find((p) => ["draft", "request_sent"].includes(p.status));
      if (activeProject && !assignmentRes.data) {
        const { data: facultyData } = await supabase
          .from("users")
          .select("id, name, department, expertise, max_students")
          .eq("role", "faculty");

        const projectDomain = (activeProject.domain || "").toLowerCase();
        const projectTech = ((activeProject.technologies as string[]) || []).map((t) => t.toLowerCase());

        const scored: FacultyRec[] = await Promise.all(
          (facultyData || []).map(async (f) => {
            const expertise = ((f.expertise as string[]) || []);
            const expertiseLower = expertise.map((e) => e.toLowerCase());

            let score = 0;
            // Domain match
            if (projectDomain && expertiseLower.some((e) => e.includes(projectDomain) || projectDomain.includes(e))) {
              score += 2;
            }
            // Technology matches
            for (const tech of projectTech) {
              if (expertiseLower.some((e) => e.includes(tech) || tech.includes(e))) {
                score += 1;
              }
            }

            const { count } = await supabase
              .from("assignments")
              .select("id", { count: "exact", head: true })
              .eq("faculty_id", f.id);

            return {
              id: f.id,
              name: f.name,
              department: f.department,
              expertise,
              max_students: f.max_students || 5,
              assignedCount: count || 0,
              score,
            };
          })
        );

        // Sort by score desc, filter those with capacity, take top 5
        const top = scored
          .filter((f) => f.assignedCount < f.max_students)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        setRecommendations(top);
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

      {/* Recommended Faculty */}
      {recommendations.length > 0 && !assignedFaculty && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Recommended Faculty Guides</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <AnimatedCard delay={0} className="h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="gradient-primary rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-sm">{f.name}</h4>
                        <p className="text-xs text-muted-foreground">{f.department || "—"}</p>
                      </div>
                    </div>
                    {f.score > 0 && (
                      <Badge variant="secondary" className="gap-1 text-xs shrink-0">
                        <Star className="h-3 w-3" /> {f.score} match
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {f.expertise.slice(0, 4).map((e) => (
                      <Badge key={e} variant="outline" className="text-[10px] px-1.5 py-0">{e}</Badge>
                    ))}
                    {f.expertise.length > 4 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{f.expertise.length - 4}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Capacity: {f.assignedCount} / {f.max_students} students
                  </p>
                  <div className="mt-auto">
                    <Button size="sm" className="w-full gap-1.5" onClick={() => navigate("/dashboard/requests/send")}>
                      <Send className="h-3.5 w-3.5" /> Request Guide
                    </Button>
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </div>
        </div>
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
