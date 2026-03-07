import AnimatedCard from "@/components/AnimatedCard";
import { FolderKanban } from "lucide-react";

const Projects = () => (
  <div>
    <h1 className="font-display text-2xl font-bold mb-6">Projects</h1>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {["ML in Healthcare", "NLP Research", "IoT Smart Campus", "Data Visualization", "Blockchain Auth", "AR Learning"].map((p, i) => (
        <AnimatedCard key={p} delay={i * 0.08}>
          <div className="flex items-center gap-3 mb-3">
            <div className="gradient-primary rounded-lg p-2"><FolderKanban className="h-4 w-4 text-primary-foreground" /></div>
            <h3 className="font-display font-semibold">{p}</h3>
          </div>
          <p className="text-sm text-muted-foreground">Ongoing research project with active collaboration.</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full gradient-primary" style={{ width: `${40 + i * 10}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{40 + i * 10}%</span>
          </div>
        </AnimatedCard>
      ))}
    </div>
  </div>
);

export default Projects;
