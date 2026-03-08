import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationProvider } from "@/hooks/useNotifications";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <NotificationProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background gradient-mesh">
          <AppSidebar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </main>
        </div>
      </SidebarProvider>
    </NotificationProvider>
  );
};

export default DashboardLayout;
