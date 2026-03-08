import { motion } from "framer-motion";
import { Users, UserCheck, UserX } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import AnimatedCard from "@/components/AnimatedCard";
import { Badge } from "@/components/ui/badge";

const facultyOverview = [
  {
    name: "Dr. Ramesh",
    department: "CSE",
    assigned: 3,
    capacity: 5,
    students: [
      { name: "Alex Johnson", roll: "CS2021001", project: "ML in Healthcare" },
      { name: "Priya Sharma", roll: "CS2021004", project: "Data Mining Research" },
      { name: "Tom Harris", roll: "CS2021010", project: "E-commerce Platform" },
    ],
  },
  {
    name: "Dr. Meena",
    department: "CSE",
    assigned: 2,
    capacity: 4,
    students: [
      { name: "Maria Garcia", roll: "CS2021002", project: "NLP Chatbot" },
      { name: "Sophie Brown", roll: "CS2021007", project: "Cloud Migration Tool" },
    ],
  },
  {
    name: "Dr. Suresh",
    department: "CSE",
    assigned: 2,
    capacity: 4,
    students: [
      { name: "Emily Davis", roll: "CS2021006", project: "IoT Dashboard" },
      { name: "Anna White", roll: "CS2021009", project: "AI Tutor System" },
    ],
  },
];

const totalAssigned = facultyOverview.reduce((sum, f) => sum + f.assigned, 0);
const totalCapacity = facultyOverview.reduce((sum, f) => sum + f.capacity, 0);
const totalAvailable = totalCapacity - totalAssigned;

const FacultyAllocation = () => {
  return (
    <div>
      <DashboardHeader title="Faculty Allocation" description="Monitor faculty workload and student assignments." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Users} title="Total Faculty" value={facultyOverview.length} subtitle="In your section" delay={0} />
        <StatCard icon={UserCheck} title="Students Assigned" value={totalAssigned} subtitle={`of ${totalCapacity} capacity`} delay={0.1} trend={{ value: `${Math.round((totalAssigned / totalCapacity) * 100)}%`, positive: true }} />
        <StatCard icon={UserX} title="Slots Available" value={totalAvailable} subtitle="Remaining capacity" delay={0.2} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {facultyOverview.map((f, i) => (
          <AnimatedCard key={f.name} delay={i * 0.08}>
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

            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Assigned Students</p>
              {f.students.map((s) => (
                <div key={s.roll} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground ml-1.5">({s.roll})</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{s.project}</Badge>
                </div>
              ))}
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
};

export default FacultyAllocation;
