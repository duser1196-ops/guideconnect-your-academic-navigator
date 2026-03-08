import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AnimatedCard from "@/components/AnimatedCard";
import { GraduationCap, Star, Send, Search, MapPin, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

interface FacultyMember {
  id: string;
  name: string;
  department: string | null;
  expertise: string[] | null;
  max_students: number | null;
}

const Faculty = () => {
  const [search, setSearch] = useState("");
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("users")
        .select("id, name, department, expertise, max_students")
        .eq("role", "faculty" as any);
      setFacultyList(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = facultyList.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.department || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.expertise || []).some((i) => i.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold">Faculty</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, dept, or interest…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((f, i) => (
          <AnimatedCard key={f.id} delay={i * 0.08}>
            <div className="flex items-start gap-3 mb-4">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="gradient-primary text-primary-foreground font-display font-bold text-sm">
                  {f.name.split(" ").slice(-1).map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-sm truncate">{f.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {f.department || "—"} Department
                </p>
              </div>
            </div>

            {f.expertise && f.expertise.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {f.expertise.map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-[10px] px-2 py-0.5">{interest}</Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" /> Max {f.max_students || 5} students
              </span>
            </div>

            <Button size="sm" className="w-full gap-2" onClick={() => navigate("/dashboard/requests/send")}>
              <Send className="h-3.5 w-3.5" /> Send Request
            </Button>
          </AnimatedCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No faculty found matching your search.</p>
        </motion.div>
      )}
    </div>
  );
};

export default Faculty;
