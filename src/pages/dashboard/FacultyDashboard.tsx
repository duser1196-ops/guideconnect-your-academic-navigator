import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, FileText, Clock, CheckCircle, XCircle, Inbox, FolderKanban, ArrowRight } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import AnimatedCard from "@/components/AnimatedCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IncomingRequest {
  id: number;
  student: string;
  project: string;
  domain: string;
  message: string;
  time: string;
  status: "pending" | "accepted" | "rejected";
}

const initialRequests: IncomingRequest[] = [
  { id: 1, student: "Alex Johnson", project: "ML in Healthcare", domain: "Machine Learning", message: "I'd love to work on healthcare ML models under your guidance. I have experience with TensorFlow and PyTorch.", time: "2h ago", status: "pending" },
  { id: 2, student: "Maria Garcia", project: "NLP Chatbot System", domain: "Natural Language Processing", message: "Looking to build an intelligent chatbot using transformer models. Your NLP expertise would be invaluable.", time: "5h ago", status: "pending" },
  { id: 3, student: "James Lee", project: "Computer Vision for Agriculture", domain: "Computer Vision", message: "I want to use CV techniques for crop disease detection. I've completed your deep learning course.", time: "1d ago", status: "pending" },
  { id: 4, student: "Priya Sharma", project: "Data Mining Research", domain: "Data Science", message: "Interested in mining social media data for sentiment analysis. I have strong Python skills.", time: "1d ago", status: "pending" },
  { id: 5, student: "Ryan Kim", project: "Blockchain Security", domain: "Cybersecurity", message: "I'd like to explore blockchain vulnerabilities and build secure smart contracts.", time: "2d ago", status: "pending" },
];

const assignedProjects = [
  { id: 1, title: "ML in Healthcare", student: "Emily Davis", progress: 75, status: "In Progress", deadline: "Mar 2026" },
  { id: 2, title: "NLP Research Paper", student: "Sophie Brown", progress: 90, status: "Review", deadline: "Apr 2026" },
  { id: 3, title: "Computer Vision App", student: "David Wilson", progress: 40, status: "In Progress", deadline: "May 2026" },
  { id: 4, title: "Data Mining Project", student: "Anna White", progress: 100, status: "Completed", deadline: "Feb 2026" },
];

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  "In Progress": "default",
  Review: "secondary",
  Completed: "outline",
};

const FacultyDashboard = () => {
  const [requests, setRequests] = useState(initialRequests);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const acceptedCount = requests.filter((r) => r.status === "accepted").length;

  const handleAccept = (id: number) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "accepted" as const } : r)));
    const req = requests.find((r) => r.id === id);
    toast({ title: "Request Accepted ✓", description: `You accepted ${req?.student}'s request for "${req?.project}".` });
  };

  const handleReject = (id: number) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r)));
    const req = requests.find((r) => r.id === id);
    toast({ title: "Request Declined", description: `You declined ${req?.student}'s request.` });
  };

  return (
    <div>
      <DashboardHeader title="Faculty Dashboard" description="Manage your students and research projects." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Inbox} title="Total Requests" value={requests.length} subtitle={`${pendingCount} need action`} delay={0} />
        <StatCard icon={CheckCircle} title="Accepted Students" value={acceptedCount + 4} subtitle="Across all projects" delay={0.1} trend={{ value: `${acceptedCount} new`, positive: true }} />
        <StatCard icon={Clock} title="Pending Requests" value={pendingCount} subtitle="Awaiting your review" delay={0.2} />
        <StatCard icon={FolderKanban} title="Available Slots" value={Math.max(0, 3 - acceptedCount)} subtitle="Out of 3 total" delay={0.3} />
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="bg-muted/50 backdrop-blur-sm">
          <TabsTrigger value="requests" className="data-[state=active]:bg-background">
            <Inbox className="h-4 w-4 mr-2" /> Incoming Requests
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-background">
            <FolderKanban className="h-4 w-4 mr-2" /> Assigned Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {requests.map((r, i) => (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                >
                  <AnimatedCard className="relative overflow-hidden">
                    {r.status !== "pending" && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <Badge variant={r.status === "accepted" ? "default" : "secondary"} className="text-sm px-4 py-1.5">
                          {r.status === "accepted" ? "✓ Accepted" : "✗ Declined"}
                        </Badge>
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="gradient-primary rounded-full h-11 w-11 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-semibold">{r.student}</h4>
                          <Badge variant="outline" className="text-xs">{r.domain}</Badge>
                          <span className="text-xs text-muted-foreground ml-auto">{r.time}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground/90 flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" /> {r.project}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{r.message}</p>
                        {r.status === "pending" && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex gap-2 pt-2"
                          >
                            <Button size="sm" onClick={() => handleAccept(r.id)} className="gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(r.id)} className="gap-1.5">
                              <XCircle className="h-3.5 w-3.5" /> Decline
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <div className="grid md:grid-cols-2 gap-4">
            {assignedProjects.map((p, i) => (
              <AnimatedCard key={p.id} delay={i * 0.08}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-display font-semibold">{p.title}</h4>
                    <p className="text-sm text-muted-foreground">{p.student}</p>
                  </div>
                  <Badge variant={statusVariant[p.status] || "outline"}>{p.status}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full gradient-primary"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${p.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Deadline: {p.deadline}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacultyDashboard;
