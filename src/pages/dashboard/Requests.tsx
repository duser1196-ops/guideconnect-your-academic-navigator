import AnimatedCard from "@/components/AnimatedCard";
import { FileText, Clock } from "lucide-react";

const requests = [
  { title: "Mentorship Request", from: "Alex Johnson", status: "pending", time: "2h ago" },
  { title: "Project Approval", from: "Maria Garcia", status: "approved", time: "1d ago" },
  { title: "Meeting Schedule", from: "James Lee", status: "pending", time: "3h ago" },
  { title: "Resource Access", from: "Priya Sharma", status: "rejected", time: "2d ago" },
];

const statusClasses: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-destructive/10 text-destructive",
};

const Requests = () => (
  <div>
    <h1 className="font-display text-2xl font-bold mb-6">Requests</h1>
    <div className="space-y-3">
      {requests.map((r, i) => (
        <AnimatedCard key={r.title + r.from} delay={i * 0.08} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="gradient-primary rounded-lg p-2"><FileText className="h-4 w-4 text-primary-foreground" /></div>
            <div>
              <h3 className="text-sm font-semibold">{r.title}</h3>
              <p className="text-xs text-muted-foreground">From: {r.from}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusClasses[r.status]}`}>{r.status}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{r.time}</span>
          </div>
        </AnimatedCard>
      ))}
    </div>
  </div>
);

export default Requests;
