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
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -3, boxShadow: "0 16px 48px hsla(239,84%,67%,0.1)" }}
    className="glass rounded-xl p-5 flex flex-col gap-3 cursor-default"
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
      <div className="gradient-primary rounded-lg p-2">
        <Icon className="h-4 w-4 text-primary-foreground" />
      </div>
    </div>
    <div>
      <span className="font-display text-2xl font-bold">{value}</span>
      {trend && (
        <span className={`ml-2 text-xs font-medium ${trend.positive ? "text-green-600" : "text-red-500"}`}>
          {trend.positive ? "↑" : "↓"} {trend.value}
        </span>
      )}
    </div>
    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
  </motion.div>
);

export default StatCard;
