export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'citizen' | 'admin';
  address?: string;
  phone?: string;
  total_points?: number;
  items_sorted?: number;
  pickups_count?: number;
}

export interface WasteCategory {
  id: number;
  code: string;
  name: string;
  icon: string;
  color: string;
  bg_color: string;
  bin_name: string;
  bin_color: string;
  description: string;
  disposal_guidance: string;
  recyclability: string;
}

export interface WasteItem {
  id: number;
  name: string;
  aliases: string;
  category_id: number;
  category_code: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  category_bg_color: string;
  bin_name: string;
  bin_color: string;
  preparation_steps: string;
  disposal_method: string;
  recyclability_status: string;
  warnings?: string;
  facility_type_needed?: string;
  source: string;
  region: string;
  popular: number;
  related_items?: Array<{ id: number; name: string; recyclability_status: string }>;
}

export interface ClassificationResult {
  predicted_item_name: string;
  category_id: number;
  category_code: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  category_bg_color: string;
  bin_name: string;
  bin_color: string;
  confidence: number;
  uncertain: boolean;
  preparation_steps: string;
  disposal_method: string;
  recyclability_status: string;
  warnings?: string;
  facility_type_needed?: string;
  source: string;
  model_provider: string;
  is_real_ai: boolean;
  alternatives: Array<{
    id: number;
    name: string;
    category_id: number;
    category_name: string;
  }>;
}

export interface ClassificationRecord {
  id: number;
  user_id?: number;
  image_url?: string;
  predicted_item_name: string;
  category_id: number;
  confidence: number;
  model_provider: string;
  status: 'predicted' | 'confirmed' | 'corrected';
  confirmed_category_id?: number;
  notes?: string;
  points_awarded: number;
  uncertain: number;
  created_at: string;
  predicted_category_name?: string;
  predicted_category_icon?: string;
  predicted_category_color?: string;
  confirmed_category_name?: string;
  confirmed_category_icon?: string;
  confirmed_category_color?: string;
  bin_name?: string;
}

export interface Facility {
  id: number;
  name: string;
  facility_type: string;
  address: string;
  city: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  operating_hours: string;
  supported_materials: string[];
  verified: number;
}

export interface PickupBooking {
  id: number;
  booking_reference: string;
  user_id: number;
  waste_category_id: number;
  category_name: string;
  category_code: string;
  category_icon: string;
  category_color: string;
  estimated_weight_kg: number;
  pickup_address: string;
  preferred_date: string;
  time_slot: string;
  contact_preference: string;
  notes?: string;
  status: 'requested' | 'confirmed' | 'assigned' | 'collected' | 'cancelled';
  cancellation_reason?: string;
  created_at: string;
  user_name?: string;
  user_phone?: string;
  user_email?: string;
}

export interface PointsLedgerItem {
  id: number;
  user_id: number;
  event_type: string;
  reference_id: string;
  points: number;
  description: string;
  created_at: string;
}

export interface UserBadge {
  code: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export interface ImpactSummary {
  user_metrics: {
    total_items_sorted: number;
    total_ecopoints: number;
    estimated_diverted_kg: number;
    co2_avoided_kg: number;
    trees_saved_equivalent: number;
    category_breakdown: Record<string, number>;
  };
  platform_metrics: {
    total_items_sorted: number;
    total_diverted_metric_tons: number;
    registered_citizens: number;
    verified_facilities: number;
  };
  methodology: {
    carbon_factor: string;
    tree_factor: string;
    transparency: string;
  };
}

export interface LeaderboardItem {
  rank: number;
  display_name: string;
  points: number;
  items_sorted: number;
}

export interface AdminOverview {
  metrics: {
    citizens_count: number;
    classifications_count: number;
    pending_pickups: number;
    completed_pickups: number;
    points_distributed: number;
    facilities_count: number;
    kb_items_count: number;
  };
  category_distribution: Array<{ name: string; count: number }>;
}

export interface AuditLogItem {
  id: number;
  admin_user_id: number;
  admin_name: string;
  admin_email: string;
  action: string;
  target_entity: string;
  target_id: string;
  details: string;
  ip_address: string;
  created_at: string;
}
