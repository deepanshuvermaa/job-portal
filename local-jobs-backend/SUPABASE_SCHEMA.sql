-- =====================================================
-- SUPABASE DATABASE SCHEMA
-- Hyperlocal Job Marketplace Platform
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('worker', 'employer', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- WORKER PROFILES
-- =====================================================
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),

  -- Address
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Documents (URLs from Cloudinary)
  aadhaar_front_url TEXT,
  aadhaar_back_url TEXT,
  photo_url TEXT,
  resume_url TEXT,

  -- OCR Extracted Data
  aadhaar_number VARCHAR(12),
  aadhaar_name VARCHAR(255),
  ocr_confidence DECIMAL(5, 2),
  ocr_verified BOOLEAN DEFAULT FALSE,

  -- Skills & Experience
  skills TEXT[], -- Array of skills
  experience_years INTEGER DEFAULT 0,
  preferred_job_types TEXT[],
  preferred_locations TEXT[],
  bio TEXT,

  -- Verification Status
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,

  -- Ratings
  average_rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
  total_ratings INTEGER DEFAULT 0,
  total_hires INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EMPLOYER PROFILES
-- =====================================================
CREATE TABLE employer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50) CHECK (business_type IN ('individual', 'company', 'contractor', 'other')),
  contact_person VARCHAR(255),

  -- Business Address
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Documents
  gst_certificate_url TEXT,
  business_license_url TEXT,
  pan_card_url TEXT,

  -- OCR Extracted Data
  gst_number VARCHAR(15),
  pan_number VARCHAR(10),
  ocr_confidence DECIMAL(5, 2),
  ocr_verified BOOLEAN DEFAULT FALSE,

  -- Business Details
  description TEXT,
  industry VARCHAR(100),
  employee_count VARCHAR(50),

  -- Verification Status
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,

  -- Ratings
  average_rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
  total_ratings INTEGER DEFAULT 0,
  total_hires INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- JOBS TABLE
-- =====================================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Job Details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  job_type VARCHAR(50) NOT NULL,
  employment_type VARCHAR(50) NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'daily-wage', 'temporary')),

  -- Location
  location TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  pincode VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Compensation
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  salary_type VARCHAR(20) CHECK (salary_type IN ('hourly', 'daily', 'monthly', 'fixed', 'negotiable')),

  -- Requirements
  required_skills TEXT[],
  experience_required INTEGER DEFAULT 0,
  education_required VARCHAR(100),
  vacancies INTEGER DEFAULT 1,

  -- Additional Details
  benefits TEXT[],
  working_hours VARCHAR(100),
  contact_phone VARCHAR(15),
  contact_email VARCHAR(255),

  -- Job Status
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled', 'cancelled', 'draft')),
  is_featured BOOLEAN DEFAULT FALSE,
  expiry_date TIMESTAMP WITH TIME ZONE,

  -- Counters
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- APPLICATIONS TABLE
-- =====================================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Application Details
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'rejected', 'hired', 'withdrawn')),
  cover_letter TEXT,
  expected_salary DECIMAL(10, 2),
  available_from DATE,

  -- Employer Actions
  employer_notes TEXT,
  interview_scheduled_at TIMESTAMP WITH TIME ZONE,
  interview_location TEXT,

  -- Timestamps
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hired_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(job_id, worker_id) -- Prevent duplicate applications
);

-- =====================================================
-- REVIEWS & RATINGS
-- =====================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id),
  application_id UUID REFERENCES applications(id),

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_type VARCHAR(30) CHECK (review_type IN ('worker_to_employer', 'employer_to_worker')),

  is_verified BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(reviewer_id, reviewee_id, job_id) -- One review per job per pair
);

-- =====================================================
-- SAVED JOBS (Worker Bookmarks)
-- =====================================================
CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(worker_id, job_id)
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REPORTS/COMPLAINTS
-- =====================================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id),
  reported_user_id UUID REFERENCES users(id),
  reported_job_id UUID REFERENCES jobs(id),

  reason VARCHAR(50) NOT NULL CHECK (reason IN ('fake_profile', 'spam', 'harassment', 'fraud', 'inappropriate_content', 'other')),
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),

  admin_notes TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- OTP VERIFICATION
-- =====================================================
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  purpose VARCHAR(50) NOT NULL CHECK (purpose IN ('registration', 'login', 'password_reset', 'phone_verification')),

  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ADMIN ACTIVITY LOGS
-- =====================================================
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id),

  action VARCHAR(100) NOT NULL,
  target_user_id UUID REFERENCES users(id),
  target_job_id UUID REFERENCES jobs(id),
  details JSONB,

  ip_address VARCHAR(45),
  user_agent TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Worker Profiles
