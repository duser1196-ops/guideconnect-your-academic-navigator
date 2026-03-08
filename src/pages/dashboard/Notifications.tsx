import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, XCircle, Send, Info, CheckCheck, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotifications } from "@/hooks/useNotifications";
import AnimatedCard from "@/components/AnimatedCard";

const typeConfig: Record<string, { icon: typeof Bell; className: string; label: string }> = {
  request_sent: { icon: Send, className: "gradient-primary", label: "Request Sent" },
  request_accepted: { icon: CheckCircle, className: "bg-green-500", label: "Accepted" },
  request_rejected: { icon: XCircle, className: "bg-destructive", label: "Rejected" },
  info: { icon: Info, className: "bg-muted", label: "Info" },
};

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? notifications
    : filter === "unread"
    ? notifications.filter((n) => !n.read)
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="request_sent">Request Sent</SelectItem>
            <SelectItem value="request_accepted">Accepted</SelectItem>
            <SelectItem value="request_rejected">Rejected</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((n, i) => {
            const config = typeConfig[n.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <AnimatedCard
                  delay={0}
                  className={`flex items-start gap-3 cursor-pointer ${!n.read ? "border-l-2 border-l-primary" : ""}`}
                >
                  <div onClick={() => markAsRead(n.id)} className="flex items-start gap-3 flex-1">
                    <div className={`rounded-lg p-2 shrink-0 ${n.read ? "bg-muted" : config.className}`}>
                      <Icon className={`h-4 w-4 ${n.read ? "text-muted-foreground" : "text-primary-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${n.read ? "text-muted-foreground" : "font-medium"}`}>{n.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">{n.time}</p>
                        {!n.read && <span className="text-[10px] font-medium text-primary">New</span>}
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-center py-10 text-muted-foreground text-sm">No notifications match this filter.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
