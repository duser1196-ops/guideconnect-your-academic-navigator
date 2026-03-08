import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, GraduationCap, Users, Award, BarChart3 } from "lucide-react";

const heroCards = [
  { icon: GraduationCap, label: "My Courses", count: "6 Active", color: "text-primary" },
  { icon: Users, label: "Mentors", count: "3 Connected", color: "text-secondary" },
  { icon: Award, label: "Achievements", count: "12 Earned", color: "text-accent" },
  { icon: BarChart3, label: "Progress", count: "87%", color: "text-primary" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const HeroSection = () => (
  <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
    {/* Ambient orbs — CSS only, no JS animation */}
    <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-glow will-change-[opacity]" />
    <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl animate-glow will-change-[opacity]" style={{ animationDelay: "1.5s" }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />

    <div className="container mx-auto px-4 relative z-10">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6"
          >
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Trusted by 10,000+ students across 50+ universities</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
            Connecting Students{" "}
            <br className="hidden md:block" />
            with the{" "}
            <span className="gradient-text">Right Faculty</span>
            <br className="hidden md:block" />
            for Academic Projects
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
            A smart academic platform that simplifies project guide allocation by enabling students to connect with faculty efficiently.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
            <Button size="lg" className="gradient-primary text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-shadow" asChild>
              <Link to="/register">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="glass" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="flex gap-8 mt-12">
            {[
              { value: "10K+", label: "Students" },
              { value: "500+", label: "Faculty" },
              { value: "95%", label: "Match Rate" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero illustration — CSS float animation instead of Framer infinite */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block"
        >
          <div className="absolute inset-0 gradient-primary rounded-3xl opacity-10 blur-2xl" />
          <div className="glass-strong rounded-3xl p-8 relative">
            <div className="grid grid-cols-2 gap-4">
              {heroCards.map((item, i) => (
                <div
                  key={item.label}
                  className="glass rounded-xl p-4 flex flex-col gap-2 animate-float will-change-transform"
                  style={{ animationDelay: `${i * 0.8}s` }}
                >
                  <item.icon size={20} className={item.color} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold font-display">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
