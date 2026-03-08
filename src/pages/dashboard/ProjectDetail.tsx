import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, FolderKanban, Calendar, Users, Tag, Layers, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import AnimatedCard from "@/components/AnimatedCard";

const projectsData: Record<string, { title: string; description: string; domain: string; type: string; mentor: string; status: string; progress: number; date: string }> = {
  "1": { title: "ML in Healthcare", description: "Building machine learning models for early disease detection using patient health records and imaging data.", domain: "Machine Learning", type: "Major", mentor: "Dr. Ramesh Kumar", status: "In Progress", progress: 65, date: "Jan 2026" },
  "2": { title: "NLP Chatbot", description: "Developing an intelligent chatbot using transformer-based NLP models for student support services.", domain: "Data Science", type: "Mini", mentor: "Dr. Meena Sharma", status: "In Progress", progress: 40, date: "Feb 2026" },
  "3": { title: "IoT Smart Campus", description: "Designing a smart campus infrastructure with IoT sensors for energy management and resource optimization.", domain: "IoT", type: "Major", mentor: "Dr. Anil Verma", status: "Completed", progress: 100, date: "Dec 2025" },
  "4": { title: "Blockchain Auth System", description: "Creating a decentralized authentication system using blockchain technology for secure identity management.", domain: "Cybersecurity", type: "TBP", mentor: "Dr. Priya Singh", status: "Pending", progress: 10, date: "Mar 2026" },
  "5": { title: "AR Learning Platform", description: "Building an augmented reality platform for interactive STEM education experiences.", domain: "Mobile Development", type: "Major", mentor: "Dr. Kavita Joshi", status: "In Progress", progress: 55, date: "Feb 2026" },
  "6": { title: "Data Viz Dashboard", description: "Creating a real-time data visualization dashboard for academic analytics and performance tracking.", domain: "Web Development", type: "Mini", mentor: "Dr. Sanjay Patel", status: "Pending", progress: 5, date: "Mar 2026" },
};

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  "In Progress": "default",
  Completed: "secondary",
  Pending: "outline",
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projectsData[id || ""];
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(project || { title: "", description: "", domain: "", type: "" });

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

  const handleSave = () => {
    setEditing(false);
    toast({ title: "Project Updated ✓", description: `"${form.title}" has been saved.` });
  };

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
        <Button
          variant={editing ? "default" : "outline"}
          onClick={() => (editing ? handleSave() : setEditing(true))}
          className="gap-2"
        >
          {editing ? <><Save className="h-4 w-4" /> Save</> : <><Edit3 className="h-4 w-4" /> Edit</>}
        </Button>
      </div>

      {/* Status bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4"
      >
        <Badge variant={statusVariant[project.status]} className="text-sm px-3 py-1">{project.status}</Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" /> {project.mentor}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" /> {project.date}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
          <span className="font-medium">{project.progress}%</span>
          <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
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
                <p className="text-sm p-2.5 rounded-md bg-muted/40">{form.title}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              {editing ? (
                <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              ) : (
                <p className="text-sm p-2.5 rounded-md bg-muted/40 leading-relaxed">{form.description}</p>
              )}
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.1}>
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> Classification
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Domain</Label>
              {editing ? (
                <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Machine Learning", "Web Development", "Data Science", "Cybersecurity", "IoT", "Cloud Computing", "Blockchain", "Mobile Development"].map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm p-2.5 rounded-md bg-muted/40">{form.domain}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> Project Type</Label>
              {editing ? (
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TBP">TBP (Term-Based Project)</SelectItem>
                    <SelectItem value="Mini">Mini Project</SelectItem>
                    <SelectItem value="Major">Major Project</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm p-2.5 rounded-md bg-muted/40">{form.type}</p>
              )}
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default ProjectDetail;
