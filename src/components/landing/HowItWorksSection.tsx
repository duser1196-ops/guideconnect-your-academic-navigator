import { motion } from "framer-motion";
import { FileText, Send, CheckCircle, BarChart3 } from "lucide-react";

const steps = [
  { icon: FileText, title: "Create a Project", description: "Student fills in project details including title, domain, and description." },
  { icon: Send, title: "Send Request", description: "Student selects a faculty member and sends a guidance request." },
  { icon: CheckCircle, title: "Faculty Reviews", description: "Faculty reviews the request and accepts or rejects it." },
  { icon: BarChart3, title: "Coordinator Monitors", description: "Coordinator oversees project assignments across the section." },
];

const HowItWorksSection = () => (
  <section className="py-24 md:py-32 gradient-subtle relative overflow-hidden">
    <div className="absolute inset-0 dot-grid opacity-40" />
    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">Process</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          How it <span className="gradient-text">works</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          A simple four-step workflow that connects students with the right academic mentors.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto relative">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-border">
          <div className="absolute inset-0 gradient-primary opacity-30 rounded-full" />
        </div>

        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-center relative"
          >
            <div className="relative z-10 mx-auto w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-5 shadow-lg">
              <step.icon size={28} className="text-primary-foreground" />
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                <span className="text-xs font-bold font-display text-primary">{i + 1}</span>
              </div>
            </div>
            <h3 className="font-display font-semibold text-base mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
