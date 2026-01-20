import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, MessageSquare, ChevronRight, User, LogOut, Menu, Package, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useUserOrders, groupOrdersByDate } from '@/hooks/app/useUserOrders';
import { useOrder } from '@/contexts/OrderContext';
import { formatDistanceToNow } from 'date-fns';

interface AppSidebarProps {
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string | null) => void;
}

// Status badge configuration
const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  preparing: { label: 'Preparing', variant: 'default' },
  on_the_way: { label: 'On the way', variant: 'default' },
  delivered: { label: 'Delivered', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

type FilterType = 'all' | 'active' | 'completed';

const SidebarContent = ({ 
  selectedOrderId, 
  onSelectOrder,
  onClose,
}: AppSidebarProps & { onClose?: () => void }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: orders = [], isLoading } = useUserOrders();
  const { clearCart } = useOrder();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders based on selected filter and search
  const filteredOrders = orders.filter(order => {
    // Apply status filter
    const isActive = ['pending', 'confirmed', 'preparing', 'on_the_way'].includes(order.status);
    const isCompleted = ['delivered', 'cancelled'].includes(order.status);
    
    if (filter === 'active' && !isActive) return false;
    if (filter === 'completed' && !isCompleted) return false;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesOrderNumber = order.order_number.toLowerCase().includes(query);
      const matchesItem = order.firstItemName?.toLowerCase().includes(query);
      return matchesOrderNumber || matchesItem;
    }
    
    return true;
  });

  const groupedOrders = groupOrdersByDate(filteredOrders);

  // Count orders for filter badges
  const activeCount = orders.filter(o => ['pending', 'confirmed', 'preparing', 'on_the_way'].includes(o.status)).length;
  const completedCount = orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length;

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

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.phone || 'U';
    if (name.startsWith('+')) return name.slice(0, 3);
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Branded Header */}
      <div className="p-4 border-b border-sidebar-border bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
            <span className="text-primary-foreground font-display font-bold text-xl">L</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-sidebar-foreground">Layao</h1>
            <p className="text-xs text-sidebar-foreground/60">Your delivery assistant</p>
          </div>
        </div>
        
        <Button 
          onClick={handleNewOrder}
          className="w-full gap-2 bg-gradient-primary hover:opacity-90 shadow-md transition-all hover:shadow-lg"
          size="default"
        >
          <Plus className="w-4 h-4" />
          New Order
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="p-3 border-b border-sidebar-border space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-sidebar-accent/50 border-sidebar-border"
          />
        </div>
        
        <div className="flex gap-1">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            className={cn("flex-1 h-8 text-xs", filter === 'all' && 'bg-primary')}
            onClick={() => setFilter('all')}
          >
            All
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {orders.length}
            </Badge>
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'ghost'}
            size="sm"
            className={cn("flex-1 h-8 text-xs", filter === 'active' && 'bg-primary')}
            onClick={() => setFilter('active')}
          >
            Active
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {activeCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'ghost'}
            size="sm"
            className={cn("flex-1 h-8 text-xs", filter === 'completed' && 'bg-primary')}
            onClick={() => setFilter('completed')}
          >
            Done
            {completedCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {completedCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="h-20 rounded-lg bg-gradient-to-r from-sidebar-accent via-sidebar to-sidebar-accent bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" 
                />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sidebar-accent flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-semibold text-sidebar-foreground mb-1">
                {searchQuery ? 'No matching orders' : 'No orders yet'}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {searchQuery ? 'Try a different search term' : 'Start shopping to see your orders here'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={handleNewOrder}
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Start Shopping
                </Button>
              )}
            </div>
          ) : (
            groupedOrders.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground px-2 py-2 uppercase tracking-wide">
                  {group.label}
                </p>
                {group.orders.map((order) => {
                  const status = statusConfig[order.status] || { label: order.status, variant: 'secondary' as const };
                  const timeAgo = formatDistanceToNow(new Date(order.created_at), { addSuffix: true });
                  
                  return (
                    <button
                      key={order.id}
                      onClick={() => handleSelectOrder(order.id)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg mb-1.5',
                        'transition-all duration-200 ease-out',
                        'hover:bg-sidebar-accent hover:shadow-sm',
                        selectedOrderId === order.id && 'bg-sidebar-accent ring-1 ring-primary/20 shadow-sm'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-sidebar-foreground">
                              {order.order_number}
                            </span>
                            <Badge variant={status.variant} className="text-[10px] h-5 px-1.5">
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {order.firstItemName || 'Order'} 
                            {order.itemCount > 1 && ` +${order.itemCount - 1} more`}
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs font-medium text-primary">
                              {formatCurrency(order.total)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {timeAgo}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Profile Footer */}
      <div className="border-t border-sidebar-border p-3 bg-sidebar-accent/30">
        <button
          onClick={handleProfile}
          className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-semibold text-sm">
              {getUserInitials()}
            </span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {user?.user_metadata?.full_name || 'Your Profile'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.phone || user?.email || 'View profile'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </button>
        
        <Separator className="my-2" />
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
    <aside className="hidden md:flex w-72 lg:w-80 flex-shrink-0 h-screen border-r border-sidebar-border/40 bg-sidebar">
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
      <SheetContent side="left" className="p-0 w-80">
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
