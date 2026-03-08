import { motion } from "framer-motion";
import AnimatedCard from "@/components/AnimatedCard";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/StatCard";

const requests = [
  { id: 1, title: "Mentorship for ML Project", to: "Dr. Ramesh Kumar", status: "accepted", time: "2h ago", project: "ML in Healthcare" },
  { id: 2, title: "Project Guidance Request", to: "Dr. Meena Sharma", status: "pending", time: "5h ago", project: "NLP Chatbot" },
  { id: 3, title: "Research Collaboration", to: "Dr. Priya Singh", status: "accepted", time: "1d ago", project: "Blockchain Auth" },
  { id: 4, title: "Thesis Supervision", to: "Dr. Anil Verma", status: "rejected", time: "2d ago", project: "IoT Smart Campus" },
  { id: 5, title: "Lab Access Request", to: "Dr. Kavita Joshi", status: "pending", time: "3d ago", project: "AR Learning" },
  { id: 6, title: "Co-author Request", to: "Dr. Sanjay Patel", status: "pending", time: "4d ago", project: "Data Viz Dashboard" },
];

const statusConfig: Record<string, { icon: typeof CheckCircle; className: string; label: string }> = {
  accepted: { icon: CheckCircle, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", label: "Accepted" },
  pending: { icon: AlertCircle, className: "bg-primary/10 text-primary", label: "Pending" },
  rejected: { icon: XCircle, className: "bg-destructive/10 text-destructive", label: "Rejected" },
};

const Requests = () => {
  const accepted = requests.filter((r) => r.status === "accepted").length;
  const pending = requests.filter((r) => r.status === "pending").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Request Tracker</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={CheckCircle} title="Accepted" value={accepted} delay={0} />
        <StatCard icon={Clock} title="Pending" value={pending} delay={0.1} />
        <StatCard icon={XCircle} title="Rejected" value={rejected} delay={0.2} />
      </div>

      <div className="space-y-3">
        {requests.map((r, i) => {
          const config = statusConfig[r.status];
          const StatusIcon = config.icon;
          return (
            <AnimatedCard key={r.id} delay={i * 0.06} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;
