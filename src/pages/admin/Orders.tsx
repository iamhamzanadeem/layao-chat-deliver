import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Clock, 
  Package, 
  CheckCircle, 
  Truck, 
  XCircle,
  Phone,
  MapPin,
  Zap,
  ChevronRight,
  Search,
  Utensils,
  ClipboardList
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrders, useOrder, useUpdateOrderStatus } from '@/hooks/admin/useOrders';
import { useErrandByOrderId } from '@/hooks/admin/useErrands';
import type { Enums } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type OrderStatus = Enums<'order_status'>;
type OrderType = 'all' | 'inventory' | 'restaurant' | 'errand';

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending', icon: <Clock className="w-4 h-4" />, color: 'bg-amber-500' },
  confirmed: { label: 'Confirmed', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-blue-500' },
  preparing: { label: 'Preparing', icon: <Package className="w-4 h-4" />, color: 'bg-purple-500' },
  on_the_way: { label: 'On the Way', icon: <Truck className="w-4 h-4" />, color: 'bg-indigo-500' },
  delivered: { label: 'Delivered', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-success' },
  cancelled: { label: 'Cancelled', icon: <XCircle className="w-4 h-4" />, color: 'bg-destructive' },
};

const ORDER_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  inventory: { label: 'Inventory', icon: <Package className="w-3 h-3" />, color: 'text-blue-600 border-blue-600' },
  restaurant: { label: 'Restaurant', icon: <Utensils className="w-3 h-3" />, color: 'text-orange-600 border-orange-600' },
  errand: { label: 'Errand', icon: <Truck className="w-3 h-3" />, color: 'text-purple-600 border-purple-600' },
};

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered'];

