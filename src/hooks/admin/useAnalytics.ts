import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type DateRange = 'today' | 'week' | 'month' | 'custom';

interface UseAnalyticsOptions {
  range: DateRange;
  startDate?: Date;
  endDate?: Date;
}

const getDateRange = (range: DateRange, startDate?: Date, endDate?: Date) => {
  const now = new Date();
  let start: Date;
  let end: Date = now;

  switch (range) {
    case 'today':
      start = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      start = new Date();
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start = new Date();
      start.setMonth(start.getMonth() - 1);
      break;
    case 'custom':
      start = startDate || new Date();
      end = endDate || new Date();
      break;
    default:
      start = new Date();
      start.setDate(start.getDate() - 7);
  }

  return { start, end };
};

export const useOrdersAnalytics = (options: UseAnalyticsOptions) => {
  const { range, startDate, endDate } = options;
  const { start, end } = getDateRange(range, startDate, endDate);

  return useQuery({
    queryKey: ['admin-analytics-orders', range, start.toISOString(), end.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const byDate: Record<string, { orders: number; revenue: number }> = {};

      data?.forEach((order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        if (!byDate[date]) {
          byDate[date] = { orders: 0, revenue: 0 };
        }
        byDate[date].orders += 1;
        byDate[date].revenue += Number(order.total) || 0;
      });

      return Object.entries(byDate).map(([date, stats]) => ({
        date,
        orders: stats.orders,
        revenue: stats.revenue,
      }));
    },
  });
};

export const usePopularProducts = (options: UseAnalyticsOptions) => {
  const { range, startDate, endDate } = options;
  const { start, end } = getDateRange(range, startDate, endDate);

  return useQuery({
    queryKey: ['admin-analytics-popular-products', range, start.toISOString(), end.toISOString()],
    queryFn: async () => {
      // Get orders in date range
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (ordersError) throw ordersError;

      const orderIds = orders?.map((o) => o.id) || [];

      if (orderIds.length === 0) {
        return [];
      }

      // Get order items for those orders
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('product_name, quantity, total_price')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Aggregate by product
      const productStats: Record<string, { quantity: number; revenue: number }> = {};

      items?.forEach((item) => {
        if (!productStats[item.product_name]) {
          productStats[item.product_name] = { quantity: 0, revenue: 0 };
        }
        productStats[item.product_name].quantity += item.quantity;
        productStats[item.product_name].revenue += Number(item.total_price) || 0;
      });

      return Object.entries(productStats)
        .map(([name, stats]) => ({
          name,
          quantity: stats.quantity,
          revenue: stats.revenue,
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);
    },
  });
};

export const useStatusDistribution = () => {
  return useQuery({
    queryKey: ['admin-analytics-status-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status');

      if (error) throw error;

      const distribution: Record<string, number> = {};

      data?.forEach((order) => {
        distribution[order.status] = (distribution[order.status] || 0) + 1;
      });

      return Object.entries(distribution).map(([status, count]) => ({
        status,
        count,
      }));
    },
  });
};

export const usePeakHours = (options: UseAnalyticsOptions) => {
  const { range, startDate, endDate } = options;
  const { start, end } = getDateRange(range, startDate, endDate);

  return useQuery({
    queryKey: ['admin-analytics-peak-hours', range, start.toISOString(), end.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (error) throw error;

      const hourCounts: Record<number, number> = {};

      data?.forEach((order) => {
        const hour = new Date(order.created_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      return Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        orders: hourCounts[i] || 0,
      }));
    },
  });
};
