import AnimatedCard from "@/components/AnimatedCard";
import { Bell, CheckCircle } from "lucide-react";

const notifications = [
  { msg: "Dr. Chen accepted your mentorship request", time: "1h ago", read: false },
  { msg: "Project deadline updated for ML Healthcare", time: "3h ago", read: false },
  { msg: "New research paper available in your area", time: "1d ago", read: true },
  { msg: "Meeting reminder: Tomorrow at 2:00 PM", time: "1d ago", read: true },
  { msg: "Your project proposal was approved", time: "2d ago", read: true },
];

const Notifications = () => (
  <div>
    <h1 className="font-display text-2xl font-bold mb-6">Notifications</h1>
    <div className="space-y-3">
      {notifications.map((n, i) => (
        <AnimatedCard key={i} delay={i * 0.08} className={`flex items-center gap-3 ${!n.read ? "border-l-2 border-l-primary" : ""}`}>
          <div className={`rounded-lg p-2 ${n.read ? "bg-muted" : "gradient-primary"}`}>
            {n.read ? <CheckCircle className="h-4 w-4 text-muted-foreground" /> : <Bell className="h-4 w-4 text-primary-foreground" />}
          </div>
          <div className="flex-1">
            <p className={`text-sm ${n.read ? "text-muted-foreground" : "font-medium"}`}>{n.msg}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
          </div>
        </AnimatedCard>
      ))}
    </div>
  </div>
);

export default Notifications;
