import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Eye, ShieldCheck } from "lucide-react";

const roles = [
  {
    icon: GraduationCap,
    title: "Student",
    color: "from-primary to-secondary",
    items: ["Create and manage projects", "Discover faculty by expertise", "Send guidance requests", "Track request status"],
  },
  {
    icon: BookOpen,
    title: "Faculty",
    color: "from-secondary to-accent",
    items: ["View incoming student requests", "Accept or reject requests", "Monitor assigned projects", "Manage availability slots"],
  },
  {
    icon: Eye,
    title: "Coordinator",
    color: "from-accent to-primary",
    items: ["Monitor section students", "Track faculty allocation", "Ensure fair workload distribution", "Oversee project progress"],
  },
  {
    icon: ShieldCheck,
    title: "Admin",
    color: "from-primary to-accent",
    items: ["Manage all users", "Add faculty accounts", "Add coordinator accounts", "System-wide oversight"],
  },
];

const RolesSection = () => (
  <section className="py-24 md:py-32">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">Platform</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Built for <span className="gradient-text">every role</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          A unified platform that serves students, faculty, coordinators, and administrators with role-specific tools.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {roles.map((role, i) => (
          <motion.div
            key={role.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
            whileHover={{ y: -4, transition: { duration: 0.25 } }}
            className="glass-interactive rounded-2xl p-6 group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <role.icon size={22} className="text-primary-foreground" />
            </div>
            <h3 className="font-display font-bold text-lg mb-3">{role.title}</h3>
            <ul className="space-y-2">
              {role.items.map((item) => (
                <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default RolesSection;
