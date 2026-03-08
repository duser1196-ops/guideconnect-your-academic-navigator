import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedCard from "@/components/AnimatedCard";
import { GraduationCap, Star, Send, Search, MapPin, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const faculty = [
  { id: 1, name: "Dr. Ramesh Kumar", department: "CSE", interests: ["AI", "ML", "Web Dev"], availableSlots: 3, rating: 4.9, students: 12 },
  { id: 2, name: "Dr. Meena Sharma", department: "CSE", interests: ["Data Science", "NLP", "Cloud"], availableSlots: 1, rating: 4.8, students: 10 },
  { id: 3, name: "Dr. Anil Verma", department: "ECE", interests: ["IoT", "Embedded", "VLSI"], availableSlots: 4, rating: 4.7, students: 8 },
  { id: 4, name: "Dr. Priya Singh", department: "CSE", interests: ["Cybersecurity", "Blockchain"], availableSlots: 2, rating: 4.9, students: 6 },
  { id: 5, name: "Dr. Sanjay Patel", department: "IT", interests: ["DevOps", "Cloud", "AI"], availableSlots: 0, rating: 4.5, students: 15 },
  { id: 6, name: "Dr. Kavita Joshi", department: "CSE", interests: ["Computer Vision", "Deep Learning"], availableSlots: 5, rating: 4.6, students: 9 },
];

const Faculty = () => {
  const [search, setSearch] = useState("");
  const filtered = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase()) ||
      f.interests.some((i) => i.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSendRequest = (name: string) => {
    toast({ title: "Request Sent!", description: `Your mentorship request has been sent to ${name}.` });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold">Faculty</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, dept, or interest…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((f, i) => (
          <AnimatedCard key={f.id} delay={i * 0.08}>
            <div className="flex items-start gap-3 mb-4">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="gradient-primary text-primary-foreground font-display font-bold text-sm">
                  {f.name.split(" ").slice(1).map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-sm truncate">{f.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {f.department} Department
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {f.interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="text-[10px] px-2 py-0.5">
                  {interest}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-primary" /> {f.rating}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" /> {f.students} students
              </span>
              <span className={`font-medium ${f.availableSlots > 0 ? "text-green-600" : "text-destructive"}`}>
                {f.availableSlots > 0 ? `${f.availableSlots} slots` : "No slots"}
              </span>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full gap-2" disabled={f.availableSlots === 0}>
                  <Send className="h-3.5 w-3.5" /> Send Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Request to {f.name}</DialogTitle>
                  <DialogDescription>
                    You are about to send a mentorship request. {f.name} has {f.availableSlots} slot(s) available.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={() => handleSendRequest(f.name)} className="gap-2">
                    <Send className="h-4 w-4" /> Confirm Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
