import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCard from "@/components/AnimatedCard";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Send, Plus, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/StatCard";

interface Request {
  id: number;
  title: string;
  to: string;
  status: "accepted" | "pending" | "rejected";
  time: string;
  project: string;
  timeline: { label: string; time: string; done: boolean }[];
}

const requestsData: Request[] = [
  {
    id: 1, title: "Mentorship for ML Project", to: "Dr. Ramesh Kumar", status: "accepted", time: "2h ago", project: "ML in Healthcare",
    timeline: [
      { label: "Request sent", time: "Jan 15, 10:30 AM", done: true },
      { label: "Faculty viewed", time: "Jan 15, 2:15 PM", done: true },
      { label: "Accepted", time: "Jan 16, 9:00 AM", done: true },
    ],
  },
  {
    id: 2, title: "Project Guidance Request", to: "Dr. Meena Sharma", status: "pending", time: "5h ago", project: "NLP Chatbot",
    timeline: [
      { label: "Request sent", time: "Mar 7, 11:00 AM", done: true },
      { label: "Faculty viewed", time: "Mar 7, 3:00 PM", done: true },
      { label: "Awaiting response", time: "—", done: false },
    ],
  },
  {
    id: 3, title: "Research Collaboration", to: "Dr. Priya Singh", status: "accepted", time: "1d ago", project: "Blockchain Auth",
    timeline: [
      { label: "Request sent", time: "Mar 5, 9:00 AM", done: true },
      { label: "Faculty viewed", time: "Mar 5, 11:30 AM", done: true },
      { label: "Accepted", time: "Mar 6, 10:00 AM", done: true },
    ],
  },
  {
    id: 4, title: "Thesis Supervision", to: "Dr. Anil Verma", status: "rejected", time: "2d ago", project: "IoT Smart Campus",
    timeline: [
      { label: "Request sent", time: "Mar 4, 8:00 AM", done: true },
      { label: "Faculty viewed", time: "Mar 4, 12:00 PM", done: true },
      { label: "Rejected — No available slots", time: "Mar 5, 9:00 AM", done: true },
    ],
  },
  {
    id: 5, title: "Lab Access Request", to: "Dr. Kavita Joshi", status: "pending", time: "3d ago", project: "AR Learning",
    timeline: [
      { label: "Request sent", time: "Mar 3, 2:00 PM", done: true },
      { label: "Awaiting faculty review", time: "—", done: false },
    ],
  },
  {
    id: 6, title: "Co-author Request", to: "Dr. Sanjay Patel", status: "pending", time: "4d ago", project: "Data Viz Dashboard",
    timeline: [
      { label: "Request sent", time: "Mar 2, 10:00 AM", done: true },
      { label: "Awaiting faculty review", time: "—", done: false },
    ],
  },
];

const statusConfig: Record<string, { icon: typeof CheckCircle; className: string; label: string }> = {
  accepted: { icon: CheckCircle, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", label: "Accepted" },
  pending: { icon: AlertCircle, className: "bg-primary/10 text-primary", label: "Pending" },
  rejected: { icon: XCircle, className: "bg-destructive/10 text-destructive", label: "Rejected" },
};

const Requests = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = filter === "all" ? requestsData : requestsData.filter((r) => r.status === filter);
  const accepted = requestsData.filter((r) => r.status === "accepted").length;
  const pending = requestsData.filter((r) => r.status === "pending").length;
  const rejected = requestsData.filter((r) => r.status === "rejected").length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold">Request Tracker</h1>
        <Button className="gap-2" onClick={() => navigate("/dashboard/requests/send")}>
          <Plus className="h-4 w-4" /> Send New Request
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={CheckCircle} title="Accepted" value={accepted} delay={0} trend={{ value: `${accepted}`, positive: true }} />
        <StatCard icon={Clock} title="Pending" value={pending} delay={0.1} />
        <StatCard icon={XCircle} title="Rejected" value={rejected} delay={0.2} />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((r, i) => {
            const config = statusConfig[r.status];
            const StatusIcon = config.icon;
            const isExpanded = expandedId === r.id;

            return (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <AnimatedCard className="cursor-pointer" delay={0}>
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="gradient-primary rounded-lg p-2">
                        <Send className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{r.title}</h3>
                        <p className="text-xs text-muted-foreground">To: {r.to} · Project: {r.project}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-11 sm:pl-0">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${config.className}`}>
                        <StatusIcon className="h-3 w-3" /> {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {r.time}
                      </span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-border pl-4">
                          <p className="text-xs font-medium text-muted-foreground mb-3">Request Timeline</p>
                          <div className="space-y-0">
                            {r.timeline.map((t, ti) => (
                              <motion.div
                                key={ti}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: ti * 0.1 }}
                                className="flex gap-3 relative"
                              >
                                {/* Vertical line */}
                                {ti < r.timeline.length - 1 && (
                                  <div className="absolute left-[7px] top-5 bottom-0 w-0.5 bg-border" />
                                )}
                                <div className={`relative z-10 mt-1 h-4 w-4 rounded-full shrink-0 flex items-center justify-center ${
                                  t.done ? "bg-primary" : "bg-muted border-2 border-border"
                                }`}>
                                  {t.done && <CheckCircle className="h-2.5 w-2.5 text-primary-foreground" />}
                                </div>
                                <div className="pb-4">
                                  <p className="text-sm font-medium">{t.label}</p>
                                  <p className="text-xs text-muted-foreground">{t.time}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </AnimatedCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-center py-10 text-muted-foreground text-sm">No requests match this filter.</p>
        )}
      </div>
    </div>
  );
};

export default Requests;
