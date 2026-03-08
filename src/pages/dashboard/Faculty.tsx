import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AnimatedCard from "@/components/AnimatedCard";
import { GraduationCap, Star, Send, Search, MapPin, BookOpen, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";

interface FacultyMember {
  id: string;
  name: string;
  department: string | null;
  expertise: string[] | null;
  max_students: number | null;
  matchScore?: number;
}

const Faculty = () => {
  const [search, setSearch] = useState("");
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [recommendedIds, setRecommendedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const { data: facData } = await supabase
        .from("users")
        .select("id, name, department, expertise, max_students")
        .eq("role", "faculty" as any);

      const faculty: FacultyMember[] = (facData || []).map((f) => ({ ...f, matchScore: 0 }));

      // Calculate match scores if student has a project
      if (user?.role === "student") {
        const { data: projects } = await supabase
          .from("projects")
          .select("domain, technologies")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (projects && projects.length > 0) {
          const project = projects[0];
          const domain = (project.domain || "").toLowerCase();
          const techs = ((project.technologies as string[]) || []).map((t) => t.toLowerCase());

          const scored = new Set<string>();
          for (const f of faculty) {
            const expertiseLower = ((f.expertise as string[]) || []).map((e) => e.toLowerCase());
            let score = 0;
            if (domain && expertiseLower.some((e) => e.includes(domain) || domain.includes(e))) score += 2;
            for (const tech of techs) {
              if (expertiseLower.some((e) => e.includes(tech) || tech.includes(e))) score += 1;
            }
            f.matchScore = score;
            if (score > 0) scored.add(f.id);
          }
          setRecommendedIds(scored);
        }
      }

      setFacultyList(faculty);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const filtered = facultyList.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.department || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.expertise || []).some((i) => i.toLowerCase().includes(search.toLowerCase()))
  );

  const recommended = filtered.filter((f) => recommendedIds.has(f.id)).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  if (loading) return <DashboardSkeleton />;

  const FacultyCard = ({ f, index, showMatch }: { f: FacultyMember; index: number; showMatch?: boolean }) => (
    <AnimatedCard key={f.id} delay={index * 0.05}>
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarFallback className="gradient-primary text-primary-foreground font-display font-bold text-sm">
            {f.name.split(" ").slice(-1).map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-sm truncate">{f.name}</h3>
            {showMatch && f.matchScore && f.matchScore > 0 && (
              <Badge variant="secondary" className="gap-1 text-[10px] shrink-0">
                <Star className="h-3 w-3" /> {f.matchScore} match
              </Badge>
            )}
          </div>
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
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold">Faculty</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, dept, or interest…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Small recommended section */}
      {recommended.length > 0 && !search && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recommended for your project</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.slice(0, 3).map((f, i) => (
              <FacultyCard key={f.id} f={f} index={i} showMatch />
            ))}
          </div>
        </div>
      )}

      {/* All Faculty */}
      <div className="mb-3">
        <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {search ? `Search Results (${filtered.length})` : `All Faculty (${filtered.length})`}
        </h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((f, i) => (
          <FacultyCard key={f.id} f={f} index={i} />
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
