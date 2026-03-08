import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, FolderKanban, Calendar, Users, Tag, Layers, Edit3, Lock, Loader2, Download } from "lucide-react";
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

interface StudentInfo {
  name: string;
  email: string;
  registration_number: string | null;
  department: string | null;
  section: string | null;
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignedFaculty, setAssignedFaculty] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

  const isStudent = user?.role === "student";
  const isEditable = !isStudent && project && (project.status === "draft" || project.status === "request_sent");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", domain: "", technologies: "" });

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
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

      // Fetch student info
      const { data: student } = await supabase
        .from("users")
        .select("name, email, registration_number, department, section")
        .eq("id", data.student_id)
        .single();
      if (student) setStudentInfo(student);

      // Fetch assigned faculty if project is assigned
      if (data.status === "assigned" || data.status === "completed") {
        const { data: asg } = await supabase
          .from("assignments")
          .select("faculty:users!assignments_faculty_id_fkey(name)")
          .eq("project_id", data.id)
          .limit(1)
          .maybeSingle();
        setAssignedFaculty((asg as any)?.faculty?.name || null);
      }

      setLoading(false);
    };
    fetchProject();
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

  const handleDownloadPDF = () => {
    if (!project || !studentInfo) return;

    const regNum = studentInfo.registration_number || "unknown";
    const fileName = `project_report_${regNum}.pdf`;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Error", description: "Please allow popups to download the report.", variant: "destructive" });
      return;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Project Report - ${project.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 22px; color: #6366f1; margin-bottom: 4px; }
    .header p { color: #666; font-size: 13px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 15px; font-weight: 600; color: #6366f1; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .field { display: flex; margin-bottom: 8px; }
    .field-label { font-weight: 600; width: 160px; color: #444; font-size: 13px; }
    .field-value { flex: 1; font-size: 13px; color: #1a1a2e; }
    .description { font-size: 13px; line-height: 1.7; color: #333; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
    .tech-list { display: flex; gap: 6px; flex-wrap: wrap; }
    .tech-badge { background: #eef2ff; color: #6366f1; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    .status-badge { display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .status-draft { background: #fef3c7; color: #92400e; }
    .status-request_sent { background: #dbeafe; color: #1e40af; }
    .status-assigned { background: #d1fae5; color: #065f46; }
    .status-completed { background: #e0e7ff; color: #3730a3; }
    .footer { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #999; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>GuideConnect — Project Report</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="section">
    <div class="section-title">Student Information</div>
    <div class="field"><span class="field-label">Name</span><span class="field-value">${studentInfo.name}</span></div>
    <div class="field"><span class="field-label">Registration Number</span><span class="field-value">${studentInfo.registration_number || "—"}</span></div>
    <div class="field"><span class="field-label">Email</span><span class="field-value">${studentInfo.email}</span></div>
    <div class="field"><span class="field-label">Department</span><span class="field-value">${studentInfo.department || "—"}</span></div>
    <div class="field"><span class="field-label">Section</span><span class="field-value">${studentInfo.section || "—"}</span></div>
  </div>

  <div class="section">
    <div class="section-title">Project Details</div>
    <div class="field"><span class="field-label">Title</span><span class="field-value">${project.title}</span></div>
    <div class="field"><span class="field-label">Domain</span><span class="field-value">${project.domain || "Not specified"}</span></div>
    <div class="field"><span class="field-label">Status</span><span class="field-value"><span class="status-badge status-${project.status}">${statusLabel[project.status] || project.status}</span></span></div>
    <div class="field"><span class="field-label">Created</span><span class="field-value">${new Date(project.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
    ${project.technologies && project.technologies.length > 0 ? `
    <div class="field"><span class="field-label">Technologies</span><span class="field-value"><div class="tech-list">${project.technologies.map(t => `<span class="tech-badge">${t}</span>`).join('')}</div></span></div>
    ` : ''}
  </div>

  ${project.description ? `
  <div class="section">
    <div class="section-title">Project Description</div>
    <div class="description">${project.description}</div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Faculty Guide</div>
    <div class="field"><span class="field-label">Assigned Faculty</span><span class="field-value">${assignedFaculty || "Not yet assigned"}</span></div>
  </div>

  <div class="footer">
    GuideConnect Platform — MVSREC &bull; This is a system-generated report
  </div>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.document.title = fileName;

    printWindow.onload = () => {
      printWindow.print();
    };

    toast({ title: "Report Generated", description: "Use your browser's Save as PDF option to download." });
  };

  if (loading) return <DashboardSkeleton />;

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{project.title}</h1>
          <p className="text-sm text-muted-foreground">Project Details</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" /> Report
          </Button>
          {isEditable ? (
            <Button
              variant={editing ? "default" : "outline"}
              size="sm"
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
        {!isEditable && !isStudent && (
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
