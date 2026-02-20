export interface Profile {
  id: string;
  full_name: string | null;
  performance_goal: string;
  metabolic_type: string;
  glycemic_vigilance: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthLog {
  id: string;
  user_id: string;
  vitality_score: number;
  cognitive_index: number;
  metabolic_stability: number;
  recovery_index: number;
  logged_at: string;
  created_at: string;
}

export interface Recommendation {
  id: string;
  dish_name: string;
  restaurant_name: string;
  description: string;
  performance_rating: number;
  metabolic_compatibility: string[];
  cognitive_boost: boolean;
  recovery_support: boolean;
  is_low_gi: boolean;
  price_tier: string;
  created_at: string;
}
