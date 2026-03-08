import { useState } from "react";
import { UserPlus, Mail, User, Loader2, Hash, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import AnimatedCard from "@/components/AnimatedCard";
import DashboardHeader from "@/components/DashboardHeader";

const AddFaculty = () => {
  const [form, setForm] = useState({
    name: "", email: "", staffId: "", department: "", interests: "", maxStudents: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast({ title: "Faculty Added ✓", description: `${form.name} has been added as faculty.` });
      setSubmitting(false);
      setForm({ name: "", email: "", staffId: "", department: "", interests: "", maxStudents: "" });
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
              <Label>Staff ID</Label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="FAC-2026-001" value={form.staffId} onChange={(e) => update("staffId", e.target.value)} className="pl-10" required />
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
              <Label>Areas of Interest</Label>
              <div className="relative">
                <BookOpen size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Textarea placeholder="e.g. Machine Learning, NLP, Computer Vision" value={form.interests} onChange={(e) => update("interests", e.target.value)} className="pl-10 min-h-[80px]" />
              </div>
              <p className="text-xs text-muted-foreground">Separate multiple interests with commas.</p>
            </div>
            <div className="space-y-2">
              <Label>Maximum Student Capacity</Label>
              <div className="relative">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type="number" placeholder="5" min="1" max="20" value={form.maxStudents} onChange={(e) => update("maxStudents", e.target.value)} className="pl-10" required />
              </div>
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
