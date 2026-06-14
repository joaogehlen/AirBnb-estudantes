// ============================================================
// TIPOS PRINCIPAIS DO STUDENTNEST
// ============================================================

export type UserType = 'student' | 'host';
export type PropertyType = 'room' | 'studio' | 'republic' | 'apartment';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  user_type: UserType;
  university_email: string | null;
  is_verified: boolean;
  bio: string | null;
  phone: string | null;
  created_at: string;
}

export interface University {
  id: string;
  name: string;
  city: string;
  state: string;
  domain_email: string;
}

export interface Property {
  id: string;
  host_id: string;
  title: string;
  description: string;
  type: PropertyType;
  city: string;
  state: string;
  neighborhood: string;
  price_per_month: number;
  min_stay_months: number;
  max_guests: number;
  is_active: boolean;
  rules: string | null;
  created_at: string;
  host?: Profile;
  photos?: PropertyPhoto[];
  average_rating?: number;
  review_count?: number;
}

export interface PropertyPhoto {
  id: string;
  property_id: string;
  url: string;
  is_cover: boolean;
  order_index: number;
}

export interface Amenity {
  id: string;
  name: string;
  icon_name: string;
}

export interface Booking {
  id: string;
  property_id: string;
  student_id: string;
  host_id: string;
  status: BookingStatus;
  check_in: string;
  check_out: string;
  total_price: number;
  months: number;
  created_at: string;
  property?: Property;
  student?: Profile;
  host?: Profile;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  property_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: Profile;
}

export interface Favorite {
  student_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}

export interface Conversation {
  id: string;
  property_id: string;
  student_id: string;
  host_id: string;
  last_message_at: string;
  property?: Property;
  student?: Profile;
  host?: Profile;
  last_message?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface SearchFilters {
  city: string;
  type: PropertyType | null;
  min_price: number | null;
  max_price: number | null;
}
