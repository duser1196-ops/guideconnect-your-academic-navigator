import { motion } from "framer-motion";
import { BookOpen, Clock, Users, Award, FileText, Calendar } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import AnimatedCard from "@/components/AnimatedCard";

const recentActivity = [
  { title: "Project proposal submitted", time: "2 hours ago", icon: FileText },
  { title: "Meeting with Dr. Chen scheduled", time: "5 hours ago", icon: Calendar },
  { title: "Research paper reviewed", time: "1 day ago", icon: BookOpen },
];

const StudentDashboard = () => (
  <div>
    <DashboardHeader title="Student Dashboard" description="Track your academic progress and connect with mentors." />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard icon={BookOpen} title="Active Projects" value={4} subtitle="2 pending review" delay={0} trend={{ value: "12%", positive: true }} />
      <StatCard icon={Users} title="Mentors" value={3} subtitle="1 new connection" delay={0.1} />
      <StatCard icon={Clock} title="Hours Logged" value={128} subtitle="This semester" delay={0.2} trend={{ value: "8%", positive: true }} />
      <StatCard icon={Award} title="Achievements" value={12} subtitle="3 this month" delay={0.3} />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <AnimatedCard>
          <h3 className="font-display font-semibold text-lg mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="gradient-primary rounded-lg p-2">
                  <item.icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
      </div>

      <AnimatedCard delay={0.2}>
        <h3 className="font-display font-semibold text-lg mb-4">Upcoming Deadlines</h3>
        <div className="space-y-3">
          {[
            { task: "Thesis Draft", date: "Mar 15", urgent: true },
            { task: "Lab Report", date: "Mar 20", urgent: false },
            { task: "Project Demo", date: "Mar 28", urgent: false },
          ].map((d) => (
            <div key={d.task} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${d.urgent ? "bg-destructive" : "bg-primary"}`} />
                <span className="text-sm">{d.task}</span>
              </div>
              <span className="text-xs text-muted-foreground">{d.date}</span>
            </div>
          ))}
        </div>
      </AnimatedCard>
    </div>
  </div>
);

export default StudentDashboard;
