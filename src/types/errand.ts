export type ErrandTaskType = 'document' | 'restaurant' | 'package' | 'custom';
export type ErrandApprovalStatus = 'pending' | 'approved' | 'rejected' | 'quoted';

export interface ErrandDetails {
  taskType: ErrandTaskType;
  taskDescription: string;
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  pickupContactName?: string;
  pickupContactPhone?: string;
}

export interface ErrandPriceEstimate {
  distance_km: number;
  base_fee: number;
  distance_fee: number;
  total_fee: number;
}

export interface ErrandOrder {
  id: string;
  order_id: string;
  task_type: ErrandTaskType;
  task_description: string;
  pickup_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  pickup_contact_name?: string;
  pickup_contact_phone?: string;
  base_fee: number;
  distance_km?: number;
  distance_fee: number;
  estimated_total: number;
  approval_status: ErrandApprovalStatus;
  approved_by?: string;
  approved_at?: string;
  admin_notes?: string;
  final_price?: number;
  created_at: string;
  updated_at: string;
}

export const ERRAND_TASK_TYPES: { value: ErrandTaskType; label: string; description: string; icon: string }[] = [
  { value: 'document', label: 'Document Pickup', description: 'Pick up and deliver documents', icon: '📄' },
  { value: 'restaurant', label: 'Restaurant Order', description: 'Order from any restaurant', icon: '🍽️' },
  { value: 'package', label: 'Package Delivery', description: 'Pick up and deliver a package', icon: '📦' },
  { value: 'custom', label: 'Custom Task', description: 'Any other errand you need', icon: '✨' },
];
