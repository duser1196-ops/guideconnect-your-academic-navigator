import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedCard from "@/components/AnimatedCard";
import { FolderKanban, Plus, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const initialProjects = [
  { id: 1, title: "ML in Healthcare", mentor: "Dr. Ramesh Kumar", status: "In Progress", progress: 65, date: "Jan 2026" },
  { id: 2, title: "NLP Chatbot", mentor: "Dr. Meena Sharma", status: "In Progress", progress: 40, date: "Feb 2026" },
  { id: 3, title: "IoT Smart Campus", mentor: "Dr. Anil Verma", status: "Completed", progress: 100, date: "Dec 2025" },
  { id: 4, title: "Blockchain Auth System", mentor: "Dr. Priya Singh", status: "Pending", progress: 10, date: "Mar 2026" },
  { id: 5, title: "AR Learning Platform", mentor: "Dr. Kavita Joshi", status: "In Progress", progress: 55, date: "Feb 2026" },
  { id: 6, title: "Data Viz Dashboard", mentor: "Dr. Sanjay Patel", status: "Pending", progress: 5, date: "Mar 2026" },
];

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  "In Progress": "default",
  Completed: "secondary",
  Pending: "outline",
};

const Projects = () => {
  const [projects] = useState(initialProjects);

  const handleCreate = () => {
    toast({ title: "Project Created!", description: "Your new project has been added." });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold">My Projects</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Fill in the details for your new project.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input id="title" placeholder="Enter project title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" placeholder="Describe your project…" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" /> Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p, i) => (
          <AnimatedCard key={p.id} delay={i * 0.08}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="gradient-primary rounded-lg p-2">
                  <FolderKanban className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-sm">{p.title}</h3>
              </div>
              <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
            </div>
            <div className="text-xs text-muted-foreground space-y-1.5 mb-3">
              <p className="flex items-center gap-1.5"><Users className="h-3 w-3" /> Mentor: {p.mentor}</p>
              <p className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Started: {p.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full gradient-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${p.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{p.progress}%</span>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
};

export default Projects;
