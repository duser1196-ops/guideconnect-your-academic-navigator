import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, FolderKanban, Users, FileText, Bell, UserCircle, ChevronLeft, GraduationCap,
  LogOut, Shield, UserPlus, UsersRound, ClipboardList, Megaphone,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth, AuthRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navByRole: Record<AuthRole, { title: string; url: string; icon: typeof LayoutDashboard }[]> = {
  student: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Projects", url: "/dashboard/projects", icon: FolderKanban },
    { title: "Faculty", url: "/dashboard/faculty", icon: Users },
    { title: "Requests", url: "/dashboard/requests", icon: FileText },
    { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
    { title: "Profile", url: "/dashboard/profile", icon: UserCircle },
  ],
  faculty: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Student Requests", url: "/dashboard/requests", icon: FileText },
    { title: "Assigned Projects", url: "/dashboard/projects", icon: FolderKanban },
    { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
    { title: "Profile", url: "/dashboard/profile", icon: UserCircle },
  ],
  coordinator: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Section Students", url: "/dashboard/section-students", icon: UsersRound },
    { title: "Faculty Allocation", url: "/dashboard/faculty-allocation", icon: ClipboardList },
  ],
  admin: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Users", url: "/dashboard/admin/users", icon: Users },
    { title: "Add Faculty", url: "/dashboard/admin/add-faculty", icon: UserPlus },
    { title: "Add Coordinator", url: "/dashboard/admin/add-coordinator", icon: Shield },
    { title: "Projects", url: "/dashboard/admin/projects", icon: FolderKanban },
    { title: "Assignments", url: "/dashboard/admin/assignments", icon: ClipboardList },
  ],
};

const roleLabels: Record<AuthRole, string> = {
  student: "Student",
  faculty: "Faculty",
  coordinator: "Coordinator",
  admin: "Admin",
};

const roleColors: Record<AuthRole, string> = {
  student: "bg-primary",
  faculty: "bg-secondary",
  coordinator: "bg-accent",
  admin: "bg-destructive",
};

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || "student";
  const navItems = navByRole[role];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
              <div className="gradient-primary rounded-lg p-1.5">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-base font-bold gradient-text">GuideConnect</span>
            </motion.div>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={toggleSidebar}>
            <ChevronLeft className={`h-4 w-4 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground transition-all hover:bg-muted/60"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="p-4 space-y-3">
          <div className="flex items-center gap-2 px-2">
            <div className={`w-2 h-2 rounded-full ${roleColors[role]}`} />
            <span className="text-xs font-medium text-muted-foreground">{user?.name}</span>
            <Badge variant="outline" className="text-[10px] ml-auto px-1.5 py-0">
              {roleLabels[role]}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