const OrderCard = ({ 
  order, 
  onClick 
}: { 
  order: any; 
  onClick: () => void;
}) => {
  const updateStatus = useUpdateOrderStatus();
  const config = STATUS_CONFIG[order.status as OrderStatus];
  const typeConfig = ORDER_TYPE_CONFIG[order.order_type] || ORDER_TYPE_CONFIG.inventory;
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1 
    ? STATUS_FLOW[currentIndex + 1] 
    : null;

  const handleQuickAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextStatus) {
      updateStatus.mutate({ id: order.id, status: nextStatus });
    }
  };

  return (
    <div 
      className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-foreground">{order.order_number}</span>
            {order.delivery_type === 'instant' && (
              <Badge variant="outline" className="text-primary border-primary">
                <Zap className="w-3 h-3 mr-1" />
                Instant
              </Badge>
            )}
            {/* Order Type Badge */}
            <Badge variant="outline" className={typeConfig.color}>
              {typeConfig.icon}
              <span className="ml-1">{typeConfig.label}</span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {order.profile?.full_name || 'Customer'}
          </p>
        </div>
        <Badge className={cn('text-white', config.color)}>
          {config.icon}
          <span className="ml-1">{config.label}</span>
        </Badge>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>{format(new Date(order.created_at), 'h:mm a')}</span>
          <span className="font-medium text-foreground">Rs. {Number(order.total).toFixed(0)}</span>
        </div>
        
        {nextStatus && order.status !== 'cancelled' && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleQuickAction}
            disabled={updateStatus.isPending}
          >
            {STATUS_CONFIG[nextStatus].label}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Errand Details Component
const ErrandDetailsSection = ({ orderId }: { orderId: string }) => {
  const { data: errand, isLoading } = useErrandByOrderId(orderId);

  if (isLoading) {
    return <div className="h-20 bg-muted animate-pulse rounded-lg" />;
  }

  if (!errand) {
    return null;
  }

  const TASK_ICONS: Record<string, string> = {
    document: '📄',
    restaurant: '🍽️',
    package: '📦',
    custom: '✨',
  };

  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 space-y-3">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <Truck className="w-4 h-4 text-purple-600" />
        Errand Details
      </h4>
      
      {/* Task Type & Description */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{TASK_ICONS[errand.task_type] || '✨'}</span>
          <span className="font-medium text-sm capitalize">{errand.task_type.replace('_', ' ')} Task</span>
        </div>
        <p className="text-sm text-muted-foreground">{errand.task_description}</p>
      </div>

      {/* Pickup Info */}
      <div className="border-t pt-2">
        <h5 className="text-xs font-medium text-muted-foreground mb-1">Pickup Location</h5>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
          <div>
            <p className="text-foreground">{errand.pickup_address}</p>
            {errand.pickup_contact_name && (
              <p className="text-muted-foreground">Contact: {errand.pickup_contact_name}</p>
            )}
            {errand.pickup_contact_phone && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Phone className="w-3 h-3" />
                {errand.pickup_contact_phone}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="border-t pt-2">
        <h5 className="text-xs font-medium text-muted-foreground mb-1">Pricing</h5>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Fee:</span>
            <span>Rs. {Number(errand.base_fee).toFixed(0)}</span>
          </div>
          {errand.distance_km && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance:</span>
              <span>{errand.distance_km.toFixed(1)} km</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Distance Fee:</span>
            <span>Rs. {Number(errand.distance_fee || 0).toFixed(0)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Estimated:</span>
            <span className="text-purple-600">Rs. {Number(errand.estimated_total).toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Approval Status */}
      <div className="border-t pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Approval Status</span>
          <Badge 
            variant="outline" 
            className={cn(
              errand.approval_status === 'approved' && 'text-green-600 border-green-600',
              errand.approval_status === 'pending' && 'text-amber-600 border-amber-600',
              errand.approval_status === 'rejected' && 'text-red-600 border-red-600',
              errand.approval_status === 'quoted' && 'text-blue-600 border-blue-600',
            )}
          >
            {errand.approval_status.charAt(0).toUpperCase() + errand.approval_status.slice(1)}
          </Badge>
        </div>
        {errand.final_price && (
          <div className="flex justify-between mt-1 text-sm">
            <span className="text-muted-foreground">Final Price:</span>
            <span className="font-bold text-primary">Rs. {Number(errand.final_price).toFixed(0)}</span>
          </div>
        )}
        {errand.admin_notes && (
          <p className="text-xs text-muted-foreground mt-1">Note: {errand.admin_notes}</p>
        )}
      </div>
    </div>
  );
};

const OrderDetail = ({ 
  orderId, 
  open, 
  onOpenChange 
}: { 
  orderId: string | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  const { data: order, isLoading } = useOrder(orderId || undefined);
  const updateStatus = useUpdateOrderStatus();

  if (!open || !orderId) return null;

  const handleStatusChange = (status: string) => {
    updateStatus.mutate({ id: orderId, status: status as OrderStatus });
  };

  const typeConfig = ORDER_TYPE_CONFIG[order?.order_type || 'inventory'] || ORDER_TYPE_CONFIG.inventory;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Order {order?.order_number}</span>
              {order && (
                <Badge variant="outline" className={typeConfig.color}>
                  {typeConfig.icon}
                  <span className="ml-1">{typeConfig.label}</span>
                </Badge>
              )}
            </div>
            {order?.delivery_type === 'instant' && (
              <Badge variant="outline" className="text-primary border-primary">
                <Zap className="w-3 h-3 mr-1" />
                Instant
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : order ? (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select 
                value={order.status} 
                onValueChange={handleStatusChange}
                disabled={updateStatus.isPending}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        {config.icon}
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer */}
            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2">Customer</h4>
              <div className="space-y-1 text-sm">
                <p className="text-foreground">{order.profile?.full_name || 'Unknown'}</p>
                {order.profile?.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {order.profile.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Errand Details (only for errand orders) */}
            {order.order_type === 'errand' && (
              <ErrandDetailsSection orderId={order.id} />
            )}

            {/* Delivery Address */}
            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2">Delivery Address</h4>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">
                    {(order.delivery_address as any)?.label || 'Home'}
                  </p>
                  <p>{(order.delivery_address as any)?.fullAddress}</p>
                  {(order.delivery_address as any)?.landmark && (
                    <p>Near: {(order.delivery_address as any).landmark}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items (hide for errand orders) */}
            {order.order_type !== 'errand' && order.order_items && order.order_items.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Order Items</h4>
                <div className="space-y-2">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product_name} × {item.quantity}
                      </span>
                      <span className="text-foreground">Rs. {Number(item.total_price).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>Rs. {Number(order.subtotal).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                <span>Rs. {Number(order.delivery_fee).toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span className="text-primary">Rs. {Number(order.total).toFixed(0)}</span>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1">Notes</h4>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Created: {format(new Date(order.created_at), 'PPpp')}</p>
              {order.confirmed_at && (
                <p>Confirmed: {format(new Date(order.confirmed_at), 'PPpp')}</p>
              )}
              {order.delivered_at && (
                <p>Delivered: {format(new Date(order.delivered_at), 'PPpp')}</p>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderType>('all');
  const [search, setSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const { data: orders, isLoading } = useOrders({ 
    status: statusFilter,
    orderType: orderTypeFilter,
  });

  const filteredOrders = orders?.filter((order) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(searchLower) ||
      order.profile?.full_name?.toLowerCase().includes(searchLower) ||
      order.profile?.phone?.includes(search)
    );
  });

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage and track all orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by order #, customer name, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Order Type Filter */}
            <Select 
              value={orderTypeFilter} 
              onValueChange={(v) => setOrderTypeFilter(v as OrderType)}
            >
              <SelectTrigger className="w-40">
                <ClipboardList className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="inventory">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    Inventory
                  </div>
                </SelectItem>
                <SelectItem value="restaurant">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-orange-600" />
                    Restaurant
                  </div>
                </SelectItem>
                <SelectItem value="errand">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-purple-600" />
                    Errand
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
            <TabsList className="h-10 flex-wrap">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="preparing">Preparing</TabsTrigger>
              <TabsTrigger value="on_the_way">On Way</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Orders Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredOrders && filteredOrders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onClick={() => setSelectedOrderId(order.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-1">No orders found</h3>
            <p className="text-sm text-muted-foreground">
              {search ? 'Try adjusting your search' : 'Orders will appear here when customers place them'}
            </p>
          </div>
        )}
      </div>

      <OrderDetail 
        orderId={selectedOrderId}
        open={!!selectedOrderId}
        onOpenChange={(open) => !open && setSelectedOrderId(null)}
      />
    </>
  );
};

export default Orders;
