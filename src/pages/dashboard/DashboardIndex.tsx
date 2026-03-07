import { useRole } from "@/hooks/useRole";
import StudentDashboard from "./StudentDashboard";
import FacultyDashboard from "./FacultyDashboard";
import CoordinatorDashboard from "./CoordinatorDashboard";

const DashboardIndex = () => {
  const { role } = useRole();

  if (role === "faculty") return <FacultyDashboard />;
  if (role === "coordinator") return <CoordinatorDashboard />;
  return <StudentDashboard />;
};

export default DashboardIndex;
