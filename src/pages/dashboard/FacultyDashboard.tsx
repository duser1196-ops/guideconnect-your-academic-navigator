import { motion } from "framer-motion";
import { Users, FileText, BookOpen, Star, GraduationCap } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import AnimatedCard from "@/components/AnimatedCard";

const mentees = [
  { name: "Alex Johnson", project: "ML in Healthcare", progress: 75 },
  { name: "Maria Garcia", project: "NLP Research", progress: 60 },
  { name: "James Lee", project: "Computer Vision", progress: 45 },
  { name: "Priya Sharma", project: "Data Mining", progress: 90 },
];

const FacultyDashboard = () => (
  <div>
    <DashboardHeader title="Faculty Dashboard" description="Manage your students and research projects." />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard icon={Users} title="Active Mentees" value={8} subtitle="4 projects ongoing" delay={0} trend={{ value: "2 new", positive: true }} />
      <StatCard icon={FileText} title="Pending Reviews" value={5} subtitle="3 urgent" delay={0.1} />
      <StatCard icon={BookOpen} title="Publications" value={24} subtitle="This year: 6" delay={0.2} trend={{ value: "20%", positive: true }} />
      <StatCard icon={Star} title="Rating" value="4.8" subtitle="Based on 120 reviews" delay={0.3} />
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <AnimatedCard>
        <h3 className="font-display font-semibold text-lg mb-4">My Mentees</h3>
        <div className="space-y-4">
          {mentees.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="gradient-primary rounded-full h-9 w-9 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground truncate">{m.project}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full gradient-primary" style={{ width: `${m.progress}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-8">{m.progress}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedCard>

      <AnimatedCard delay={0.1}>
        <h3 className="font-display font-semibold text-lg mb-4">Pending Requests</h3>
        <div className="space-y-3">
          {[
            { student: "Emily Davis", type: "Mentorship Request", time: "1h ago" },
            { student: "Ryan Kim", type: "Project Review", time: "3h ago" },
            { student: "Sophie Brown", type: "Meeting Request", time: "1d ago" },
          ].map((r, i) => (
            <motion.div
              key={r.student}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{r.student}</p>
                <p className="text-xs text-muted-foreground">{r.type}</p>
              </div>
              <span className="text-xs text-muted-foreground">{r.time}</span>
            </motion.div>
          ))}
        </div>
      </AnimatedCard>
    </div>
  </div>
);

export default FacultyDashboard;
