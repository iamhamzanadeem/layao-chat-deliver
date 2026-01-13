import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Search, 
  Users, 
  Phone, 
  MapPin, 
  ShoppingBag,
  Star,
  ChevronRight
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  useCustomers, 
  useCustomer, 
  useCustomerOrders, 
  useCustomerAddresses,
  useCustomerRatings 
} from '@/hooks/admin/useCustomers';
import { cn } from '@/lib/utils';

const CustomerCard = ({ 
  customer, 
  onClick 
}: { 
  customer: any; 
  onClick: () => void;
}) => {
  return (
    <div 
      className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          {customer.avatar_url ? (
            <img 
              src={customer.avatar_url} 
              alt={customer.full_name} 
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <span className="text-primary font-bold text-lg">
              {customer.full_name?.[0]?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {customer.full_name || 'Unknown'}
          </h3>
          {customer.phone && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
              <Phone className="w-3 h-3" />
              {customer.phone}
            </div>
          )}
          
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">{customer.totalOrders}</span>
              <span className="text-muted-foreground">orders</span>
            </div>
            <div>
              <span className="text-foreground font-medium">Rs. {customer.totalSpent.toFixed(0)}</span>
              <span className="text-muted-foreground ml-1">spent</span>
            </div>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  );
};

const CustomerDetail = ({ 
  customerId, 
  open, 
  onOpenChange 
}: { 
  customerId: string | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  const { data: customer, isLoading: customerLoading } = useCustomer(customerId || undefined);
  const { data: orders, isLoading: ordersLoading } = useCustomerOrders(customerId || undefined);
  const { data: addresses, isLoading: addressesLoading } = useCustomerAddresses(customerId || undefined);
  const { data: ratings, isLoading: ratingsLoading } = useCustomerRatings(customerId || undefined);

  if (!open || !customerId) return null;

  const totalSpent = orders?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;
  const avgRating = ratings?.length 
    ? (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length).toFixed(1)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>

        {customerLoading ? (
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
        ) : customer ? (
          <div className="space-y-4">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {customer.avatar_url ? (
                  <img 
                    src={customer.avatar_url} 
                    alt={customer.full_name} 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-bold text-2xl">
                    {customer.full_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  {customer.full_name || 'Unknown'}
                </h3>
                {customer.phone && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {customer.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-primary">{orders?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">Rs. {totalSpent.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <p className="text-2xl font-bold text-foreground">{avgRating || '-'}</p>
                </div>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="orders" className="flex-1">Orders</TabsTrigger>
                <TabsTrigger value="addresses" className="flex-1">Addresses</TabsTrigger>
                <TabsTrigger value="ratings" className="flex-1">Ratings</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="mt-4">
                {ordersLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-sm font-medium">{order.order_number}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(order.created_at), 'PPp')}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">
                              {order.status}
                            </Badge>
                            <p className="text-sm font-medium text-foreground mt-1">
                              Rs. {Number(order.total).toFixed(0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No orders yet</p>
                )}
              </TabsContent>

              <TabsContent value="addresses" className="mt-4">
                {addressesLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : addresses && addresses.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {addresses.map((address) => (
                      <div key={address.id} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-primary mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{address.label}</span>
                              {address.is_default && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {address.full_address}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No addresses saved</p>
                )}
              </TabsContent>

              <TabsContent value="ratings" className="mt-4">
                {ratingsLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : ratings && ratings.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {ratings.map((rating) => (
                      <div key={rating.id} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={cn(
                                    'w-4 h-4',
                                    i < rating.stars 
                                      ? 'text-amber-500 fill-amber-500' 
                                      : 'text-muted-foreground'
                                  )} 
                                />
                              ))}
                            </div>
                            {rating.comment && (
                              <p className="text-sm text-muted-foreground mt-1">{rating.comment}</p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(rating.created_at), 'PP')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No ratings yet</p>
                )}
              </TabsContent>
            </Tabs>

            <p className="text-xs text-muted-foreground text-center">
              Customer since {format(new Date(customer.created_at), 'PP')}
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

const Customers = () => {
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const { data: customers, isLoading } = useCustomers({ search });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">View and manage customer information</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Customers Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : customers && customers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <CustomerCard 
                key={customer.id} 
                customer={customer} 
                onClick={() => setSelectedCustomerId(customer.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-1">No customers found</h3>
            <p className="text-sm text-muted-foreground">
              {search ? 'Try adjusting your search' : 'Customers will appear here when they sign up'}
            </p>
          </div>
        )}
      </div>

      <CustomerDetail 
        customerId={selectedCustomerId}
        open={!!selectedCustomerId}
        onOpenChange={(open) => !open && setSelectedCustomerId(null)}
      />
    </AdminLayout>
  );
};

export default Customers;
