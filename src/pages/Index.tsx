import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Award, ArrowRight, Sparkles, GraduationCap, Target, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedCard from "@/components/AnimatedCard";

const features = [
  {
    icon: Users,
    title: "Smart Matching",
    description: "AI-powered algorithm connects you with faculty who align with your research interests.",
  },
  {
    icon: BookOpen,
    title: "Research Hub",
    description: "Access curated research papers and collaborate on academic projects seamlessly.",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description: "Set academic milestones and track your progress with intuitive dashboards.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Gain insights into your academic journey with comprehensive performance analytics.",
  },
];

const stats = [
  { value: "10K+", label: "Students" },
  { value: "500+", label: "Faculty" },
  { value: "95%", label: "Match Rate" },
  { value: "50+", label: "Universities" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-glow" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl animate-glow" style={{ animationDelay: "1.5s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
                <Sparkles size={14} className="text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Trusted by 10,000+ students</span>
              </div>

              <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6">
                Connecting Students with the{" "}
                <span className="gradient-text">Right Faculty</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                GuideConnect bridges the gap between students and academic mentors using intelligent matching, collaborative tools, and real-time analytics.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gradient-primary text-primary-foreground border-0 shadow-lg" asChild>
                  <Link to="/register">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="glass" asChild>
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            </motion.div>

            {/* Hero illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 gradient-primary rounded-3xl opacity-10 blur-2xl" />
                <div className="glass-strong rounded-3xl p-8 relative">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: GraduationCap, label: "My Courses", count: "6 Active", color: "text-primary" },
                      { icon: Users, label: "Mentors", count: "3 Connected", color: "text-secondary" },
                      { icon: Award, label: "Achievements", count: "12 Earned", color: "text-accent" },
                      { icon: BarChart3, label: "Progress", count: "87%", color: "text-primary" },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        className="glass rounded-xl p-4 flex flex-col gap-2"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 4, delay: i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <item.icon size={20} className={item.color} />
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                        <span className="text-sm font-semibold font-display">{item.count}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border/50 gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything you need to <span className="gradient-text">succeed</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful tools designed to enhance your academic journey and foster meaningful connections.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <AnimatedCard key={f.title} delay={i * 0.1}>
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

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="gradient-primary rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsla(0,0%,100%,0.1),transparent)]" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to find your perfect mentor?
              </h2>
              <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
                Join thousands of students who have accelerated their academic careers with GuideConnect.
              </p>
              <Button size="lg" variant="secondary" className="bg-card text-foreground hover:bg-card/90 border-0 shadow-lg" asChild>
                <Link to="/register">
                  Start for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
