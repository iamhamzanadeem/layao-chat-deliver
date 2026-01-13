import { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users,
  Calendar
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  useOrdersAnalytics, 
  usePopularProducts, 
  useStatusDistribution,
  usePeakHours 
} from '@/hooks/admin/useAnalytics';
import { useTotalCustomers } from '@/hooks/admin/useCustomers';
import { cn } from '@/lib/utils';

type DateRange = 'today' | 'week' | 'month';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(45, 93%, 47%)',
  confirmed: 'hsl(217, 91%, 60%)',
  preparing: 'hsl(271, 91%, 65%)',
  on_the_way: 'hsl(234, 89%, 74%)',
  delivered: 'hsl(var(--success))',
  cancelled: 'hsl(var(--destructive))',
};

const Analytics = () => {
  const [dateRange, setDateRange] = useState<DateRange>('week');
  
  const { data: ordersData, isLoading: ordersLoading } = useOrdersAnalytics({ range: dateRange });
  const { data: popularProducts, isLoading: productsLoading } = usePopularProducts({ range: dateRange });
  const { data: statusDistribution, isLoading: statusLoading } = useStatusDistribution();
  const { data: peakHours, isLoading: peakLoading } = usePeakHours({ range: dateRange });
  const { data: totalCustomers } = useTotalCustomers();

  // Calculate summary stats
  const totalOrders = ordersData?.reduce((sum, d) => sum + d.orders, 0) || 0;
  const totalRevenue = ordersData?.reduce((sum, d) => sum + d.revenue, 0) || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Business performance insights</p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {(['today', 'week', 'month'] as DateRange[]).map((range) => (
                <Button
                  key={range}
                  size="sm"
                  variant={dateRange === range ? 'default' : 'ghost'}
                  onClick={() => setDateRange(range)}
                  className="capitalize"
                >
                  {range === 'today' ? 'Today' : range === 'week' ? '7 Days' : '30 Days'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. {totalRevenue.toFixed(0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. {avgOrderValue.toFixed(0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Orders Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Orders Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
              ) : ordersData && ordersData.length > 0 ? (
                <ResponsiveContainer width="100%" height={256}>
                  <LineChart data={ordersData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
              ) : ordersData && ordersData.length > 0 ? (
                <ResponsiveContainer width="100%" height={256}>
                  <AreaChart data={ordersData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      formatter={(value: number) => [`Rs. ${value.toFixed(0)}`, 'Revenue']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--success))" 
                      fill="hsl(var(--success) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Popular Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
              ) : popularProducts && popularProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={256}>
                  <BarChart data={popularProducts.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100} 
                      className="text-xs" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="quantity" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {statusLoading ? (
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
              ) : statusDistribution && statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={256}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="status"
                      label={({ status }) => status}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            {peakLoading ? (
              <div className="h-64 bg-muted animate-pulse rounded-lg" />
            ) : peakHours && peakHours.some(h => h.orders > 0) ? (
              <ResponsiveContainer width="100%" height={256}>
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
