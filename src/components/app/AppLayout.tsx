import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OrderProvider } from '@/contexts/OrderContext';
import BottomNav from './BottomNav';
import { Loader2 } from 'lucide-react';

const AppLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/app/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <OrderProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 pb-20 overflow-hidden">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </OrderProvider>
  );
};

export default AppLayout;
