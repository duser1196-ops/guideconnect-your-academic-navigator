import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, XCircle, Send, Info, CheckCheck, Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotifications } from "@/hooks/useNotifications";
import AnimatedCard from "@/components/AnimatedCard";

const typeConfig: Record<string, { icon: typeof Bell; className: string; label: string }> = {
  request_sent: { icon: Send, className: "gradient-primary", label: "Request Sent" },
  request_accepted: { icon: CheckCircle, className: "bg-green-500", label: "Accepted" },
  request_rejected: { icon: XCircle, className: "bg-destructive", label: "Rejected" },
  assignment: { icon: CheckCircle, className: "bg-green-500", label: "Assignment" },
  announcement: { icon: Bell, className: "gradient-primary", label: "Announcement" },
  info: { icon: Info, className: "bg-muted", label: "Info" },
};

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState("all");

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const filtered = filter === "all"
    ? notifications
    : filter === "unread"
    ? notifications.filter((n) => !n.is_read)
    : notifications.filter((n) => n.type === filter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="request_sent">Requests</SelectItem>
            <SelectItem value="request_accepted">Accepted</SelectItem>
            <SelectItem value="request_rejected">Rejected</SelectItem>
            <SelectItem value="assignment">Assignments</SelectItem>
            <SelectItem value="announcement">Announcements</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((n, i) => {
            const config = typeConfig[n.type] || typeConfig.info;
            const Icon = config.icon;
            return (
              <motion.div key={n.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3, delay: i * 0.04 }}>
                <AnimatedCard delay={0} className={`flex items-start gap-3 ${!n.is_read ? "border-l-2 border-l-primary" : ""}`}>
                  <div onClick={() => markAsRead(n.id)} className="flex items-start gap-3 flex-1 cursor-pointer">
                    <div className={`rounded-lg p-2 shrink-0 ${n.is_read ? "bg-muted" : config.className}`}>
                      <Icon className={`h-4 w-4 ${n.is_read ? "text-muted-foreground" : "text-primary-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${n.is_read ? "text-muted-foreground" : ""}`}>{n.title}</p>
                      <p className={`text-sm leading-relaxed ${n.is_read ? "text-muted-foreground" : ""}`}>{n.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">{formatTime(n.created_at)}</p>
                        {!n.is_read && <span className="text-[10px] font-medium text-primary">New</span>}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => deleteNotification(n.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AnimatedCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-center py-10 text-muted-foreground text-sm">No notifications found.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
