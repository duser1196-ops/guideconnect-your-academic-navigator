import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, XCircle, Send, Info, CheckCheck, Filter, Trash2, Clock, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

const typeConfig: Record<string, { icon: typeof Bell; gradient: string; bg: string; label: string }> = {
  request_sent: { icon: Send, gradient: "from-indigo-500 to-purple-500", bg: "bg-indigo-50 dark:bg-indigo-950/40", label: "Request Sent" },
  request_accepted: { icon: CheckCircle, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-950/40", label: "Accepted" },
  request_rejected: { icon: XCircle, gradient: "from-rose-500 to-red-500", bg: "bg-rose-50 dark:bg-rose-950/40", label: "Rejected" },
  assignment: { icon: CheckCircle, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-950/40", label: "Assignment" },
  announcement: { icon: Bell, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-950/40", label: "Announcement" },
  info: { icon: Info, gradient: "from-sky-500 to-blue-500", bg: "bg-sky-50 dark:bg-sky-950/40", label: "Info" },
};

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const filtered = filter === "all"
    ? notifications
    : filter === "unread"
    ? notifications.filter((n) => !n.is_read)
    : notifications.filter((n) => n.type === filter);

  const handleClick = (n: { id: string; is_read: boolean; type: string }) => {
    if (!n.is_read) markAsRead(n.id);
    if (n.type.startsWith("request")) navigate("/dashboard/requests");
    else if (n.type === "assignment") navigate("/dashboard/projects");
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2.5">
            <div className="gradient-primary rounded-xl p-2">
              <Bell className="h-5 w-5 text-primary-foreground" />
            </div>
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        )}
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-muted/30 border border-border/40"
      >
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] rounded-lg border-border/50 bg-background/80">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Notifications</SelectItem>
            <SelectItem value="unread">Unread Only</SelectItem>
            <SelectItem value="request_sent">Requests Sent</SelectItem>
            <SelectItem value="request_accepted">Accepted</SelectItem>
            <SelectItem value="request_rejected">Rejected</SelectItem>
            <SelectItem value="assignment">Assignments</SelectItem>
            <SelectItem value="announcement">Announcements</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
        </span>
      </motion.div>

      {/* Notification List */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {filtered.map((n, i) => {
            const config = typeConfig[n.type] || typeConfig.info;
            const Icon = config.icon;
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <div
                  className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    !n.is_read
                      ? "bg-background border-primary/20 shadow-sm"
                      : "bg-background/60 border-border/40 hover:border-border/60"
                  }`}
                >
                  {/* Left accent */}
                  {!n.is_read && (
                    <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-primary" />
                  )}

                  {/* Icon */}
                  <div
                    onClick={() => handleClick(n)}
                    className={`shrink-0 rounded-xl p-2.5 bg-gradient-to-br ${config.gradient} shadow-sm cursor-pointer`}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0" onClick={() => handleClick(n)}>
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-tight ${!n.is_read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wide">
                          New
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${!n.is_read ? "text-foreground/70" : "text-muted-foreground/70"}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-[11px] text-muted-foreground/60">{formatTime(n.created_at)}</span>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${config.bg} font-medium`}>
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-xl text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="rounded-2xl bg-muted/50 p-5 mb-4">
              <Inbox className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No notifications found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {filter !== "all" ? "Try changing your filter" : "You're all caught up!"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
