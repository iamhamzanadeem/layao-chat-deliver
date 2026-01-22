import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PartnerRestaurant, RestaurantMenuItem } from '@/types/restaurant';
import type { Product } from '@/types/chat';

interface UsePartnerRestaurantsOptions {
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export const usePartnerRestaurants = (options?: UsePartnerRestaurantsOptions) => {
  const { lat, lng, radiusKm = 10 } = options || {};

  return useQuery({
    queryKey: ['partner-restaurants', lat, lng, radiusKm],
    queryFn: async (): Promise<PartnerRestaurant[]> => {
      let query = supabase
        .from('restaurants')
        .select('*')
        .eq('restaurant_type', 'partner')
        .eq('is_active', true)
        .eq('is_accepting_orders', true)
        .order('name');

      const { data, error } = await query;

      if (error) throw error;

      // If location provided, filter by distance (client-side for now)
      let restaurants = (data || []) as PartnerRestaurant[];

      if (lat && lng) {
        restaurants = restaurants.filter((r) => {
          if (!r.latitude || !r.longitude) return false;
          const distance = calculateDistance(lat, lng, r.latitude, r.longitude);
          return distance <= radiusKm;
        });
      }

      return restaurants;
    },
  });
};

export const usePartnerRestaurant = (id: string | undefined) => {
  return useQuery({
    queryKey: ['partner-restaurant', id],
    queryFn: async (): Promise<PartnerRestaurant | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .eq('restaurant_type', 'partner')
        .eq('is_active', true)
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

export const useRestaurantMenu = (restaurantId: string | undefined) => {
  return useQuery({
    queryKey: ['restaurant-menu', restaurantId],
    queryFn: async (): Promise<Product[]> => {
      if (!restaurantId) return [];

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .order('name');

      if (error) throw error;

      return data || [];
    },
    enabled: !!restaurantId,
  });
};

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
