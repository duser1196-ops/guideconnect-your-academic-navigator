import { useState } from "react";
import { Shield, Mail, User, Loader2, Hash, LayoutList, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import AnimatedCard from "@/components/AnimatedCard";
import DashboardHeader from "@/components/DashboardHeader";
import { supabase } from "@/integrations/supabase/client";

const AddCoordinator = () => {
  const [form, setForm] = useState({
    name: "", email: "", password: "", department: "", section: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("admin-create-user", {
        body: {
          email: form.email,
          password: form.password,
          name: form.name,
          role: "coordinator",
          department: form.department,
          section: form.section,
        },
      });

      if (res.error || res.data?.error) {
        throw new Error(res.data?.error || res.error?.message || "Failed to create coordinator");
      }

      toast({ title: "Coordinator Added ✓", description: `${form.name} assigned as coordinator for Section ${form.section}.` });
      setForm({ name: "", email: "", password: "", department: "", section: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
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
              <Label>Temporary Password</Label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => update("password", e.target.value)} className="pl-10" required minLength={6} />
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
              <Label>Assigned Section</Label>
              <Select value={form.section} onValueChange={(v) => update("section", v)}>
                <SelectTrigger>
                  <LayoutList size={16} className="mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                  <SelectItem value="D">Section D</SelectItem>
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
