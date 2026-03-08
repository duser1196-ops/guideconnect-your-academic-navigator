import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, UserX, Link2 } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import AnimatedCard from "@/components/AnimatedCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

interface FacultyInfo {
  id: string;
  name: string;
  department: string | null;
  max_students: number;
  assignedCount: number;
  students: { name: string; registration_number: string | null; projectTitle: string }[];
}

interface UnassignedStudent {
  id: string;
  name: string;
  projectId: string;
  projectTitle: string;
}

const FacultyAllocation = () => {
  const { user } = useAuth();
  const [faculty, setFaculty] = useState<FacultyInfo[]>([]);
  const [unassigned, setUnassigned] = useState<UnassignedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; studentId?: string; projectId?: string; studentName?: string }>({ open: false });
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    if (!user) return;

    const { data: sections } = await supabase
      .from("coordinator_sections")
      .select("department, section")
      .eq("coordinator_id", user.id);

    if (!sections || sections.length === 0) { setLoading(false); return; }
    const sec = sections[0];

    // Get faculty in department
    const { data: facultyData } = await supabase
      .from("users")
      .select("id, name, department, max_students")
      .eq("role", "faculty")
      .eq("department", sec.department);

    const enrichedFaculty: FacultyInfo[] = await Promise.all(
      (facultyData || []).map(async (f) => {
        const { data: asgData } = await supabase
          .from("assignments")
          .select("student:users!assignments_student_id_fkey(name, registration_number), project:projects!assignments_project_id_fkey(title)")
          .eq("faculty_id", f.id);

        return {
          ...f,
          max_students: f.max_students || 5,
          assignedCount: asgData?.length || 0,
          students: (asgData || []).map((a: any) => ({
            name: a.student?.name || "",
            registration_number: a.student?.registration_number || null,
            projectTitle: a.project?.title || "",
          })),
        };
      })
    );
    setFaculty(enrichedFaculty);

    // Get students without assignment who have a project
    const { data: sectionStudents } = await supabase
      .from("users")
      .select("id, name")
      .eq("role", "student")
      .eq("department", sec.department)
      .eq("section", sec.section);

    const unassignedList: UnassignedStudent[] = [];
    for (const s of sectionStudents || []) {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, title, status")
        .eq("student_id", s.id)
        .in("status", ["draft", "request_sent"])
        .limit(1);

      if (projects && projects.length > 0) {
        const { count } = await supabase
          .from("assignments")
          .select("id", { count: "exact", head: true })
          .eq("student_id", s.id);
        if (!count || count === 0) {
          unassignedList.push({ id: s.id, name: s.name, projectId: projects[0].id, projectTitle: projects[0].title });
        }
      }
    }
    setUnassigned(unassignedList);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const totalAssigned = faculty.reduce((sum, f) => sum + f.assignedCount, 0);
  const totalCapacity = faculty.reduce((sum, f) => sum + f.max_students, 0);

  const handleOverrideAssign = async () => {
    if (!assignDialog.studentId || !assignDialog.projectId || !selectedFaculty || !user) return;
    setAssigning(true);

    // Create assignment
    const { error: asgError } = await supabase.from("assignments").insert({
      project_id: assignDialog.projectId,
      student_id: assignDialog.studentId,
      faculty_id: selectedFaculty,
      assigned_by: user.id,
    });

    if (asgError) {
      toast({ title: "Error", description: asgError.message, variant: "destructive" });
      setAssigning(false);
      return;
    }

    // Update project status
    await supabase.from("projects").update({ status: "assigned" as any }).eq("id", assignDialog.projectId);

    // Cancel any pending requests for this project
    await supabase
      .from("guide_requests")
      .update({ status: "cancelled" as any })
      .eq("project_id", assignDialog.projectId)
      .eq("status", "pending");

    // Notify student and faculty
    await supabase.from("notifications").insert([
      {
        user_id: assignDialog.studentId,
        title: "Faculty Assigned",
        message: "Coordinator assigned a faculty guide for your project.",
        type: "assignment",
      },
      {
        user_id: selectedFaculty,
        title: "New Student Assignment",
        message: "You have been assigned as a guide for a student project.",
        type: "assignment",
      },
    ]);

    toast({ title: "Assignment Created", description: `Faculty assigned to ${assignDialog.studentName}'s project.` });
    setAssignDialog({ open: false });
    setSelectedFaculty("");
    setAssigning(false);
    fetchData();
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <DashboardHeader title="Faculty Allocation" description="Monitor faculty workload and manage assignments." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Users} title="Total Faculty" value={faculty.length} subtitle="In your department" delay={0} />
        <StatCard icon={UserCheck} title="Students Assigned" value={totalAssigned} subtitle={`of ${totalCapacity} capacity`} delay={0.1} trend={totalCapacity > 0 ? { value: `${Math.round((totalAssigned / totalCapacity) * 100)}%`, positive: true } : undefined} />
        <StatCard icon={UserX} title="Without Guide" value={unassigned.length} subtitle="Need assignment" delay={0.2} trend={unassigned.length > 0 ? { value: `${unassigned.length}`, positive: false } : undefined} />
      </div>

      {/* Unassigned students with override */}
      {unassigned.length > 0 && (
        <AnimatedCard className="mb-6">
          <h3 className="font-display font-semibold mb-3">Students Without Guide</h3>
          <div className="space-y-2">
            {unassigned.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.projectTitle}</p>
                </div>
                <Dialog open={assignDialog.open && assignDialog.studentId === s.id} onOpenChange={(open) => {
                  setAssignDialog(open ? { open, studentId: s.id, projectId: s.projectId, studentName: s.name } : { open: false });
                  if (!open) setSelectedFaculty("");
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Link2 className="h-3.5 w-3.5" /> Assign Faculty
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Faculty to {s.name}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground mb-4">Project: {s.projectTitle}</p>
                    <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                      <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
                      <SelectContent>
                        {faculty.filter(f => f.assignedCount < f.max_students).map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name} ({f.assignedCount}/{f.max_students})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleOverrideAssign} disabled={!selectedFaculty || assigning} className="mt-4 w-full">
                      {assigning ? "Assigning…" : "Confirm Assignment"}
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </AnimatedCard>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {faculty.map((f, i) => (
          <AnimatedCard key={f.id} delay={i * 0.08}>
            <div className="flex items-center gap-3 mb-4">
              <div className="gradient-primary rounded-full h-10 w-10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-display font-semibold">{f.name}</h4>
                <p className="text-xs text-muted-foreground">{f.department} Department</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Capacity</span>
                <span>{f.assignedCount} / {f.max_students}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <motion.div className="h-full rounded-full gradient-primary" initial={{ width: 0 }} whileInView={{ width: `${(f.assignedCount / f.max_students) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }} />
              </div>
              <p className="text-xs text-muted-foreground">{f.max_students - f.assignedCount} slots available</p>
            </div>

            {f.students.length > 0 && (
              <div className="border-t border-border pt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Assigned Students</p>
                {f.students.map((s, si) => (
                  <div key={si} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium">{s.name}</span>
                      {s.registration_number && <span className="text-muted-foreground ml-1.5">({s.registration_number})</span>}
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{s.projectTitle}</Badge>
                  </div>
                ))}
              </div>
            )}
          </AnimatedCard>
        ))}
        {faculty.length === 0 && (
          <p className="text-center py-10 text-muted-foreground text-sm col-span-3">No faculty found in your department.</p>
        )}
      </div>
    </div>
  );
};

export default FacultyAllocation;
