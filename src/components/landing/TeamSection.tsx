import { motion } from "framer-motion";
import { Github, Linkedin } from "lucide-react";
import teamCharan from "@/assets/team-charan.jpg";
import teamRihika from "@/assets/team-rihika.jpg";
import teamAkshay from "@/assets/team-akshay.jpg";

const team = [
  {
    name: "D. Charan",
    role: "Full Stack Developer",
    description: "Worked on frontend architecture, UI design, and backend integration.",
    image: teamCharan,
  },
  {
    name: "D. Rihika",
    role: "Backend Developer",
    description: "Worked on database design and API development.",
    image: teamRihika,
  },
  {
    name: "M. Akshay",
    role: "UI/UX Designer",
    description: "Designed application layouts and user experience.",
    image: teamAkshay,
  },
];

const TeamSection = () => (
  <section className="py-24 md:py-32 gradient-subtle relative overflow-hidden">
    <div className="absolute inset-0 dot-grid opacity-30" />
    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">Our Team</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Meet the <span className="gradient-text">Team</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          The talented people behind GuideConnect who made this platform possible.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {team.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
            className="glass-strong rounded-2xl p-6 text-center group"
          >
            <div className="relative w-28 h-28 mx-auto mb-5">
              <div className="absolute inset-0 gradient-primary rounded-full opacity-20 blur-md group-hover:opacity-40 transition-opacity" />
              <img
                src={member.image}
                alt={member.name}
                className="w-28 h-28 rounded-full object-cover relative z-10 border-2 border-border"
              />
            </div>
            <h3 className="font-display font-bold text-lg">{member.name}</h3>
            <p className="text-sm font-medium text-primary mb-2">{member.role}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{member.description}</p>
            <div className="flex justify-center gap-3">
              {[Linkedin, Github].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TeamSection;
