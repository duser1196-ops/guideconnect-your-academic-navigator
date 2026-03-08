import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCard from "@/components/AnimatedCard";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Send, Plus, Filter, Ban, Users, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

interface StudentRequest {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  faculty: { name: string; department: string | null } | null;
  project: { title: string } | null;
}

interface FacultyRequest {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  student: { name: string } | null;
  project: { title: string; domain: string | null } | null;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; className: string; label: string }> = {
  accepted: { icon: CheckCircle, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", label: "Accepted" },
  pending: { icon: AlertCircle, className: "bg-primary/10 text-primary", label: "Pending" },
  rejected: { icon: XCircle, className: "bg-destructive/10 text-destructive", label: "Rejected" },
  cancelled: { icon: Ban, className: "bg-muted text-muted-foreground", label: "Cancelled" },
};

const Requests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([]);
  const [facultyRequests, setFacultyRequests] = useState<FacultyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const isStudent = user?.role === "student";

  const fetchRequests = useCallback(async () => {
    if (!user) return;

    if (isStudent) {
      const { data } = await supabase
        .from("guide_requests")
        .select("id, status, message, created_at, faculty:users!guide_requests_faculty_id_fkey(name, department), project:projects!guide_requests_project_id_fkey(title)")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
      setStudentRequests((data as any) || []);
    } else {
      const { data } = await supabase
        .from("guide_requests")
        .select("id, status, message, created_at, student:users!guide_requests_student_id_fkey(name), project:projects!guide_requests_project_id_fkey(title, domain)")
        .eq("faculty_id", user.id)
        .order("created_at", { ascending: false });
      setFacultyRequests((data as any) || []);
    }

    setLoading(false);
  }, [user, isStudent]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('requests-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guide_requests' }, () => {
        fetchRequests();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchRequests]);

  const handleCancel = async (id: string) => {
    const { error } = await supabase
      .from("guide_requests")
      .update({ status: "cancelled" as any })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request Cancelled", description: "Your request has been cancelled." });
      fetchRequests();
    }
  };

  const handleAccept = async (id: string) => {
    // Check capacity
    const { data: profile } = await supabase.from("users").select("max_students").eq("id", user!.id).single();
    const { count } = await supabase.from("assignments").select("id", { count: "exact", head: true }).eq("faculty_id", user!.id);
    const maxStudents = profile?.max_students || 5;

    if ((count || 0) >= maxStudents) {
      toast({ title: "Capacity Reached", description: "You have reached your maximum student capacity.", variant: "destructive" });
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
      fetchRequests();
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
      fetchRequests();
    }
  };

  if (loading) return <DashboardSkeleton />;

  // ============ STUDENT VIEW ============
  if (isStudent) {
    const filtered = filter === "all" ? studentRequests : studentRequests.filter((r) => r.status === filter);
    const accepted = studentRequests.filter((r) => r.status === "accepted").length;
    const pending = studentRequests.filter((r) => r.status === "pending").length;
    const rejected = studentRequests.filter((r) => r.status === "rejected").length;

    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="font-display text-2xl font-bold">Request Tracker</h1>
          <Button className="gap-2" onClick={() => navigate("/dashboard/requests/send")}>
            <Plus className="h-4 w-4" /> Send New Request
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard icon={CheckCircle} title="Accepted" value={accepted} delay={0} trend={accepted > 0 ? { value: `${accepted}`, positive: true } : undefined} />
          <StatCard icon={Clock} title="Pending" value={pending} delay={0.1} />
          <StatCard icon={XCircle} title="Rejected" value={rejected} delay={0.2} />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((r, i) => {
              const config = statusConfig[r.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              return (
                <motion.div key={r.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                  <AnimatedCard delay={0}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="gradient-primary rounded-lg p-2"><Send className="h-4 w-4 text-primary-foreground" /></div>
                        <div>
                          <h3 className="text-sm font-semibold">{r.project?.title || "Project"}</h3>
                          <p className="text-xs text-muted-foreground">To: {r.faculty?.name || "Faculty"} · {r.faculty?.department || ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pl-11 sm:pl-0">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${config.className}`}>
                          <StatusIcon className="h-3 w-3" /> {config.label}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {new Date(r.created_at).toLocaleDateString()}
                        </span>
                        {r.status === "pending" && (
                          <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => handleCancel(r.id)}>Cancel</Button>
                        )}
                      </div>
                    </div>
                    {r.message && <p className="text-xs text-muted-foreground mt-2 pl-11">"{r.message}"</p>}
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && <p className="text-center py-10 text-muted-foreground text-sm">No requests found.</p>}
        </div>
      </div>
    );
  }

  // ============ FACULTY VIEW ============
  const pendingFaculty = facultyRequests.filter((r) => r.status === "pending");
  const allFiltered = filter === "all" ? facultyRequests : facultyRequests.filter((r) => r.status === filter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold">Student Requests</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Inbox} title="Pending" value={pendingFaculty.length} subtitle="Awaiting your review" delay={0} />
        <StatCard icon={CheckCircle} title="Accepted" value={facultyRequests.filter((r) => r.status === "accepted").length} delay={0.1} />
        <StatCard icon={XCircle} title="Rejected" value={facultyRequests.filter((r) => r.status === "rejected").length} delay={0.2} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {allFiltered.map((r, i) => {
            const config = statusConfig[r.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <motion.div key={r.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                <AnimatedCard delay={0}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="gradient-primary rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{r.student?.name || "Student"}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> {r.project?.title || "Project"}</p>
                        {r.project?.domain && <Badge variant="outline" className="text-[10px] mt-1">{r.project.domain}</Badge>}
                        {r.message && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">"{r.message}"</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-13 sm:pl-0">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${config.className}`}>
                        <StatusIcon className="h-3 w-3" /> {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {r.status === "pending" && (
                    <div className="flex gap-2 mt-3 pl-13">
                      <Button size="sm" onClick={() => handleAccept(r.id)} className="gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(r.id)} className="gap-1.5">
                        <XCircle className="h-3.5 w-3.5" /> Decline
                      </Button>
                    </div>
                  )}
                </AnimatedCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {allFiltered.length === 0 && <p className="text-center py-10 text-muted-foreground text-sm">No requests found.</p>}
      </div>
    </div>
  );
};

export default Requests;
