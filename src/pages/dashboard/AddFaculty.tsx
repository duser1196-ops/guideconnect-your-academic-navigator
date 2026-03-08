import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Mail, User, BookOpen, ArrowLeft, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import AnimatedCard from "@/components/AnimatedCard";
import DashboardHeader from "@/components/DashboardHeader";

const AddFaculty = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", department: "", specialization: "" });
  const [submitting, setSubmitting] = useState(false);

  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast({ title: "Faculty Added ✓", description: `${form.name} has been added as faculty.` });
      setSubmitting(false);
      setForm({ name: "", email: "", department: "", specialization: "" });
    }, 800);
  };

  return (
    <div>
      <DashboardHeader title="Add Faculty" description="Create a new faculty account." />

      <div className="max-w-lg">
        <AnimatedCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Dr. John Smith" value={form.name} onChange={(e) => update("name", e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" placeholder="john@university.edu" value={form.email} onChange={(e) => update("email", e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => update("department", v)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="ECE">ECE</SelectItem>
                  <SelectItem value="ME">Mechanical</SelectItem>
                  <SelectItem value="CE">Civil</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Input placeholder="e.g. Machine Learning, NLP" value={form.specialization} onChange={(e) => update("specialization", e.target.value)} />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              {submitting ? "Adding…" : "Add Faculty"}
            </Button>
          </form>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default AddFaculty;
