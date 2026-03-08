import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, XCircle, Send, Info, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

const typeConfig: Record<string, { icon: typeof Bell; className: string }> = {
  request_sent: { icon: Send, className: "bg-primary/10 text-primary" },
  request_accepted: { icon: CheckCircle, className: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  request_rejected: { icon: XCircle, className: "bg-destructive/10 text-destructive" },
  info: { icon: Info, className: "bg-muted text-muted-foreground" },
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
        onClick={() => setOpen(!open)}
      >
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 4 }}
        >
          <Bell className="h-5 w-5" />
        </motion.div>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 rounded-xl border border-border bg-background shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-display font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs gap-1 h-7" onClick={markAllAsRead}>
                    <CheckCheck className="h-3 w-3" /> Mark all read
                  </Button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-6">No notifications yet</p>
                ) : (
                  notifications.slice(0, 6).map((n, i) => {
                    const config = typeConfig[n.type] || typeConfig.info;
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => markAsRead(n.id)}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border last:border-b-0 ${!n.is_read ? "bg-primary/5" : ""}`}
                      >
                        <div className={`rounded-lg p-1.5 shrink-0 mt-0.5 ${config.className}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-relaxed ${!n.is_read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                            {n.title}: {n.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">{formatTime(n.created_at)}</p>
                        </div>
                        {!n.is_read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                      </motion.div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-border px-4 py-2">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => { setOpen(false); navigate("/dashboard/notifications"); }}>
                  View all notifications
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
