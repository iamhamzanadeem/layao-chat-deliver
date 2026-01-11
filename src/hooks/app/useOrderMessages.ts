import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

export type Message = Tables<'messages'>;

export const useOrderMessages = (orderId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['order-messages', orderId],
    queryFn: async (): Promise<Message[]> => {
      if (!orderId || !user) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!orderId && !!user,
  });
};
