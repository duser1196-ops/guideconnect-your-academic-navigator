import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, FileText, Clock, CheckCircle, XCircle, Inbox, FolderKanban } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import AnimatedCard from "@/components/AnimatedCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

interface GuideRequest {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  student: { name: string } | null;
  project: { title: string; domain: string | null; status: string } | null;
}

interface AssignedProject {
  id: string;
  project: { id: string; title: string; domain: string | null; status: string } | null;
  student: { name: string } | null;
  created_at: string;
}

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<GuideRequest[]>([]);
  const [assignments, setAssignments] = useState<AssignedProject[]>([]);
  const [maxStudents, setMaxStudents] = useState(5);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    const [reqRes, assignRes, profileRes] = await Promise.all([
      supabase
        .from("guide_requests")
        .select("id, status, message, created_at, student:users!guide_requests_student_id_fkey(name), project:projects!guide_requests_project_id_fkey(title, domain, status)")
        .eq("faculty_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("assignments")
        .select("id, created_at, project:projects!assignments_project_id_fkey(id, title, domain, status), student:users!assignments_student_id_fkey(name)")
        .eq("faculty_id", user.id),
      supabase
        .from("users")
        .select("max_students")
        .eq("id", user.id)
        .single(),
    ]);

    setRequests((reqRes.data as any) || []);
    setAssignments((assignRes.data as any) || []);
    if (profileRes.data) setMaxStudents(profileRes.data.max_students || 5);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const assignedCount = assignments.length;
  const availableSlots = Math.max(0, maxStudents - assignedCount);
  const capacityReached = availableSlots <= 0;

  const handleAccept = async (id: string) => {
    if (capacityReached) {
      toast({ title: "Capacity Reached", description: "You cannot accept more students. Your max capacity has been reached.", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("guide_requests")
      .update({ status: "accepted" as any })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request Accepted ✓", description: "The student has been notified." });
      fetchData();
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("guide_requests")
      .update({ status: "rejected" as any })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request Declined", description: "The student has been notified." });
      fetchData();
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <DashboardHeader title="Faculty Dashboard" description="Manage your students and research projects." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Inbox} title="Pending Requests" value={pendingRequests.length} subtitle="Awaiting your review" delay={0} />
        <StatCard icon={CheckCircle} title="Assigned Students" value={assignedCount} subtitle={`of ${maxStudents} max`} delay={0.1} />
        <StatCard icon={FolderKanban} title="Available Slots" value={availableSlots} subtitle={capacityReached ? "Capacity reached" : "Open for students"} delay={0.2} />
        <StatCard icon={Clock} title="Total Requests" value={requests.length} subtitle="All time" delay={0.3} />
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
            {pendingRequests.length === 0 && (
              <p className="text-center py-10 text-muted-foreground text-sm">No pending requests.</p>
            )}
            <AnimatePresence mode="popLayout">
              {pendingRequests.map((r, i) => (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                >
                  <AnimatedCard className="relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="gradient-primary rounded-full h-11 w-11 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-semibold">{r.student?.name || "Student"}</h4>
                          {r.project?.domain && <Badge variant="outline" className="text-xs">{r.project.domain}</Badge>}
                          <span className="text-xs text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground/90 flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" /> {r.project?.title || "Project"}
                        </p>
                        {r.message && <p className="text-sm text-muted-foreground leading-relaxed">{r.message}</p>}
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex gap-2 pt-2"
                        >
                          <Button size="sm" onClick={() => handleAccept(r.id)} className="gap-1.5" disabled={capacityReached}>
                            <CheckCircle className="h-3.5 w-3.5" /> {capacityReached ? "Full" : "Accept"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(r.id)} className="gap-1.5">
                            <XCircle className="h-3.5 w-3.5" /> Decline
                          </Button>
                        </motion.div>
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
            {assignments.length === 0 && (
              <p className="text-center py-10 text-muted-foreground text-sm col-span-2">No assigned projects yet.</p>
            )}
            {assignments.map((a, i) => (
              <AnimatedCard key={a.id} delay={i * 0.08}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-display font-semibold">{a.project?.title || "Project"}</h4>
                    <p className="text-sm text-muted-foreground">{a.student?.name || "Student"}</p>
                  </div>
                  <Badge variant="default">{a.project?.status || "assigned"}</Badge>
                </div>
                {a.project?.domain && (
                  <p className="text-xs text-muted-foreground">Domain: {a.project.domain}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Assigned: {new Date(a.created_at).toLocaleDateString()}</p>
              </AnimatedCard>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacultyDashboard;
