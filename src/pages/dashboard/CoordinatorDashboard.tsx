import { motion } from "framer-motion";
import { Users, FolderKanban, BarChart3, AlertCircle } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import AnimatedCard from "@/components/AnimatedCard";

const departments = [
  { name: "Computer Science", students: 245, faculty: 18, projects: 42 },
  { name: "Electronics", students: 180, faculty: 14, projects: 28 },
  { name: "Mechanical", students: 210, faculty: 16, projects: 35 },
];

const CoordinatorDashboard = () => (
  <div>
    <DashboardHeader title="Coordinator Dashboard" description="Oversee departments, faculty, and student allocations." />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard icon={Users} title="Total Students" value={635} delay={0} trend={{ value: "15%", positive: true }} />
      <StatCard icon={Users} title="Faculty Members" value={48} delay={0.1} subtitle="3 on leave" />
      <StatCard icon={FolderKanban} title="Active Projects" value={105} delay={0.2} trend={{ value: "8%", positive: true }} />
      <StatCard icon={AlertCircle} title="Pending Approvals" value={12} delay={0.3} subtitle="5 urgent" />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <AnimatedCard>
          <h3 className="font-display font-semibold text-lg mb-4">Department Overview</h3>
          <div className="space-y-4">
            {departments.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-4 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">{d.name}</h4>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: "Students", val: d.students },
                    { label: "Faculty", val: d.faculty },
                    { label: "Projects", val: d.projects },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="font-display text-lg font-bold">{s.val}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
      </div>

      <AnimatedCard delay={0.2}>
        <h3 className="font-display font-semibold text-lg mb-4">Recent Alerts</h3>
        <div className="space-y-3">
          {[
            { msg: "3 students unassigned in CS dept", level: "warning" },
            { msg: "Faculty evaluation due next week", level: "info" },
            { msg: "Budget approval pending for ECE lab", level: "warning" },
          ].map((a, i) => (
            <motion.div
              key={a.msg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-start gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${a.level === "warning" ? "text-destructive" : "text-primary"}`} />
              <p className="text-sm text-muted-foreground">{a.msg}</p>
            </motion.div>
          ))}
        </div>
      </AnimatedCard>
    </div>
  </div>
);

export default CoordinatorDashboard;
