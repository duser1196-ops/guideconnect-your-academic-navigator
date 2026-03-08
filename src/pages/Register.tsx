import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Mail, Lock, User, ArrowRight, Loader2, Hash } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const Register = () => {
  const [form, setForm] = useState({
    name: "", email: "", password: "", department: "", registration_number: "", section: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await register(form);
    if (success) {
      toast({ title: "Registration Successful ✓", description: "Welcome to GuideConnect!" });
      navigate("/dashboard");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 py-8">
      <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/8 blur-3xl animate-glow" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-secondary/8 blur-3xl animate-glow" style={{ animationDelay: "1s" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-strong rounded-2xl p-8 w-full max-w-lg relative z-10"
      >
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6">
          <div className="gradient-primary rounded-lg p-1.5">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold gradient-text">GuideConnect</span>
        </Link>

        <h1 className="font-display text-2xl font-bold text-center mb-1">Student Registration</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Create your student account to get started</p>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center"
          >{error}</motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label className="text-sm font-medium">Full Name</Label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="John Doe" value={form.name} onChange={(e) => update("name", e.target.value)} className="pl-10 glass border-border/50" required />
              </div>
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" placeholder="you@mvsrec.edu.in" value={form.email} onChange={(e) => update("email", e.target.value)} className="pl-10 glass border-border/50" required />
              </div>
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => update("password", e.target.value)} className="pl-10 glass border-border/50" required minLength={6} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Department</Label>
              <Select value={form.department} onValueChange={(v) => update("department", v)}>
                <SelectTrigger className="glass border-border/50"><SelectValue placeholder="Select" /></SelectTrigger>
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
              <Label className="text-sm font-medium">Registration Number</Label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="22B01A0501" value={form.registration_number} onChange={(e) => update("registration_number", e.target.value)} className="pl-10 glass border-border/50" required />
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="text-sm font-medium">Section</Label>
              <Select value={form.section} onValueChange={(v) => update("section", v)}>
                <SelectTrigger className="glass border-border/50"><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                  <SelectItem value="D">Section D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0 mt-2" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {submitting ? "Creating account…" : "Create Account"} {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
