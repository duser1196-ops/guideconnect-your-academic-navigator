import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { RoleProvider } from "@/hooks/useRole";
import { NotificationProvider } from "@/hooks/useNotifications";

const DashboardLayout = () => (
  <RoleProvider>
    <NotificationProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </NotificationProvider>
  </RoleProvider>
);

export default DashboardLayout;
