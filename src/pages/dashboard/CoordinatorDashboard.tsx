import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserCheck, UserX, FolderKanban, Search, Download, Filter,
  AlertCircle, BarChart3, GraduationCap,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import AnimatedCard from "@/components/AnimatedCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

interface Student {
  id: number;
  name: string;
  roll: string;
  project: string;
  faculty: string | null;
  status: "In Progress" | "Not Started" | "Completed" | "Review";
}

const students: Student[] = [
  { id: 1, name: "Alex Johnson", roll: "CS2021001", project: "ML in Healthcare", faculty: "Dr. Ramesh", status: "In Progress" },
  { id: 2, name: "Maria Garcia", roll: "CS2021002", project: "NLP Chatbot", faculty: "Dr. Meena", status: "In Progress" },
  { id: 3, name: "James Lee", roll: "CS2021003", project: "Computer Vision App", faculty: null, status: "Not Started" },
  { id: 4, name: "Priya Sharma", roll: "CS2021004", project: "Data Mining Research", faculty: "Dr. Ramesh", status: "Completed" },
  { id: 5, name: "Ryan Kim", roll: "CS2021005", project: "Blockchain Security", faculty: null, status: "Not Started" },
  { id: 6, name: "Emily Davis", roll: "CS2021006", project: "IoT Dashboard", faculty: "Dr. Suresh", status: "Review" },
  { id: 7, name: "Sophie Brown", roll: "CS2021007", project: "Cloud Migration Tool", faculty: "Dr. Meena", status: "In Progress" },
  { id: 8, name: "David Wilson", roll: "CS2021008", project: "Mobile Health App", faculty: null, status: "Not Started" },
  { id: 9, name: "Anna White", roll: "CS2021009", project: "AI Tutor System", faculty: "Dr. Suresh", status: "Review" },
  { id: 10, name: "Tom Harris", roll: "CS2021010", project: "E-commerce Platform", faculty: "Dr. Ramesh", status: "In Progress" },
];

const facultyOverview = [
  { name: "Dr. Ramesh", department: "CSE", assigned: 3, capacity: 5 },
  { name: "Dr. Meena", department: "CSE", assigned: 2, capacity: 4 },
  { name: "Dr. Suresh", department: "CSE", assigned: 2, capacity: 4 },
];

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  "In Progress": "default",
  Review: "secondary",
  Completed: "outline",
  "Not Started": "destructive",
};

const CoordinatorDashboard = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const withGuide = students.filter((s) => s.faculty !== null).length;
  const withoutGuide = students.length - withGuide;

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll.toLowerCase().includes(search.toLowerCase()) ||
        s.project.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const handleExport = () => {
    toast({ title: "Export Started", description: "Student data CSV is being prepared for download." });
  };

  return (
    <div>
      <DashboardHeader title="Coordinator Dashboard" description="Manage your section's students and faculty assignments." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} title="Total Students" value={students.length} subtitle="Section A — CSE" delay={0} />
        <StatCard icon={UserX} title="Without Guide" value={withoutGuide} subtitle="Need assignment" delay={0.1} trend={{ value: `${withoutGuide}`, positive: false }} />
        <StatCard icon={UserCheck} title="With Guide" value={withGuide} subtitle="Assigned faculty" delay={0.2} trend={{ value: `${Math.round((withGuide / students.length) * 100)}%`, positive: true }} />
        <StatCard icon={FolderKanban} title="Active Projects" value={students.filter((s) => s.status === "In Progress").length} subtitle="Currently running" delay={0.3} />
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="bg-muted/50 backdrop-blur-sm">
          <TabsTrigger value="students" className="data-[state=active]:bg-background">
            <GraduationCap className="h-4 w-4 mr-2" /> Student List
          </TabsTrigger>
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">
            <BarChart3 className="h-4 w-4 mr-2" /> Faculty Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <AnimatedCard>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, roll, or project…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-left">
                    {["Student Name", "Roll Number", "Project Title", "Assigned Faculty", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filtered.map((s, i) => (
                      <motion.tr
                        key={s.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25, delay: i * 0.03 }}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{s.name}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{s.roll}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{s.project}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {s.faculty ? (
                            s.faculty
                          ) : (
                            <span className="text-destructive text-xs font-medium flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">No students match your search.</div>
              )}
            </div>
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-3 gap-4">
            {facultyOverview.map((f, i) => (
              <AnimatedCard key={f.name} delay={i * 0.08}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="gradient-primary rounded-full h-10 w-10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold">{f.name}</h4>
                    <p className="text-xs text-muted-foreground">{f.department}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Capacity</span>
                    <span>{f.assigned} / {f.capacity}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full gradient-primary"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(f.assigned / f.capacity) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{f.capacity - f.assigned} slots available</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoordinatorDashboard;
