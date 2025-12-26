// Type Definitions for the Application

export interface User {
  id: string;
  phone: string;
  email?: string;
  role: 'worker' | 'employer' | 'admin';
  is_verified: boolean;
  is_active: boolean;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface WorkerProfile {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  aadhaar_front_url?: string;
  aadhaar_back_url?: string;
  photo_url?: string;
  resume_url?: string;
  aadhaar_number?: string;
  aadhaar_name?: string;
  ocr_confidence?: number;
  ocr_verified: boolean;
  skills?: string[];
  experience_years: number;
  preferred_job_types?: string[];
  preferred_locations?: string[];
  bio?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  average_rating: number;
  total_ratings: number;
  total_hires: number;
  created_at: string;
  updated_at: string;
}

export interface EmployerProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type?: 'individual' | 'company' | 'contractor' | 'other';
  contact_person?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  gst_certificate_url?: string;
  business_license_url?: string;
  pan_card_url?: string;
  gst_number?: string;
  pan_number?: string;
  ocr_confidence?: number;
  ocr_verified: boolean;
  description?: string;
  industry?: string;
  employee_count?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  average_rating: number;
  total_ratings: number;
  total_hires: number;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  job_type: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'daily-wage' | 'temporary';
  location: string;
  city: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  salary_min?: number;
  salary_max?: number;
  salary_type?: 'hourly' | 'daily' | 'monthly' | 'fixed' | 'negotiable';
  required_skills?: string[];
  experience_required: number;
  education_required?: string;
  vacancies: number;
  benefits?: string[];
  working_hours?: string;
  contact_phone?: string;
  contact_email?: string;
  status: 'open' | 'closed' | 'filled' | 'cancelled' | 'draft';
  is_featured: boolean;
  expiry_date?: string;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  worker_id: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired' | 'withdrawn';
  cover_letter?: string;
  expected_salary?: number;
  available_from?: string;
  employer_notes?: string;
  interview_scheduled_at?: string;
  interview_location?: string;
  applied_at: string;
  status_updated_at: string;
  hired_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  job_id?: string;
  application_id?: string;
  rating: number;
  comment?: string;
  review_type: 'worker_to_employer' | 'employer_to_worker';
  is_verified: boolean;
  is_visible: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  link?: string;
  metadata?: any;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id?: string;
  reported_user_id?: string;
  reported_job_id?: string;
  reason: 'fake_profile' | 'spam' | 'harassment' | 'fraud' | 'inappropriate_content' | 'other';
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface OTPVerification {
  id: string;
  phone: string;
  otp_hash: string;
  purpose: 'registration' | 'login' | 'password_reset' | 'phone_verification';
  expires_at: string;
  is_verified: boolean;
  attempts: number;
  created_at: string;
}

// Request/Response Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken {
  userId: string;
  role: 'worker' | 'employer' | 'admin';
  iat: number;
  exp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// OCR Types
export interface ExtractedDocumentData {
  name?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  gstNumber?: string;
  licenseNumber?: string;
  businessName?: string;
  rawText: string;
  documentType?: 'aadhaar' | 'pan' | 'gst' | 'license' | 'unknown';
  confidence: number;
}

// Express Request Extensions
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: 'worker' | 'employer' | 'admin';
      };
    }
  }
}
