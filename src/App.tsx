import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardIndex from "./pages/dashboard/DashboardIndex";
import Projects from "./pages/dashboard/Projects";
import CreateProject from "./pages/dashboard/CreateProject";
import ProjectDetail from "./pages/dashboard/ProjectDetail";
import Faculty from "./pages/dashboard/Faculty";
import Requests from "./pages/dashboard/Requests";
import SendRequest from "./pages/dashboard/SendRequest";
import Notifications from "./pages/dashboard/Notifications";
import Profile from "./pages/dashboard/Profile";
import AdminUsers from "./pages/dashboard/AdminUsers";
import AddFaculty from "./pages/dashboard/AddFaculty";
import AddCoordinator from "./pages/dashboard/AddCoordinator";
import SectionStudents from "./pages/dashboard/SectionStudents";
import FacultyAllocation from "./pages/dashboard/FacultyAllocation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardIndex />} />
              <Route path="projects" element={<ProtectedRoute allowedRoles={["student", "faculty", "coordinator"]}><Projects /></ProtectedRoute>} />
              <Route path="projects/create" element={<ProtectedRoute allowedRoles={["student"]}><CreateProject /></ProtectedRoute>} />
              <Route path="projects/:id" element={<ProtectedRoute allowedRoles={["student", "faculty", "coordinator"]}><ProjectDetail /></ProtectedRoute>} />
              <Route path="faculty" element={<ProtectedRoute allowedRoles={["student"]}><Faculty /></ProtectedRoute>} />
              <Route path="section-students" element={<ProtectedRoute allowedRoles={["coordinator"]}><SectionStudents /></ProtectedRoute>} />
              <Route path="faculty-allocation" element={<ProtectedRoute allowedRoles={["coordinator"]}><FacultyAllocation /></ProtectedRoute>} />
              <Route path="requests" element={<ProtectedRoute allowedRoles={["student", "faculty"]}><Requests /></ProtectedRoute>} />
              <Route path="requests/send" element={<ProtectedRoute allowedRoles={["student"]}><SendRequest /></ProtectedRoute>} />
              <Route path="notifications" element={<ProtectedRoute allowedRoles={["student", "faculty", "coordinator"]}><Notifications /></ProtectedRoute>} />
              <Route path="profile" element={<Profile />} />
              <Route path="admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
              <Route path="admin/add-faculty" element={<ProtectedRoute allowedRoles={["admin"]}><AddFaculty /></ProtectedRoute>} />
              <Route path="admin/add-coordinator" element={<ProtectedRoute allowedRoles={["admin"]}><AddCoordinator /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
