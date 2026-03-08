import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  delay?: number;
}

const StatCard = ({ title, value, subtitle, icon: Icon, trend, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -3, transition: { duration: 0.25 } }}
    className="glass-interactive rounded-xl p-5 flex flex-col gap-3 cursor-default"
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
      <div className="gradient-primary rounded-lg p-2 shadow-sm">
        <Icon className="h-4 w-4 text-primary-foreground" />
      </div>
    </div>
    <div>
      <motion.span
        className="font-display text-2xl font-bold"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
      >
        {value}
      </motion.span>
      {trend && (
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.3 }}
          className={`ml-2 text-xs font-medium ${trend.positive ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
        >
          {trend.positive ? "↑" : "↓"} {trend.value}
        </motion.span>
      )}
    </div>
    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
  </motion.div>
);

export default StatCard;
