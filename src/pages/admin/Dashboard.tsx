import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  Users,
  ArrowRight,
  Plus,
  FolderTree,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/admin/StatsCard';
import { useTodayOrdersStats, useOrders } from '@/hooks/admin/useOrders';
import { useTotalCustomers } from '@/hooks/admin/useCustomers';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  on_the_way: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const Dashboard = () => {
  const { data: todayStats, isLoading: loadingStats } = useTodayOrdersStats();
  const { data: customers, isLoading: loadingCustomers } = useTotalCustomers();
  const { data: recentOrders, isLoading: loadingOrders } = useOrders();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loadingStats ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatsCard
              title="Today's Orders"
              value={todayStats?.totalOrders || 0}
              icon={ShoppingBag}
              iconColor="text-blue-600"
            />
            <StatsCard
              title="Today's Revenue"
              value={`Rs. ${(todayStats?.totalRevenue || 0).toLocaleString()}`}
              icon={DollarSign}
              iconColor="text-green-600"
            />
            <StatsCard
              title="Active Orders"
              value={todayStats?.activeOrders || 0}
              icon={Clock}
              iconColor="text-orange-600"
            />
            <StatsCard
              title="Total Customers"
              value={loadingCustomers ? '-' : customers || 0}
              icon={Users}
              iconColor="text-purple-600"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/admin/orders">
              <ClipboardList className="mr-2 h-4 w-4" />
              View Pending Orders
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/products">
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/categories">
              <FolderTree className="mr-2 h-4 w-4" />
              Manage Categories
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/orders">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : recentOrders && recentOrders.length > 0 ? (
                <div className="space-y-4">
              {recentOrders.slice(0, 10).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.profile?.full_name || 'Customer'} •{' '}
                      {formatDistanceToNow(new Date(order.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">
                      Rs. {Number(order.total).toLocaleString()}
                    </p>
                    <Badge className={statusColors[order.status] || ''}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No orders yet. They'll appear here when customers start ordering.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
