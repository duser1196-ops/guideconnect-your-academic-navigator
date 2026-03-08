import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import AnimatedCard from "@/components/AnimatedCard";
import { Mail, Phone, MapPin, GraduationCap, Edit3, Save, Hash, BookOpen, Layers, Building, Star, Users, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const profilesByRole: Record<string, { phone: string; location: string; detail: string }> = {
  student: { phone: "+1 234 567 890", location: "New York, USA", detail: "B.Tech Computer Science — Semester 6" },
  faculty: { phone: "+1 987 654 321", location: "Boston, USA", detail: "Associate Professor — CS Department" },
  coordinator: { phone: "+1 555 123 456", location: "San Francisco, USA", detail: "Academic Coordinator — Engineering" },
  admin: { phone: "+1 000 000 000", location: "HQ", detail: "System Administrator" },
};

const Profile = () => {
  const { user } = useAuth();
  const role = user?.role || "student";
  const p = profilesByRole[role];
  const [editing, setEditing] = useState(false);

  // Student fields
  const [studentForm, setStudentForm] = useState({
    department: "CSE",
    rollNumber: "CS2021001",
    year: "3",
    section: "A",
  });

  // Faculty fields
  const [facultyForm, setFacultyForm] = useState({
    staffId: "FAC-2019-042",
    department: "CSE",
    interests: "Machine Learning, NLP, Deep Learning",
    maxStudents: "8",
  });

  const [contactForm, setContactForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: p.phone,
    location: p.location,
  });

  const updateContact = (f: string, v: string) => setContactForm((prev) => ({ ...prev, [f]: v }));
  const updateStudent = (f: string, v: string) => setStudentForm((prev) => ({ ...prev, [f]: v }));
  const updateFaculty = (f: string, v: string) => setFacultyForm((prev) => ({ ...prev, [f]: v }));

  const handleSave = () => {
    setEditing(false);
    toast({ title: "Profile Updated ✓", description: "Your profile has been saved." });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Profile</h1>
        <Button
          variant={editing ? "default" : "outline"}
          size="sm"
          onClick={() => (editing ? handleSave() : setEditing(true))}
          className="gap-2"
        >
          {editing ? <><Save className="h-4 w-4" /> Save</> : <><Edit3 className="h-4 w-4" /> Edit</>}
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Header card */}
        <AnimatedCard>
          <div className="flex items-center gap-4 mb-6">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="gradient-primary rounded-full h-16 w-16 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            <div className="flex-1">
              {editing ? (
                <Input value={contactForm.name} onChange={(e) => updateContact("name", e.target.value)} className="font-display text-xl font-bold mb-1" />
              ) : (
                <h2 className="font-display text-xl font-bold">{contactForm.name}</h2>
              )}
              <p className="text-sm text-muted-foreground">{p.detail}</p>
              <Badge variant="outline" className="mt-1 text-xs capitalize">{role}</Badge>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", field: "email", value: contactForm.email, type: "email" },
              { icon: Phone, label: "Phone", field: "phone", value: contactForm.phone, type: "tel" },
              { icon: MapPin, label: "Location", field: "location", value: contactForm.location, type: "text" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <item.icon className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  {editing ? (
                    <Input type={item.type} value={item.value} onChange={(e) => updateContact(item.field, e.target.value)} className="mt-1 h-8 text-sm" />
                  ) : (
                    <p className="text-sm font-medium">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>

        {/* Student-specific fields */}
        {role === "student" && (
          <AnimatedCard delay={0.1}>
            <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Academic Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Building className="h-3 w-3" /> Department</Label>
                {editing ? (
                  <Select value={studentForm.department} onValueChange={(v) => updateStudent("department", v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE">CSE</SelectItem>
                      <SelectItem value="ECE">ECE</SelectItem>
                      <SelectItem value="ME">Mechanical</SelectItem>
                      <SelectItem value="CE">Civil</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium p-2 rounded-md bg-muted/40">{studentForm.department}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" /> Roll Number</Label>
                {editing ? (
                  <Input value={studentForm.rollNumber} onChange={(e) => updateStudent("rollNumber", e.target.value)} className="h-9" />
                ) : (
                  <p className="text-sm font-medium p-2 rounded-md bg-muted/40">{studentForm.rollNumber}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Layers className="h-3 w-3" /> Year</Label>
                {editing ? (
                  <Select value={studentForm.year} onValueChange={(v) => updateStudent("year", v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium p-2 rounded-md bg-muted/40">{studentForm.year}{studentForm.year === "1" ? "st" : studentForm.year === "2" ? "nd" : studentForm.year === "3" ? "rd" : "th"} Year</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Section</Label>
                {editing ? (
                  <Select value={studentForm.section} onValueChange={(v) => updateStudent("section", v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium p-2 rounded-md bg-muted/40">Section {studentForm.section}</p>
                )}
              </div>
            </div>
          </AnimatedCard>
        )}

        {/* Faculty-specific fields */}
        {(role === "faculty" || role === "coordinator") && (
          <AnimatedCard delay={0.1}>
            <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Faculty Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" /> Staff ID</Label>
                {editing ? (
                  <Input value={facultyForm.staffId} onChange={(e) => updateFaculty("staffId", e.target.value)} className="h-9" />
                ) : (
                  <p className="text-sm font-medium p-2 rounded-md bg-muted/40">{facultyForm.staffId}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Building className="h-3 w-3" /> Department</Label>
                {editing ? (
                  <Select value={facultyForm.department} onValueChange={(v) => updateFaculty("department", v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE">CSE</SelectItem>
                      <SelectItem value="ECE">ECE</SelectItem>
                      <SelectItem value="ME">Mechanical</SelectItem>
                      <SelectItem value="CE">Civil</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium p-2 rounded-md bg-muted/40">{facultyForm.department}</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Tag className="h-3 w-3" /> Areas of Interest</Label>
                {editing ? (
                  <Input value={facultyForm.interests} onChange={(e) => updateFaculty("interests", e.target.value)} className="h-9" placeholder="Comma-separated interests" />
                ) : (
                  <div className="flex flex-wrap gap-1.5 p-2">
                    {facultyForm.interests.split(",").map((i) => (
                      <Badge key={i.trim()} variant="secondary" className="text-xs">{i.trim()}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Maximum Students</Label>
                {editing ? (
                  <Input type="number" value={facultyForm.maxStudents} onChange={(e) => updateFaculty("maxStudents", e.target.value)} className="h-9" min="1" max="20" />
                ) : (
                  <p className="text-sm font-medium p-2 rounded-md bg-muted/40">{facultyForm.maxStudents} students</p>
                )}
              </div>
            </div>
          </AnimatedCard>
        )}
      </div>
    </div>
  );
};

export default Profile;
