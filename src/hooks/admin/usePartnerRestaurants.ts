import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type PartnerRestaurant = Tables<'restaurants'> & {
  restaurant_type: 'partner';
};

export interface CreatePartnerRestaurantInput {
  name: string;
  address: string;
  phone?: string;
  cuisine_type?: string;
  description?: string;
  latitude: number;
  longitude: number;
  delivery_radius_km?: number;
  average_prep_time?: number;
  commission_percent?: number;
  opening_time?: string;
  closing_time?: string;
  image_url?: string;
}

export interface UpdatePartnerRestaurantInput extends Partial<CreatePartnerRestaurantInput> {
  id: string;
  is_active?: boolean;
  is_accepting_orders?: boolean;
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
}

// Fetch all partner restaurants for admin
export const useAdminPartnerRestaurants = () => {
  return useQuery({
    queryKey: ['admin-partner-restaurants'],
    queryFn: async (): Promise<PartnerRestaurant[]> => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('restaurant_type', 'partner')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PartnerRestaurant[];
    },
  });
};

// Fetch single partner restaurant
export const useAdminPartnerRestaurant = (id: string | undefined) => {
  return useQuery({
    queryKey: ['admin-partner-restaurant', id],
    queryFn: async (): Promise<PartnerRestaurant | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .eq('restaurant_type', 'partner')
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data as PartnerRestaurant;
    },
    enabled: !!id,
  });
};

// Create new partner restaurant
export const useCreatePartnerRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePartnerRestaurantInput): Promise<PartnerRestaurant> => {
      const restaurantData: TablesInsert<'restaurants'> = {
        name: input.name,
        slug: generateSlug(input.name),
        address: input.address,
        phone: input.phone || null,
        cuisine_type: input.cuisine_type || null,
        description: input.description || null,
        latitude: input.latitude,
        longitude: input.longitude,
        delivery_radius_km: input.delivery_radius_km || 5,
        average_prep_time: input.average_prep_time || 30,
        commission_percent: input.commission_percent || 15,
        opening_time: input.opening_time || '09:00:00',
        closing_time: input.closing_time || '22:00:00',
        image_url: input.image_url || null,
        restaurant_type: 'partner',
        is_active: true,
        is_accepting_orders: true,
      };

      const { data, error } = await supabase
        .from('restaurants')
        .insert(restaurantData)
        .select()
        .single();

      if (error) throw error;
      return data as PartnerRestaurant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partner-restaurants'] });
      toast.success('Partner restaurant created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create restaurant: ${error.message}`);
    },
  });
};

// Update partner restaurant
export const useUpdatePartnerRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdatePartnerRestaurantInput): Promise<PartnerRestaurant> => {
      const { id, ...updates } = input;
      
      const updateData: TablesUpdate<'restaurants'> = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.cuisine_type !== undefined) updateData.cuisine_type = updates.cuisine_type;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
      if (updates.longitude !== undefined) updateData.longitude = updates.longitude;
      if (updates.delivery_radius_km !== undefined) updateData.delivery_radius_km = updates.delivery_radius_km;
      if (updates.average_prep_time !== undefined) updateData.average_prep_time = updates.average_prep_time;
      if (updates.commission_percent !== undefined) updateData.commission_percent = updates.commission_percent;
      if (updates.opening_time !== undefined) updateData.opening_time = updates.opening_time;
      if (updates.closing_time !== undefined) updateData.closing_time = updates.closing_time;
      if (updates.image_url !== undefined) updateData.image_url = updates.image_url;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
      if (updates.is_accepting_orders !== undefined) updateData.is_accepting_orders = updates.is_accepting_orders;

      const { data, error } = await supabase
        .from('restaurants')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PartnerRestaurant;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-partner-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-partner-restaurant', variables.id] });
      toast.success('Restaurant updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update restaurant: ${error.message}`);
    },
  });
};

// Quick toggle for accepting orders
export const useToggleAcceptingOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isAccepting }: { id: string; isAccepting: boolean }) => {
      const { data, error } = await supabase
        .from('restaurants')
        .update({ is_accepting_orders: isAccepting })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-partner-restaurants'] });
      toast.success(variables.isAccepting ? 'Restaurant is now accepting orders' : 'Restaurant paused');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });
};

// Delete partner restaurant
export const useDeletePartnerRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partner-restaurants'] });
      toast.success('Restaurant deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete restaurant: ${error.message}`);
    },
  });
};

// Partner restaurant stats
export const usePartnerRestaurantStats = () => {
  return useQuery({
    queryKey: ['admin-partner-restaurant-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, is_active, is_accepting_orders')
        .eq('restaurant_type', 'partner');

      if (error) throw error;

      const restaurants = data || [];
      return {
        total: restaurants.length,
        active: restaurants.filter(r => r.is_active).length,
        accepting: restaurants.filter(r => r.is_accepting_orders).length,
      };
    },
  });
};