CREATE INDEX idx_worker_profiles_user_id ON worker_profiles(user_id);
CREATE INDEX idx_worker_profiles_city ON worker_profiles(city);
CREATE INDEX idx_worker_profiles_verification_status ON worker_profiles(verification_status);
CREATE INDEX idx_worker_profiles_skills ON worker_profiles USING GIN(skills);

-- Employer Profiles
CREATE INDEX idx_employer_profiles_user_id ON employer_profiles(user_id);
CREATE INDEX idx_employer_profiles_city ON employer_profiles(city);
CREATE INDEX idx_employer_profiles_verification_status ON employer_profiles(verification_status);

-- Jobs
CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_city ON jobs(city);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_expiry_date ON jobs(expiry_date);
CREATE INDEX idx_jobs_skills ON jobs USING GIN(required_skills);

-- Applications
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_worker_id ON applications(worker_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at DESC);

-- Reviews
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_job_id ON reviews(job_id);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Saved Jobs
CREATE INDEX idx_saved_jobs_worker_id ON saved_jobs(worker_id);
CREATE INDEX idx_saved_jobs_job_id ON saved_jobs(job_id);

-- Reports
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reported_user_id ON reports(reported_user_id);

-- OTP
CREATE INDEX idx_otp_phone ON otp_verifications(phone);
CREATE INDEX idx_otp_expires_at ON otp_verifications(expires_at);

-- Admin Logs
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Users Table Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Worker Profiles Policies
CREATE POLICY "Workers can view own profile" ON worker_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Workers can update own profile" ON worker_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Employers can view verified worker profiles" ON worker_profiles
  FOR SELECT USING (verification_status = 'approved');

-- Employer Profiles Policies
CREATE POLICY "Employers can view own profile" ON employer_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Employers can update own profile" ON employer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Workers can view verified employer profiles" ON employer_profiles
  FOR SELECT USING (verification_status = 'approved');

-- Jobs Policies
CREATE POLICY "Anyone can view open jobs" ON jobs
  FOR SELECT USING (status = 'open');

CREATE POLICY "Employers can view own jobs" ON jobs
  FOR SELECT USING (auth.uid() = employer_id);

CREATE POLICY "Employers can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete own jobs" ON jobs
  FOR DELETE USING (auth.uid() = employer_id);

-- Applications Policies
CREATE POLICY "Workers can view own applications" ON applications
  FOR SELECT USING (auth.uid() = worker_id);

CREATE POLICY "Workers can create applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Employers can view applications for own jobs" ON applications
  FOR SELECT USING (
    auth.uid() IN (SELECT employer_id FROM jobs WHERE id = applications.job_id)
  );

CREATE POLICY "Employers can update applications for own jobs" ON applications
  FOR UPDATE USING (
    auth.uid() IN (SELECT employer_id FROM jobs WHERE id = applications.job_id)
  );

-- Reviews Policies
CREATE POLICY "Users can view reviews about themselves" ON reviews
  FOR SELECT USING (auth.uid() = reviewee_id OR is_visible = TRUE);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Saved Jobs Policies
CREATE POLICY "Workers can manage own saved jobs" ON saved_jobs
  FOR ALL USING (auth.uid() = worker_id);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Reports Policies
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON worker_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_profiles_updated_at BEFORE UPDATE ON employer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update application count when application is created
CREATE OR REPLACE FUNCTION increment_application_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs SET applications_count = applications_count + 1 WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_job_application_count AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION increment_application_count();

-- Update ratings when review is created
CREATE OR REPLACE FUNCTION update_average_rating()
RETURNS TRIGGER AS $$
DECLARE
  profile_table TEXT;
BEGIN
  -- Determine which profile table to update
  SELECT role INTO profile_table FROM users WHERE id = NEW.reviewee_id;

  IF profile_table = 'worker' THEN
    UPDATE worker_profiles
    SET
      total_ratings = total_ratings + 1,
      average_rating = (
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM reviews
        WHERE reviewee_id = NEW.reviewee_id
      )
    WHERE user_id = NEW.reviewee_id;
  ELSIF profile_table = 'employer' THEN
    UPDATE employer_profiles
    SET
      total_ratings = total_ratings + 1,
      average_rating = (
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM reviews
        WHERE reviewee_id = NEW.reviewee_id
      )
    WHERE user_id = NEW.reviewee_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_average_rating();

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- Insert Tier 2/3 Indian Cities (for autocomplete)
-- You can populate this separately as needed

-- =====================================================
-- END OF SCHEMA
-- =====================================================
