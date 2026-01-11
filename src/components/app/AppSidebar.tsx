import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, MessageSquare, ChevronRight, User, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useUserOrders, groupOrdersByDate } from '@/hooks/app/useUserOrders';
import { useOrder } from '@/contexts/OrderContext';

interface AppSidebarProps {
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string | null) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  preparing: 'bg-orange-500',
  on_the_way: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const SidebarContent = ({ 
  selectedOrderId, 
  onSelectOrder,
  onClose,
}: AppSidebarProps & { onClose?: () => void }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: orders = [], isLoading } = useUserOrders();
  const { clearCart } = useOrder();
  const groupedOrders = groupOrdersByDate(orders);

  const handleNewOrder = () => {
    clearCart();
    onSelectOrder(null);
    onClose?.();
  };

  const handleSelectOrder = (orderId: string) => {
    onSelectOrder(orderId);
    onClose?.();
  };

  const handleProfile = () => {
    navigate('/app/profile');
    onClose?.();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/app/auth');
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button 
          onClick={handleNewOrder}
          className="w-full gap-2"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          New Order
        </Button>
      </div>

      {/* Orders List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No orders yet</p>
              <p className="text-xs">Start your first order!</p>
            </div>
          ) : (
            groupedOrders.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                  {group.label}
                </p>
                {group.orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => handleSelectOrder(order.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg transition-colors mb-1',
                      'hover:bg-muted/50',
                      selectedOrderId === order.id && 'bg-muted'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn('w-2 h-2 rounded-full', statusColors[order.status])} />
                          <span className="text-sm font-medium truncate">
                            {order.order_number}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {order.firstItemName || 'Order'} 
                          {order.itemCount > 1 && ` +${order.itemCount - 1} more`}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border p-2">
        <button
          onClick={handleProfile}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium truncate">
              {user?.user_metadata?.full_name || user?.phone || 'Profile'}
            </p>
            <p className="text-xs text-muted-foreground">View profile</p>
          </div>
        </button>
        <Separator className="my-2" />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
};

// Desktop Sidebar
export const AppSidebarDesktop = ({ selectedOrderId, onSelectOrder }: AppSidebarProps) => {
  return (
    <aside className="hidden md:flex w-72 border-r border-border flex-shrink-0 h-screen">
      <SidebarContent selectedOrderId={selectedOrderId} onSelectOrder={onSelectOrder} />
    </aside>
  );
};

// Mobile Sidebar (Sheet)
export const AppSidebarMobile = ({ selectedOrderId, onSelectOrder }: AppSidebarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <SidebarContent 
          selectedOrderId={selectedOrderId} 
          onSelectOrder={onSelectOrder}
          onClose={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
};

export default AppSidebarDesktop;
