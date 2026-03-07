import AnimatedCard from "@/components/AnimatedCard";
import { GraduationCap, Star } from "lucide-react";

const faculty = [
  { name: "Dr. Sarah Chen", dept: "Computer Science", rating: 4.9, students: 12 },
  { name: "Dr. Michael Brown", dept: "Electronics", rating: 4.7, students: 8 },
  { name: "Dr. Lisa Wang", dept: "Data Science", rating: 4.8, students: 10 },
  { name: "Dr. James Wilson", dept: "AI & ML", rating: 4.6, students: 15 },
  { name: "Dr. Anika Patel", dept: "Cybersecurity", rating: 4.9, students: 6 },
  { name: "Dr. Robert Kim", dept: "Software Eng.", rating: 4.5, students: 9 },
];

const Faculty = () => (
  <div>
    <h1 className="font-display text-2xl font-bold mb-6">Faculty</h1>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {faculty.map((f, i) => (
        <AnimatedCard key={f.name} delay={i * 0.08}>
          <div className="flex items-center gap-3 mb-3">
            <div className="gradient-primary rounded-full h-10 w-10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm">{f.name}</h3>
              <p className="text-xs text-muted-foreground">{f.dept}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground"><Star className="h-3.5 w-3.5 text-primary" />{f.rating}</span>
            <span className="text-muted-foreground">{f.students} students</span>
          </div>
        </AnimatedCard>
      ))}
    </div>
  </div>
);

export default Faculty;
