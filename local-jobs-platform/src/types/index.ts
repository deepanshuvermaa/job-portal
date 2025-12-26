// Core types for the platform

export type UserRole = 'employer' | 'worker' | 'admin';

export type WorkType = 'full-time' | 'part-time' | 'daily-wage';

export type SalaryType = 'monthly' | 'daily' | 'per-delivery' | 'hourly';

export type JobCategory =
  | 'delivery'
  | 'driver'
  | 'helper'
  | 'mechanic'
  | 'electrician'
  | 'plumber'
  | 'cook'
  | 'waiter'
  | 'cleaner'
  | 'security'
  | 'sales'
  | 'factory-worker';

export type ApplicationStatus =
  | 'sent'
  | 'viewed'
  | 'call-received'
  | 'selected'
  | 'hired'
  | 'rejected';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'under-review';

export type ExperienceLevel = 'fresher' | '1-2' | '3-5' | '5+';

export type Availability = 'full-time' | 'part-time' | 'night-shift' | 'weekends';

// User types
export interface User {
  id: string;
  phone: string;
  role: UserRole;
  name: string;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

// Employer
export interface Employer extends User {
  role: 'employer';
  businessType: string;
  businessName?: string;
  location: Location;
  proofDocumentUrl?: string;
  gstNumber?: string;
  responsivenesScore?: number;
  verifiedBadge: boolean;
}

// Worker
export interface Worker extends User {
  role: 'worker';
  location: Location;
  skills: JobCategory[];
  experience: ExperienceLevel;
  availability: Availability[];
  languages: string[];
  voiceIntroUrl?: string;
  photoUrl?: string;
  reliabilityScore?: number;
  verifiedBadge: boolean;
}

// Location
export interface Location {
  city: string;
  area: string;
  locality: string;
  latitude: number;
  longitude: number;
  pincode?: string;
}

// Job
export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  employerVerified: boolean;
  category: JobCategory;
  subRole?: string;
  title: string;
  workType: WorkType;
  salaryType: SalaryType;
  salaryMin: number;
  salaryMax: number;
  location: Location;
  workingHours?: string;
  weeklyOff?: string;
  requirements: JobRequirements;
  benefits: JobBenefits;
  contactMethod: ('call' | 'whatsapp' | 'in-app')[];
  contactPhone?: string;
  status: 'pending' | 'active' | 'closed' | 'rejected';
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  applicantCount?: number;
  viewCount?: number;
}

export interface JobRequirements {
  experienceNeeded: boolean;
  bikeRequired?: boolean;
  licenseRequired?: boolean;
  minAge?: number;
  maxAge?: number;
  gender?: 'any' | 'male' | 'female';
}

export interface JobBenefits {
  food?: boolean;
  accommodation?: boolean;
  incentives?: boolean;
  overtime?: boolean;
  insurance?: boolean;
}

// Application
export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  workerSkills: JobCategory[];
  workerExperience: ExperienceLevel;
  workerLocation: Location;
  distance: number; // in km
  note?: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  employerViewed: boolean;
  workerReceivedCall: boolean;
}

// Job Filters
export interface JobFilters {
  category?: JobCategory;
  workType?: WorkType;
  maxDistance?: number; // in km
  salaryMin?: number;
  salaryMax?: number;
  experienceRequired?: boolean;
}

// Admin/Moderation
export interface ModerationItem {
  id: string;
  type: 'employer' | 'job' | 'worker' | 'report';
  itemId: string;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface Report {
  id: string;
  reportedBy: string;
  reportedItemType: 'job' | 'employer' | 'worker';
  reportedItemId: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'action-taken' | 'dismissed';
  createdAt: string;
}

// Auth
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Language
export type Language = 'en' | 'hi';

export interface Translation {
  [key: string]: string | Translation;
}
