import { useAuth } from "@/hooks/useAuth";
import StudentDashboard from "./StudentDashboard";
import FacultyDashboard from "./FacultyDashboard";
import CoordinatorDashboard from "./CoordinatorDashboard";
import AdminDashboard from "./AdminDashboard";

const DashboardIndex = () => {
  const { user } = useAuth();
  const role = user?.role || "student";

  if (role === "admin") return <AdminDashboard />;
  if (role === "faculty") return <FacultyDashboard />;
  if (role === "coordinator") return <CoordinatorDashboard />;
  return <StudentDashboard />;
};

export default DashboardIndex;
