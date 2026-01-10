import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, loading } = useAuth();
  const { isAdmin, checkingRole } = useAdminAuth();
  const location = useLocation();

  // Show loading while checking auth or role
  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/admin/auth" state={{ from: location }} replace />;
  }

  // Redirect to customer app if not admin
  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
