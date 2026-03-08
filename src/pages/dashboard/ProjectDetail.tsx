import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, FolderKanban, Calendar, Users, Tag, Layers, Edit3, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import AnimatedCard from "@/components/AnimatedCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

const domains = ["Machine Learning", "Web Development", "Data Science", "Cybersecurity", "IoT", "Cloud Computing", "Blockchain", "Mobile Development"];

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

interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  domain: string | null;
  status: string;
  technologies: string[] | null;
  created_at: string;
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", domain: "", technologies: "" });
  const [assignedFaculty, setAssignedFaculty] = useState<string | null>(null);

  const isEditable = project && (project.status === "draft" || project.status === "request_sent");

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setProject(data);
      setForm({
        title: data.title,
        description: data.description || "",
        domain: data.domain || "",
        technologies: (data.technologies || []).join(", "),
      });

      // Fetch assigned faculty if project is assigned
      if (data.status === "assigned" || data.status === "completed") {
        const { data: asg } = await supabase
          .from("assignments")
          .select("faculty:users!assignments_faculty_id_fkey(name)")
          .eq("project_id", data.id)
          .limit(1)
          .single();
        setAssignedFaculty((asg as any)?.faculty?.name || null);
      }

      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);

    const technologies = form.technologies
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("projects")
      .update({
        title: form.title,
        description: form.description || null,
        domain: form.domain || null,
        technologies: technologies.length > 0 ? technologies : null,
      })
      .eq("id", project.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Project Updated ✓", description: `"${form.title}" has been saved.` });
      setProject({ ...project, title: form.title, description: form.description, domain: form.domain, technologies: technologies.length > 0 ? technologies : null });
      setEditing(false);
    }
    setSaving(false);
  };

  if (loading) return <DashboardSkeleton />;

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard/projects")}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/projects")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{project.title}</h1>
          <p className="text-sm text-muted-foreground">Project Details</p>
        </div>
        {isEditable ? (
          <Button
            variant={editing ? "default" : "outline"}
            onClick={() => (editing ? handleSave() : setEditing(true))}
            className="gap-2"
            disabled={saving}
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            ) : editing ? (
              <><Save className="h-4 w-4" /> Save</>
            ) : (
              <><Edit3 className="h-4 w-4" /> Edit</>
            )}
          </Button>
        ) : (
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
            <Lock className="h-3 w-3" /> Locked
          </Badge>
        )}
      </div>

      {/* Status bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4"
      >
        <Badge variant={statusVariant[project.status] || "outline"} className="text-sm px-3 py-1">
          {statusLabel[project.status] || project.status}
        </Badge>
        {assignedFaculty && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> {assignedFaculty}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" /> {new Date(project.created_at).toLocaleDateString()}
        </div>
        {!isEditable && (
          <p className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
            <Lock className="h-3 w-3" /> Editing disabled — faculty guide assigned
          </p>
        )}
      </motion.div>

      <div className="grid gap-6">
        <AnimatedCard>
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" /> Basic Information
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Title</Label>
              {editing ? (
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              ) : (
                <p className="text-sm p-2.5 rounded-md bg-muted/40">{project.title}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              {editing ? (
                <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              ) : (
                <p className="text-sm p-2.5 rounded-md bg-muted/40 leading-relaxed">{project.description || "No description"}</p>
              )}
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.1}>
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> Classification & Technologies
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Domain</Label>
              {editing ? (
                <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {domains.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm p-2.5 rounded-md bg-muted/40">{project.domain || "Not specified"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Technologies</Label>
              {editing ? (
                <>
                  <Input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="e.g. Python, React, TensorFlow" />
                  <p className="text-xs text-muted-foreground">Separate with commas</p>
                </>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies && project.technologies.length > 0 ? (
                    project.technologies.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">None specified</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default ProjectDetail;
