import { motion } from "framer-motion";
import { Users, Shield, UserPlus, Activity, Settings, FolderKanban, GraduationCap } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import AnimatedCard from "@/components/AnimatedCard";

const recentActivity = [
  { action: "Added new faculty: Dr. Kumar", time: "1h ago" },
  { action: "Assigned coordinator to Section B", time: "3h ago" },
  { action: "Removed inactive student account", time: "1d ago" },
  { action: "System backup completed", time: "2d ago" },
];

const AdminDashboard = () => (
  <div>
    <DashboardHeader title="Admin Dashboard" description="System management and user administration." />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard icon={GraduationCap} title="Total Students" value={132} subtitle="Across all departments" delay={0} trend={{ value: "8%", positive: true }} />
      <StatCard icon={UserPlus} title="Total Faculty" value={48} subtitle="3 pending approval" delay={0.1} />
      <StatCard icon={Shield} title="Total Coordinators" value={6} subtitle="Across 3 departments" delay={0.2} />
      <StatCard icon={FolderKanban} title="Total Projects" value={105} subtitle="All departments" delay={0.3} trend={{ value: "12%", positive: true }} />
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <AnimatedCard>
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" /> Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <p className="text-sm">{a.action}</p>
              <span className="text-xs text-muted-foreground">{a.time}</span>
            </motion.div>
          ))}
        </div>
      </AnimatedCard>

      <AnimatedCard delay={0.1}>
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" /> Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Add Faculty", icon: UserPlus, href: "/dashboard/admin/add-faculty" },
            { label: "Add Coordinator", icon: Shield, href: "/dashboard/admin/add-coordinator" },
            { label: "Manage Users", icon: Users, href: "/dashboard/admin/users" },
            { label: "System Settings", icon: Settings, href: "#" },
          ].map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer"
            >
              <div className="gradient-primary rounded-lg p-2">
                <item.icon className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </motion.a>
          ))}
        </div>
      </AnimatedCard>
    </div>
  </div>
);

export default AdminDashboard;
