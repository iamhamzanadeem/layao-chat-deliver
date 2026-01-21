import type { Tables } from '@/integrations/supabase/types';

export type Product = Tables<'products'>;

// Extended product - uses the base Product type which now includes the new fields
export type ExtendedProduct = Product;

export type MessageType = 
  | 'text' 
  | 'image' 
  | 'voice' 
  | 'product_card' 
  | 'order_summary' 
  | 'status_update' 
  | 'bot' 
  | 'product_results' 
  | 'category_prompt'
  | 'delivery_type_select'
  | 'address_select'
  | 'order_confirmation'
  | 'order_placed';

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  metadata?: Record<string, unknown>;
  isFromUser: boolean;
  createdAt: Date;
  orderId?: string;
  // For product_results type
  products?: ExtendedProduct[];
  keywords?: string[];
  // Grouped products by matched search term (e.g., "egg" -> [egg products], "bread" -> [bread products])
  groupedProducts?: Record<string, ExtendedProduct[]>;
}

export interface ProductCardData {
  productId: string;
  name: string;
  price: number;
  unit: string;
  imageUrl?: string;
  description?: string;
  // Extended fields for deals/popularity
  isPopular?: boolean;
  originalPrice?: number | null;
  discountPercent?: number | null;
}

export interface OrderSummaryData {
  orderId: string;
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  address: string;
}

export interface StatusUpdateData {
  orderId: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
  message: string;
  timestamp: Date;
}