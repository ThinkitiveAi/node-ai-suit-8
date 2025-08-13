// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'provider' | 'patient';
}

export interface Provider extends User {
  role: 'provider';
  phoneNumber: string;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience: number;
  clinicAddress: Address;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
}

export interface Patient extends User {
  role: 'patient';
  phoneNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address: Address;
  emergencyContact?: EmergencyContact;
  medicalHistory?: string[];
  insuranceInfo?: InsuranceInfo;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
}

// Address Types
export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
}

// Availability Types
export interface ProviderAvailability {
  id: string;
  provider_id: string;
  date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly';
  recurrence_end_date?: string;
  slot_duration: number;
  break_duration: number;
  status: 'available' | 'booked' | 'cancelled' | 'blocked' | 'maintenance';
  max_appointments_per_slot: number;
  current_appointments: number;
  appointment_type: 'consultation' | 'follow_up' | 'emergency' | 'telemedicine';
  location: Location;
  pricing?: Pricing;
  notes?: string;
  special_requirements?: string[];
  created_at: string;
  updated_at: string;
}

export interface Location {
  type: 'clinic' | 'hospital' | 'telemedicine' | 'home_visit';
  address?: string;
  room_number?: string;
}

export interface Pricing {
  base_fee: number;
  insurance_accepted: boolean;
  currency: string;
}

export interface AppointmentSlot {
  id: string;
  availability_id: string;
  provider_id: string;
  slot_start_time: string;
  slot_end_time: string;
  status: 'available' | 'booked' | 'cancelled' | 'blocked';
  patient_id?: string;
  appointment_type: string;
  booking_reference?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  error_code?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Form Types - Updated to be more flexible
export interface ProviderRegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience: number;
  clinicAddress: Address;
}

export interface PatientRegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address: Address;
  emergencyContact?: EmergencyContact;
  insuranceInfo?: InsuranceInfo;
}

export interface LoginForm {
  emailOrPhone: string;
  password: string;
}

export interface AvailabilityForm {
  date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  slot_duration: number;
  break_duration: number;
  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly';
  recurrence_end_date?: string;
  appointment_type: 'consultation' | 'follow_up' | 'emergency' | 'telemedicine';
  location: Location;
  pricing?: Pricing;
  special_requirements?: string[];
  notes?: string;
}

// Search Types
export interface AppointmentSearchParams {
  date?: string;
  start_date?: string;
  end_date?: string;
  specialization?: string;
  location?: string;
  appointment_type?: string;
  insurance_accepted?: boolean;
  max_price?: number;
  timezone?: string;
  available_only?: boolean;
} 