import { motion } from "framer-motion";
import { useRole } from "@/hooks/useRole";
import AnimatedCard from "@/components/AnimatedCard";
import { Mail, Phone, MapPin, GraduationCap } from "lucide-react";

const profiles = {
  student: { name: "Alex Johnson", email: "alex@university.edu", phone: "+1 234 567 890", location: "New York, USA", role: "B.Tech Computer Science — Semester 6" },
  faculty: { name: "Dr. Sarah Chen", email: "chen@university.edu", phone: "+1 987 654 321", location: "Boston, USA", role: "Associate Professor — CS Department" },
  coordinator: { name: "Prof. Williams", email: "williams@university.edu", phone: "+1 555 123 456", location: "San Francisco, USA", role: "Academic Coordinator — Engineering" },
};

const Profile = () => {
  const { role } = useRole();
  const p = profiles[role];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Profile</h1>
      <div className="max-w-2xl">
        <AnimatedCard>
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="gradient-primary rounded-full h-16 w-16 flex items-center justify-center"
            >
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            <div>
              <h2 className="font-display text-xl font-bold">{p.name}</h2>
              <p className="text-sm text-muted-foreground">{p.role}</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: p.email },
              { icon: Phone, label: "Phone", value: p.phone },
              { icon: MapPin, label: "Location", value: p.location },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <item.icon className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default Profile;
