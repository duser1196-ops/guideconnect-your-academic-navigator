import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, XCircle, Send, Info, CheckCheck, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

const typeConfig: Record<string, { icon: typeof Bell; gradient: string; bg: string }> = {
  request_sent: { icon: Send, gradient: "from-indigo-500 to-purple-500", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
  request_accepted: { icon: CheckCircle, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  request_rejected: { icon: XCircle, gradient: "from-rose-500 to-red-500", bg: "bg-rose-50 dark:bg-rose-950/40" },
  assignment: { icon: CheckCircle, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  announcement: { icon: Bell, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-950/40" },
  info: { icon: Info, gradient: "from-sky-500 to-blue-500", bg: "bg-sky-50 dark:bg-sky-950/40" },
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

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

  const handleNotificationClick = (n: { id: string; is_read: boolean; type: string }) => {
    if (!n.is_read) markAsRead(n.id);
    // Navigate to related page based on type
    if (n.type === "request_sent" || n.type === "request_accepted" || n.type === "request_rejected") {
      setOpen(false);
      navigate("/dashboard/requests");
    } else if (n.type === "assignment") {
      setOpen(false);
      navigate("/dashboard/projects");
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-xl transition-all duration-200"
        onClick={() => setOpen(!open)}
      >
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 5 }}
        >
          <Bell className="h-5 w-5" />
        </motion.div>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center shadow-lg ring-2 ring-background"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-3 w-[340px] sm:w-[400px] z-50 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <h3 className="font-display font-semibold text-base">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1.5 h-8 rounded-lg text-muted-foreground hover:text-primary"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </Button>
              )}
            </div>

            {/* Notification List */}
            <ScrollArea className="max-h-[380px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="rounded-full bg-muted p-4 mb-3">
                    <Bell className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">We'll notify you when something arrives</p>
                </div>
              ) : (
                <div className="py-1">
                  {notifications.slice(0, 8).map((n, i) => {
                    const config = typeConfig[n.type] || typeConfig.info;
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        onClick={() => handleNotificationClick(n)}
                        className={`group flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-all duration-200 hover:bg-muted/50 relative ${
                          !n.is_read ? "bg-primary/[0.03]" : ""
                        }`}
                      >
                        {/* Unread indicator line */}
                        {!n.is_read && (
                          <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-primary" />
                        )}

                        {/* Icon */}
                        <div className={`shrink-0 rounded-xl p-2 bg-gradient-to-br ${config.gradient} shadow-sm mt-0.5`}>
                          <Icon className="h-3.5 w-3.5 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] leading-tight ${
                            !n.is_read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                          }`}>
                            {n.title}
                          </p>
                          <p className={`text-xs mt-0.5 leading-relaxed line-clamp-2 ${
                            !n.is_read ? "text-foreground/70" : "text-muted-foreground/70"
                          }`}>
                            {n.message}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground/50" />
                            <span className="text-[11px] text-muted-foreground/60">{formatTime(n.created_at)}</span>
                          </div>
                        </div>

                        {/* Unread dot */}
                        {!n.is_read && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-1.5 shadow-sm shadow-primary/30" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-border/50 p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs gap-1.5 rounded-xl h-9 text-muted-foreground hover:text-primary"
                  onClick={() => { setOpen(false); navigate("/dashboard/notifications"); }}
                >
                  View all notifications <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
