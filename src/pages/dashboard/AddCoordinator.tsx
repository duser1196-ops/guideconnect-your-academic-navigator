import { useState } from "react";
import { Shield, Mail, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import AnimatedCard from "@/components/AnimatedCard";
import DashboardHeader from "@/components/DashboardHeader";

const AddCoordinator = () => {
  const [form, setForm] = useState({ name: "", email: "", department: "", section: "" });
  const [submitting, setSubmitting] = useState(false);

  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast({ title: "Coordinator Added ✓", description: `${form.name} assigned as coordinator for Section ${form.section}.` });
      setSubmitting(false);
      setForm({ name: "", email: "", department: "", section: "" });
    }, 800);
  };

  return (
    <div>
      <DashboardHeader title="Add Coordinator" description="Assign a faculty member as section coordinator." />

      <div className="max-w-lg">
        <AnimatedCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Prof. Jane Williams" value={form.name} onChange={(e) => update("name", e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" placeholder="jane@university.edu" value={form.email} onChange={(e) => update("email", e.target.value)} className="pl-10" required />
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
              <Label>Assign to Section</Label>
              <Select value={form.section} onValueChange={(v) => update("section", v)}>
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
              {submitting ? "Adding…" : "Add Coordinator"}
            </Button>
          </form>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default AddCoordinator;
