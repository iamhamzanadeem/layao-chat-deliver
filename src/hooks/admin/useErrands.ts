import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ErrandApprovalStatus, ErrandOrder } from '@/types/errand';

interface DeliveryAddressData {
  label: string;
  fullAddress: string;
  area?: string;
  landmark?: string;
}

interface ErrandWithOrder extends Omit<ErrandOrder, 'task_type' | 'approval_status'> {
  task_type: string;
  approval_status: string;
  order: {
    id: string;
    order_number: string;
    status: string;
    delivery_address: DeliveryAddressData;
    user_id: string;
    created_at: string;
  };
  profile?: {
    full_name: string | null;
    phone: string | null;
  };
}

interface UseErrandsOptions {
  approvalStatus?: ErrandApprovalStatus | 'all';
}

export const useErrands = (options?: UseErrandsOptions) => {
  const { approvalStatus = 'all' } = options || {};

  return useQuery({
    queryKey: ['admin-errands', approvalStatus],
    queryFn: async (): Promise<ErrandWithOrder[]> => {
      let query = supabase
        .from('errand_orders')
        .select(`
          *,
          order:orders!inner(
            id,
            order_number,
            status,
            delivery_address,
            user_id,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (approvalStatus !== 'all') {
        query = query.eq('approval_status', approvalStatus);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles for all unique user_ids
      const userIds = [...new Set((data || []).map((e) => e.order.user_id))];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, phone')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
        
        return (data || []).map((errand) => ({
          ...errand,
          order: {
            ...errand.order,
            delivery_address: errand.order.delivery_address as unknown as DeliveryAddressData,
          },
          profile: profileMap.get(errand.order.user_id) || undefined,
        })) as ErrandWithOrder[];
      }

      return (data || []).map((errand) => ({
        ...errand,
        order: {
          ...errand.order,
          delivery_address: errand.order.delivery_address as unknown as DeliveryAddressData,
        },
      })) as ErrandWithOrder[];
    },
  });
};

export const useErrand = (id: string | undefined) => {
  return useQuery({
    queryKey: ['admin-errand', id],
    queryFn: async (): Promise<ErrandWithOrder | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('errand_orders')
        .select(`
          *,
          order:orders!inner(
            id,
            order_number,
            status,
            delivery_address,
            user_id,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .eq('id', data.order.user_id)
        .single();

      return {
        ...data,
        order: {
          ...data.order,
          delivery_address: data.order.delivery_address as unknown as DeliveryAddressData,
        },
        profile: profile || undefined,
      } as ErrandWithOrder;
    },
    enabled: !!id,
  });
};

interface UpdateErrandApprovalInput {
  id: string;
  approvalStatus: ErrandApprovalStatus;
  adminNotes?: string;
  finalPrice?: number;
}

export const useUpdateErrandApproval = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: UpdateErrandApprovalInput) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const updateData: Record<string, unknown> = {
        approval_status: input.approvalStatus,
        admin_notes: input.adminNotes || null,
        approved_by: userData.user.id,
        approved_at: new Date().toISOString(),
      };

      if (input.finalPrice !== undefined) {
        updateData.final_price = input.finalPrice;
      }

      const { data, error } = await supabase
        .from('errand_orders')
        .update(updateData)
        .eq('id', input.id)
        .select('*, order:orders!inner(id, order_number, status)')
        .single();

      if (error) throw error;

      // Update parent order status based on approval
      if (input.approvalStatus === 'approved') {
        await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', data.order_id);
      } else if (input.approvalStatus === 'rejected') {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', data.order_id);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-errands'] });
      queryClient.invalidateQueries({ queryKey: ['admin-errand', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      
      const statusLabels: Record<ErrandApprovalStatus, string> = {
        pending: 'marked as pending',
        approved: 'approved',
        rejected: 'rejected',
        quoted: 'quoted',
      };
      
      toast({
        title: `Errand ${statusLabels[variables.approvalStatus]}`,
        description: `The errand request has been ${statusLabels[variables.approvalStatus]}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update errand',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useTodayErrandStats = () => {
  return useQuery({
    queryKey: ['admin-errand-stats-today'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('errand_orders')
        .select('id, approval_status, estimated_total, final_price, created_at')
        .gte('created_at', today.toISOString());

      if (error) throw error;

      const stats = {
        totalRequests: data?.length || 0,
        pending: data?.filter((e) => e.approval_status === 'pending').length || 0,
        approved: data?.filter((e) => e.approval_status === 'approved').length || 0,
        rejected: data?.filter((e) => e.approval_status === 'rejected').length || 0,
        estimatedRevenue: data?.reduce((sum, e) => sum + Number(e.final_price || e.estimated_total || 0), 0) || 0,
      };

      return stats;
    },
  });
};
