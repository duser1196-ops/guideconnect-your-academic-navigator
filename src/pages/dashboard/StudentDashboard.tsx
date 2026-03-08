import { motion } from "framer-motion";
import { BookOpen, Clock, Send, CheckCircle, FileText, Calendar, FolderKanban, Users } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import AnimatedCard from "@/components/AnimatedCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const recentActivity = [
  { title: "Project proposal submitted", time: "2 hours ago", icon: FileText },
  { title: "Meeting with Dr. Ramesh scheduled", time: "5 hours ago", icon: Calendar },
  { title: "Request accepted by Dr. Meena", time: "1 day ago", icon: CheckCircle },
  { title: "New project created: ML Pipeline", time: "2 days ago", icon: FolderKanban },
];

const quickActions = [
  { label: "View Faculty", icon: Users, path: "/dashboard/faculty", color: "from-primary to-primary/70" },
  { label: "Create Project", icon: FolderKanban, path: "/dashboard/projects", color: "from-secondary to-secondary/70" },
  { label: "Send Request", icon: Send, path: "/dashboard/requests", color: "from-accent to-accent/70" },
];

const StudentDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <DashboardHeader title="Student Dashboard" description="Track your academic progress and connect with mentors." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FolderKanban} title="Total Projects" value={6} subtitle="2 in progress" delay={0} trend={{ value: "12%", positive: true }} />
        <StatCard icon={Send} title="Requests Sent" value={8} subtitle="This semester" delay={0.1} />
        <StatCard icon={CheckCircle} title="Accepted Requests" value={5} subtitle="62.5% acceptance" delay={0.2} trend={{ value: "8%", positive: true }} />
        <StatCard icon={Clock} title="Pending Requests" value={3} subtitle="Awaiting response" delay={0.3} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            whileHover={{ y: -4, boxShadow: "0 20px 60px hsla(239,84%,67%,0.12)" }}
            onClick={() => navigate(action.path)}
            className={`glass rounded-xl p-5 flex items-center gap-4 text-left transition-colors`}
          >
            <div className={`bg-gradient-to-br ${action.color} rounded-xl p-3`}>
              <action.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm">{action.label}</p>
              <p className="text-xs text-muted-foreground">Quick access</p>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnimatedCard>
            <h3 className="font-display font-semibold text-lg mb-4">Recent Activity</h3>
            <div className="space-y-3">
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
};

export default StudentDashboard;
