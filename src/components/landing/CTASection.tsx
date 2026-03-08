import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => (
  <section className="py-24">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="gradient-primary rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsla(0,0%,100%,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsla(270,60%,60%,0.3),transparent)]" />
        <div className="relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Start connecting students with the right faculty today
          </h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
            Join thousands of students who have accelerated their academic careers with GuideConnect.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-card text-foreground hover:bg-card/90 border-0 shadow-lg" asChild>
              <Link to="/register">
                Register as Student <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
