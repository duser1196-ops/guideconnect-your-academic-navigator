import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, FileText, Tag, Layers, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import AnimatedCard from "@/components/AnimatedCard";

const steps = [
  { label: "Basic Info", icon: FileText },
  { label: "Details", icon: AlignLeft },
  { label: "Classification", icon: Layers },
  { label: "Review", icon: Check },
];

const domains = ["Machine Learning", "Web Development", "Data Science", "Cybersecurity", "IoT", "Cloud Computing", "Blockchain", "Mobile Development"];

const CreateProject = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title: "", description: "", domain: "", type: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0 && !form.title.trim()) e.title = "Project title is required";
    if (step === 1 && !form.description.trim()) e.description = "Description is required";
    if (step === 2) {
      if (!form.domain) e.domain = "Select a domain";
      if (!form.type) e.type = "Select a project type";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < steps.length - 1) setStep(step + 1);
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = () => {
    toast({ title: "Project Created! 🎉", description: `"${form.title}" has been created successfully.` });
    navigate("/dashboard/projects");
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/projects")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-display text-2xl font-bold">Create Project</h1>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8 px-2">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center flex-1 last:flex-none">
            <motion.div
              animate={{
                scale: i === step ? 1.1 : 1,
                backgroundColor: i <= step ? "hsl(var(--primary))" : "hsl(var(--muted))",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative flex items-center justify-center h-10 w-10 rounded-full shrink-0"
            >
              <s.icon className={`h-4 w-4 ${i <= step ? "text-primary-foreground" : "text-muted-foreground"}`} />
              {i < step && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-green-500 rounded-full h-4 w-4 flex items-center justify-center"
                >
                  <Check className="h-2.5 w-2.5 text-white" />
                </motion.div>
              )}
            </motion.div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: i < step ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground mb-6">
        Step {step + 1} of {steps.length} — <span className="font-medium text-foreground">{steps[step].label}</span>
      </p>

      {/* Form steps */}
      <AnimatedCard>
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={step}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-lg">Project Title</h3>
                <p className="text-sm text-muted-foreground">Choose a clear, descriptive title for your project.</p>
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. ML-based Healthcare Diagnostics"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">
                      {errors.title}
                    </motion.p>
                  )}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-lg">Project Description</h3>
                <p className="text-sm text-muted-foreground">Describe the objectives, methodology, and expected outcomes.</p>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description *</Label>
                  <Textarea
                    id="desc"
                    rows={5}
                    placeholder="Describe your project in detail…"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">
                      {errors.description}
                    </motion.p>
                  )}
                  <p className="text-xs text-muted-foreground text-right">{form.description.length} characters</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h3 className="font-display font-semibold text-lg">Classification</h3>
                <p className="text-sm text-muted-foreground">Select the domain and type for your project.</p>
                <div className="space-y-2">
                  <Label>Domain *</Label>
                  <Select value={form.domain} onValueChange={(v) => update("domain", v)}>
                    <SelectTrigger className={errors.domain ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.domain && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">
                      {errors.domain}
                    </motion.p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Project Type *</Label>
                  <Select value={form.type} onValueChange={(v) => update("type", v)}>
                    <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TBP">TBP (Term-Based Project)</SelectItem>
                      <SelectItem value="Mini">Mini Project</SelectItem>
                      <SelectItem value="Major">Major Project</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">
                      {errors.type}
                    </motion.p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h3 className="font-display font-semibold text-lg">Review & Submit</h3>
                <p className="text-sm text-muted-foreground">Please review your project details before submitting.</p>
                <div className="space-y-3 p-4 rounded-lg bg-muted/40 border border-border">
                  {[
                    { label: "Title", value: form.title },
                    { label: "Description", value: form.description },
                    { label: "Domain", value: form.domain },
                    { label: "Type", value: form.type },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">{item.label}</p>
                      <p className="text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{form.domain}</Badge>
                  <Badge>{form.type}</Badge>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t border-border">
          <Button variant="outline" onClick={prev} disabled={step === 0} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={next} className="gap-2">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="gap-2">
              <Check className="h-4 w-4" /> Create Project
            </Button>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default CreateProject;
