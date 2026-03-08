import { motion } from "framer-motion";
import { Search, Send, ClipboardCheck, Eye, ShieldCheck } from "lucide-react";
import AnimatedCard from "@/components/AnimatedCard";

const features = [
  {
    icon: Search,
    title: "Smart Faculty Discovery",
    description: "Students can easily find faculty based on expertise, research interests, and availability.",
  },
  {
    icon: Send,
    title: "Project Request System",
    description: "Students can send project guidance requests directly to faculty with full project details.",
  },
  {
    icon: ClipboardCheck,
    title: "Faculty Request Management",
    description: "Faculty can review, accept, or reject incoming student requests with a single click.",
  },
  {
    icon: Eye,
    title: "Coordinator Monitoring",
    description: "Coordinators can monitor project allocation and faculty workload across their sections.",
  },
  {
    icon: ShieldCheck,
    title: "Admin User Management",
    description: "Admins manage faculty and coordinator accounts, ensuring smooth platform operations.",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-24 md:py-32">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">Features</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Everything you need to <span className="gradient-text">succeed</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Powerful tools designed to streamline academic project allocation and foster meaningful student-faculty connections.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <AnimatedCard key={f.title} delay={i * 0.08} className={i === features.length - 1 ? "md:col-span-2 lg:col-span-1" : ""}>
            <div className="gradient-primary rounded-lg p-2.5 w-fit mb-4">
              <f.icon size={20} className="text-primary-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
          </AnimatedCard>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
