import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { ErrandDetails, ErrandPriceEstimate, ErrandOrder } from '@/types/errand';
import type { DeliveryAddress } from '@/contexts/OrderContext';

interface CreateErrandInput {
  errandDetails: ErrandDetails;
  deliveryAddress: DeliveryAddress;
  priceEstimate: ErrandPriceEstimate;
  notes?: string;
}

interface ErrandResult {
  orderId: string;
  orderNumber: string;
  errandOrderId: string;
}

// Generate order number: LAY-YYYYMMDD-XXXX
const generateOrderNumber = (): string => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `ERR-${datePart}-${randomPart}`;
};

export const useErrandPriceEstimate = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      pickupLat,
      pickupLng,
      deliveryLat,
      deliveryLng,
    }: {
      pickupLat: number;
      pickupLng: number;
      deliveryLat: number;
      deliveryLng: number;
    }): Promise<ErrandPriceEstimate> => {
      const { data, error } = await supabase.rpc('calculate_errand_price', {
        p_pickup_lat: pickupLat,
        p_pickup_lng: pickupLng,
        p_delivery_lat: deliveryLat,
        p_delivery_lng: deliveryLng,
      });

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Failed to calculate price');

      return data[0] as ErrandPriceEstimate;
    },
    onError: (error) => {
      toast({
        title: 'Failed to calculate price',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useCreateErrand = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateErrandInput): Promise<ErrandResult> => {
      if (!user) throw new Error('User not authenticated');

      const orderNumber = generateOrderNumber();

      // Create the main order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          order_type: 'errand',
          status: 'pending',
          delivery_type: 'errand',
          delivery_address: {
            label: input.deliveryAddress.label,
            fullAddress: input.deliveryAddress.fullAddress,
            area: input.deliveryAddress.area,
            landmark: input.deliveryAddress.landmark,
          },
          subtotal: 0,
          delivery_fee: input.priceEstimate.total_fee,
          total: input.priceEstimate.total_fee,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create the errand order details
      const { data: errandOrder, error: errandError } = await supabase
        .from('errand_orders')
        .insert({
          order_id: order.id,
          task_type: input.errandDetails.taskType,
          task_description: input.errandDetails.taskDescription,
          pickup_address: input.errandDetails.pickupAddress,
          pickup_lat: input.errandDetails.pickupLat,
          pickup_lng: input.errandDetails.pickupLng,
          pickup_contact_name: input.errandDetails.pickupContactName,
          pickup_contact_phone: input.errandDetails.pickupContactPhone,
          base_fee: input.priceEstimate.base_fee,
          distance_km: input.priceEstimate.distance_km,
          distance_fee: input.priceEstimate.distance_fee,
          estimated_total: input.priceEstimate.total_fee,
          approval_status: 'pending',
        })
        .select()
        .single();

      if (errandError) throw errandError;

      return {
        orderId: order.id,
        orderNumber: order.order_number,
        errandOrderId: errandOrder.id,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      queryClient.invalidateQueries({ queryKey: ['user-errands'] });
      toast({
        title: 'Errand request submitted! 🚀',
        description: `Request ${result.orderNumber} is pending admin approval.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to submit errand request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUserErrands = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-errands', user?.id],
    queryFn: async (): Promise<(ErrandOrder & { order: { order_number: string; status: string } })[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('errand_orders')
        .select(`
          *,
          order:orders!inner(order_number, status, user_id)
        `)
        .eq('order.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as (ErrandOrder & { order: { order_number: string; status: string } })[];
    },
    enabled: !!user,
  });
};
