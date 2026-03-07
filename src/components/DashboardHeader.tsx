import { motion } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRole } from "@/hooks/useRole";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const roleGreetings = {
  student: { name: "Alex Johnson", subtitle: "B.Tech Computer Science — Semester 6" },
  faculty: { name: "Dr. Sarah Chen", subtitle: "Associate Professor — CS Department" },
  coordinator: { name: "Prof. Williams", subtitle: "Academic Coordinator — Engineering" },
};

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

const DashboardHeader = ({ title, description }: DashboardHeaderProps) => {
  const { role } = useRole();
  const user = roleGreetings[role];

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="gradient-primary rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsla(0,0%,100%,0.1),transparent)]" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <SidebarTrigger className="text-primary-foreground/80 hover:text-primary-foreground md:hidden" />
            <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">{title}</h1>
          </div>
          {description && <p className="text-primary-foreground/70 text-sm mb-1">{description}</p>}
          <p className="text-primary-foreground/60 text-xs">
            Welcome, {user.name} · {user.subtitle}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
