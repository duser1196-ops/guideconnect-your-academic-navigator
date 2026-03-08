import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedCard from "@/components/AnimatedCard";
import { FolderKanban, Plus, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

interface Project {
  id: string;
  title: string;
  description: string | null;
  domain: string | null;
  status: string;
  technologies: string[] | null;
  created_at: string;
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  draft: "outline",
  request_sent: "default",
  assigned: "secondary",
  completed: "secondary",
};

const statusLabel: Record<string, string> = {
  draft: "Draft",
  request_sent: "Request Sent",
  assigned: "Assigned",
  completed: "Completed",
};

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
      setProjects(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) return <DashboardSkeleton />;

  const hasActiveProject = projects.some((p) => ["draft", "request_sent", "assigned"].includes(p.status));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold">My Projects</h1>
        {!hasActiveProject && (
          <Button className="gap-2" onClick={() => navigate("/dashboard/projects/create")}>
            <Plus className="h-4 w-4" /> Create Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <AnimatedCard>
          <div className="text-center py-10">
            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground mb-4">You haven't created any projects yet.</p>
            <Button onClick={() => navigate("/dashboard/projects/create")}>Create Your First Project</Button>
          </div>
        </AnimatedCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <AnimatedCard key={p.id} delay={i * 0.08}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="gradient-primary rounded-lg p-2">
                    <FolderKanban className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-sm truncate">{p.title}</h3>
                </div>
                <Badge variant={statusVariant[p.status] || "outline"}>{statusLabel[p.status] || p.status}</Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1.5 mb-3">
                {p.domain && <p>Domain: {p.domain}</p>}
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> {new Date(p.created_at).toLocaleDateString()}
                </p>
              </div>
              {p.technologies && p.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.technologies.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-xs"
                onClick={() => navigate(`/dashboard/projects/${p.id}`)}
              >
                <Eye className="h-3.5 w-3.5" /> View Details
              </Button>
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
