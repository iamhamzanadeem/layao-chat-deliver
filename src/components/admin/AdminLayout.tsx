import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import AdminGuard from './AdminGuard';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { cn } from '@/lib/utils';

const AdminLayoutContent = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <AdminHeader
        onMenuClick={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      <main
        className={cn(
          'min-h-screen pt-16 transition-all duration-300',
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const AdminLayout = () => {
  return (
    <AdminAuthProvider>
      <AdminGuard>
        <AdminLayoutContent />
      </AdminGuard>
    </AdminAuthProvider>
  );
};

export default AdminLayout;
