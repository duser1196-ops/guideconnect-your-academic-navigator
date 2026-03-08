import { motion } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/NotificationBell";

const roleGreetings: Record<string, { subtitle: string }> = {
  student: { subtitle: "B.Tech Computer Science — Semester 6" },
  faculty: { subtitle: "Associate Professor — CS Department" },
  coordinator: { subtitle: "Academic Coordinator — Engineering" },
  admin: { subtitle: "System Administrator" },
};

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

const DashboardHeader = ({ title, description }: DashboardHeaderProps) => {
  const { user } = useAuth();
  const role = user?.role || "student";
  const greeting = roleGreetings[role];

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="gradient-primary rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsla(0,0%,100%,0.12),transparent)]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,hsla(0,0%,100%,0.06),transparent_70%)]" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[radial-gradient(circle,hsla(270,60%,60%,0.2),transparent_70%)]" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <SidebarTrigger className="text-primary-foreground/80 hover:text-primary-foreground md:hidden" />
            <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="font-display text-2xl md:text-3xl font-bold text-primary-foreground"
            >{title}</motion.h1>
          </div>
          {description && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-primary-foreground/70 text-sm mb-1">
              {description}
            </motion.p>
          )}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-primary-foreground/50 text-xs">
            Welcome, {user?.name} · {greeting.subtitle}
          </motion.p>
        </div>
        <NotificationBell />
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
