import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OrderProvider } from '@/contexts/OrderContext';
import { AppSidebarDesktop } from './AppSidebar';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const AppLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebarDesktop 
          selectedOrderId={selectedOrderId}
          onSelectOrder={setSelectedOrderId}
        />
        <main className="flex-1 h-screen overflow-hidden bg-background">
          <Outlet context={{ selectedOrderId, onSelectOrder: setSelectedOrderId }} />
        </main>
      </div>
    </OrderProvider>
  );
};

export default AppLayout;

// Hook to access layout context
export const useAppLayout = () => {
  // This will be used by Chat component to access selectedOrderId
  return {
    selectedOrderId: null as string | null,
    onSelectOrder: (_id: string | null) => {},
  };
};
