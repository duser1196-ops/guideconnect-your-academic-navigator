import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, Send, CheckCircle, FolderKanban, Users, Sparkles, Star, Calendar, Tag } from "lucide-react";
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

interface ProjectInfo {
  id: string;
  title: string;
  description: string | null;
  domain: string | null;
  status: string;
  technologies: string[] | null;
  created_at: string;
}

interface FacultyRec {
  id: string;
  name: string;
  department: string | null;
  expertise: string[];
  max_students: number;
  assignedCount: number;
  score: number;
}

const statusLabel: Record<string, string> = {
  draft: "Draft",
  request_sent: "Request Sent",
  assigned: "Assigned",
  completed: "Completed",
};

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  draft: "outline",
  request_sent: "default",
  assigned: "secondary",
  completed: "secondary",
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ requestsSent: 0, accepted: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [assignedFaculty, setAssignedFaculty] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<FacultyRec[]>([]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    const [projectsRes, requestsRes, assignmentRes] = await Promise.all([
      supabase.from("projects").select("id, title, description, domain, status, technologies, created_at").eq("student_id", user.id).order("created_at", { ascending: false }).limit(1),
      supabase.from("guide_requests").select("id, status").eq("student_id", user.id),
      supabase.from("assignments").select("faculty_id, users!assignments_faculty_id_fkey(name)").eq("student_id", user.id).maybeSingle(),
    ]);

    const requests = requestsRes.data || [];
    const projects = projectsRes.data || [];
    const activeProject = projects.length > 0 ? projects[0] : null;

    setProject(activeProject as ProjectInfo | null);
    setStats({
      requestsSent: requests.length,
      accepted: requests.filter((r) => r.status === "accepted").length,
      pending: requests.filter((r) => r.status === "pending").length,
    });

    if (assignmentRes.data) {
      const faculty = assignmentRes.data.users as any;
      setAssignedFaculty(faculty?.name || null);
    }

    // Calculate recommendations if student has a project and no assignment
    if (activeProject && ["draft", "request_sent"].includes(activeProject.status) && !assignmentRes.data) {
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
          if (projectDomain && expertiseLower.some((e) => e.includes(projectDomain) || projectDomain.includes(e))) score += 2;
          for (const tech of projectTech) {
            if (expertiseLower.some((e) => e.includes(tech) || tech.includes(e))) score += 1;
          }

          const { count } = await supabase
            .from("assignments")
            .select("id", { count: "exact", head: true })
            .eq("faculty_id", f.id);

          return { id: f.id, name: f.name, department: f.department, expertise, max_students: f.max_students || 5, assignedCount: count || 0, score };
        })
      );

      setRecommendations(scored.filter((f) => f.assignedCount < f.max_students).sort((a, b) => b.score - a.score).slice(0, 5));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('student-dashboard')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'guide_requests' }, (payload) => {
        const newStatus = (payload.new as any).status;
        if (newStatus === 'accepted') toast({ title: "🎉 Request Accepted", description: "Faculty accepted your request!" });
        else if (newStatus === 'rejected') toast({ title: "Request Update", description: "A faculty member declined your request." });
        else if (newStatus === 'cancelled') toast({ title: "Request Cancelled", description: "A pending request was cancelled." });
        fetchStats();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'assignments' }, () => { fetchStats(); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'projects' }, () => { fetchStats(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchStats]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <DashboardHeader title="Student Dashboard" description="Track your academic progress and connect with mentors." />

      {/* Project Section */}
      <div className="mb-6">
        <h2 className="font-display text-lg font-semibold mb-4">My Project</h2>
        {project ? (
          <AnimatedCard>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="gradient-primary rounded-lg p-2">
                  <FolderKanban className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{project.title}</h3>
                  {project.domain && <p className="text-xs text-muted-foreground flex items-center gap-1"><Tag className="h-3 w-3" /> {project.domain}</p>}
                </div>
              </div>
              <Badge variant={statusVariant[project.status] || "outline"}>{statusLabel[project.status] || project.status}</Badge>
            </div>
            {project.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>}
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {project.technologies.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
              View Project Details
            </Button>
          </AnimatedCard>
        ) : (
          <AnimatedCard>
            <div className="text-center py-8">
              <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">Project has not yet been assigned by the coordinator.</p>
              <p className="text-sm text-muted-foreground mt-1">Please wait for your coordinator to create and assign a project to you.</p>
            </div>
          </AnimatedCard>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Send} title="Requests Sent" value={stats.requestsSent} subtitle="Total requests" delay={0} />
        <StatCard icon={CheckCircle} title="Accepted" value={stats.accepted} subtitle={stats.requestsSent > 0 ? `${Math.round((stats.accepted / stats.requestsSent) * 100)}% rate` : "No requests yet"} delay={0.1} />
        <StatCard icon={Clock} title="Pending" value={stats.pending} subtitle="Awaiting response" delay={0.2} />
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
      {recommendations.length > 0 && !assignedFaculty && project && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Recommended Faculty Guides</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
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
                    {f.expertise.slice(0, 4).map((e) => <Badge key={e} variant="outline" className="text-[10px] px-1.5 py-0">{e}</Badge>)}
                    {f.expertise.length > 4 && <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{f.expertise.length - 4}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Capacity: {f.assignedCount} / {f.max_students} students</p>
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

      {/* Quick Actions */}
      {project && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} whileHover={{ y: -4 }} onClick={() => navigate("/dashboard/faculty")} className="glass rounded-xl p-5 flex items-center gap-4 text-left transition-colors">
            <div className="bg-gradient-to-br from-primary to-primary/70 rounded-xl p-3">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <div><p className="font-display font-semibold text-sm">View Faculty</p><p className="text-xs text-muted-foreground">Browse available guides</p></div>
          </motion.button>
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} whileHover={{ y: -4 }} onClick={() => navigate("/dashboard/requests/send")} className="glass rounded-xl p-5 flex items-center gap-4 text-left transition-colors">
            <div className="bg-gradient-to-br from-accent to-accent/70 rounded-xl p-3">
              <Send className="h-5 w-5 text-primary-foreground" />
            </div>
            <div><p className="font-display font-semibold text-sm">Send Request</p><p className="text-xs text-muted-foreground">Request a faculty guide</p></div>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
