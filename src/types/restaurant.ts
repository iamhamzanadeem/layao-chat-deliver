import type { Tables } from '@/integrations/supabase/types';

export type Restaurant = Tables<'restaurants'>;

export type RestaurantType = 'layao_store' | 'partner';

// Partner restaurant is just a Restaurant with restaurant_type = 'partner'
export type PartnerRestaurant = Restaurant & {
  restaurant_type: 'partner';
};

export interface RestaurantMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  image_url?: string;
  is_available: boolean;
  category_name?: string;
}
