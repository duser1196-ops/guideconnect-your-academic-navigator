import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, User, FolderKanban, MessageSquare, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import AnimatedCard from "@/components/AnimatedCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

const steps = [
  { label: "Select Faculty", icon: User },
  { label: "Write Message", icon: MessageSquare },
  { label: "Confirm", icon: Check },
];

interface FacultyOption { id: string; name: string; department: string | null; max_students: number | null; }
interface ProjectInfo { id: string; title: string; status: string; }

const SendRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ facultyId: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [facultyList, setFacultyList] = useState<FacultyOption[]>([]);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [existingRequestFacultyIds, setExistingRequestFacultyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Fetch student's project
      const { data: projects } = await supabase
        .from("projects")
        .select("id, title, status")
        .eq("student_id", user.id)
        .in("status", ["draft", "request_sent"] as any)
        .order("created_at", { ascending: false })
        .limit(1);

      const studentProject = projects && projects.length > 0 ? projects[0] : null;
      setProject(studentProject);

      if (studentProject) {
        // Fetch existing requests for this project to prevent duplicates
        const { data: existingRequests } = await supabase
          .from("guide_requests")
          .select("faculty_id")
          .eq("project_id", studentProject.id)
          .eq("student_id", user.id)
          .in("status", ["pending", "accepted"] as any);

        setExistingRequestFacultyIds((existingRequests || []).map((r) => r.faculty_id));
      }

      // Fetch faculty
      const { data: facData } = await supabase
        .from("users")
        .select("id, name, department, max_students")
        .eq("role", "faculty" as any);

      setFacultyList(facData || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const selectedFaculty = facultyList.find((f) => f.id === form.facultyId);

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.facultyId) e.facultyId = "Please select a faculty member";
      else if (existingRequestFacultyIds.includes(form.facultyId)) e.facultyId = "You have already requested this faculty.";
    }
    if (step === 1 && !form.message.trim()) e.message = "Please write a message";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(step + 1); };
  const prev = () => { if (step > 0) setStep(step - 1); };

  const handleSend = async () => {
    if (!user || !project) return;
    setSubmitting(true);

    // Double-check for duplicate
    const { data: dupCheck } = await supabase
      .from("guide_requests")
      .select("id")
      .eq("project_id", project.id)
      .eq("faculty_id", form.facultyId)
      .eq("student_id", user.id)
      .in("status", ["pending", "accepted"] as any)
      .limit(1);

    if (dupCheck && dupCheck.length > 0) {
      toast({ title: "Duplicate Request", description: "You have already requested this faculty.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("guide_requests").insert({
      project_id: project.id,
      student_id: user.id,
      faculty_id: form.facultyId,
      message: form.message,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    setSent(true);
    toast({ title: "Guide request sent successfully! 🚀", description: `Your request has been sent to ${selectedFaculty?.name}.` });
    setTimeout(() => navigate("/dashboard/requests"), 2000);
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  if (loading) return <DashboardSkeleton />;

  // No project assigned
  if (!project) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">No Project Assigned</h2>
        <p className="text-muted-foreground mb-6">You cannot request a faculty guide until a project is assigned by the coordinator.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="mx-auto mb-6 h-20 w-20 rounded-full gradient-primary flex items-center justify-center">
          <Check className="h-10 w-10 text-primary-foreground" />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-display text-2xl font-bold mb-2">Request Sent Successfully!</motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-muted-foreground">Redirecting to your requests…</motion.p>
      </div>
    );
  }

  // Available faculty (exclude already-requested)
  const availableFaculty = facultyList.filter((f) => !existingRequestFacultyIds.includes(f.id));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/requests")}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Send Request</h1>
          <p className="text-sm text-muted-foreground">Project: {project.title}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-8 px-2">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center flex-1 last:flex-none">
            <motion.div animate={{ scale: i === step ? 1.1 : 1, backgroundColor: i <= step ? "hsl(var(--primary))" : "hsl(var(--muted))" }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="relative flex items-center justify-center h-10 w-10 rounded-full shrink-0">
              <s.icon className={`h-4 w-4 ${i <= step ? "text-primary-foreground" : "text-muted-foreground"}`} />
              {i < step && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-green-500 rounded-full h-4 w-4 flex items-center justify-center"><Check className="h-2.5 w-2.5 text-white" /></motion.div>)}
            </motion.div>
            {i < steps.length - 1 && (<div className="flex-1 h-0.5 mx-2 rounded-full bg-muted overflow-hidden"><motion.div className="h-full bg-primary" initial={{ width: "0%" }} animate={{ width: i < step ? "100%" : "0%" }} transition={{ duration: 0.4 }} /></div>)}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground mb-6">Step {step + 1} of {steps.length} — <span className="font-medium text-foreground">{steps[step].label}</span></p>

      <AnimatedCard>
        <AnimatePresence mode="wait">
          <motion.div key={step} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-lg">Select Faculty</h3>
                <p className="text-sm text-muted-foreground">Choose the faculty member you'd like to request as your guide.</p>
                {availableFaculty.length === 0 ? (
                  <div className="text-center py-6">
                    <User className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {existingRequestFacultyIds.length > 0
                        ? "You have already sent requests to all available faculty."
                        : "No faculty members available yet."}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {availableFaculty.map((f) => (
                      <motion.button key={f.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => { setForm({ ...form, facultyId: f.id }); setErrors({}); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${form.facultyId === f.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                        <div className="gradient-primary rounded-full h-9 w-9 flex items-center justify-center shrink-0"><User className="h-4 w-4 text-primary-foreground" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{f.name}</p>
                          <p className="text-xs text-muted-foreground">{f.department || "—"} · Max {f.max_students || 5} students</p>
                        </div>
                        {form.facultyId === f.id && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-5 w-5 rounded-full bg-primary flex items-center justify-center"><Check className="h-3 w-3 text-primary-foreground" /></motion.div>)}
                      </motion.button>
                    ))}
                  </div>
                )}
                {errors.facultyId && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">{errors.facultyId}</motion.p>}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-lg">Write a Message</h3>
                <p className="text-sm text-muted-foreground">Explain why you'd like this faculty as your mentor.</p>
                <div className="space-y-2">
                  <Label htmlFor="msg">Message *</Label>
                  <Textarea id="msg" rows={5} placeholder="Dear Professor, I am interested in working under your guidance because…" value={form.message} onChange={(e) => { setForm({ ...form, message: e.target.value }); setErrors({}); }} className={errors.message ? "border-destructive" : ""} />
                  {errors.message && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">{errors.message}</motion.p>}
                  <p className="text-xs text-muted-foreground text-right">{form.message.length} characters</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h3 className="font-display font-semibold text-lg">Confirm & Send</h3>
                <p className="text-sm text-muted-foreground">Review your request before sending.</p>
                <div className="space-y-3 p-4 rounded-lg bg-muted/40 border border-border">
                  <div><p className="text-xs text-muted-foreground font-medium mb-0.5">Faculty</p><p className="text-sm">{selectedFaculty?.name} ({selectedFaculty?.department || "—"})</p></div>
                  <div><p className="text-xs text-muted-foreground font-medium mb-0.5">Project</p><p className="text-sm">{project.title}</p></div>
                  <div><p className="text-xs text-muted-foreground font-medium mb-0.5">Message</p><p className="text-sm leading-relaxed">{form.message}</p></div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8 pt-4 border-t border-border">
          <Button variant="outline" onClick={prev} disabled={step === 0} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
          {step < steps.length - 1 ? (
            <Button onClick={next} className="gap-2" disabled={step === 0 && availableFaculty.length === 0}>Next <motion.span initial={{ x: 0 }} whileHover={{ x: 3 }}>→</motion.span></Button>
          ) : (
            <Button onClick={handleSend} className="gap-2" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Sending…" : "Send Request"}
            </Button>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default SendRequest;
