import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  delivery_radius_km: number;
  distance_km: number;
  is_within_delivery_radius: boolean;
  is_active: boolean;
  opening_time: string | null;
  closing_time: string | null;
  image_url: string | null;
  phone: string | null;
}

interface UseNearbyRestaurantsOptions {
  latitude: number | null;
  longitude: number | null;
  maxDistanceKm?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch nearby restaurants based on user location
 */
export const useNearbyRestaurants = (options: UseNearbyRestaurantsOptions) => {
  const { latitude, longitude, maxDistanceKm = 10, enabled = true } = options;

  return useQuery({
    queryKey: ['nearby-restaurants', latitude, longitude, maxDistanceKm],
    queryFn: async (): Promise<Restaurant[]> => {
      if (latitude === null || longitude === null) {
        return [];
      }

      const { data, error } = await supabase.rpc('get_nearby_restaurants', {
        user_lat: latitude,
        user_lng: longitude,
        max_distance_km: maxDistanceKm,
      });

      if (error) {
        console.error('Error fetching nearby restaurants:', error);
        throw error;
      }

      return (data as Restaurant[]) || [];
    },
    enabled: enabled && latitude !== null && longitude !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single restaurant by slug
 */
export const useRestaurant = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};

/**
 * Hook to fetch all active restaurants (for admin or fallback)
 */
export const useAllRestaurants = () => {
  return useQuery({
    queryKey: ['all-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};
