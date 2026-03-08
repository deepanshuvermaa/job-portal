-- =====================================================
-- SCHEMA UPDATES FOR ENHANCED JOB PORTAL
-- Run these ALTER statements on existing database
-- =====================================================

-- Add alternate phone numbers and profile photos
ALTER TABLE worker_profiles
ADD COLUMN IF NOT EXISTS alternate_phones JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS has_resume BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS work_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS references JSONB DEFAULT '[]';

ALTER TABLE employer_profiles
ADD COLUMN IF NOT EXISTS alternate_phones JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

-- Add job view tracking
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS last_extended_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- JOB TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS job_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  employer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  template_name VARCHAR(255) NOT NULL,

  -- Job Details (same as jobs table)
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  job_type VARCHAR(50) NOT NULL,
  employment_type VARCHAR(50) NOT NULL,

  -- Location
  location TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  pincode VARCHAR(10),

  -- Compensation
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  salary_type VARCHAR(20),

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

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_templates_employer_id ON job_templates(employer_id);

-- =====================================================
-- JOB VIEWS TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS job_views (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  job_id TEXT REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);

CREATE INDEX idx_job_views_job_id ON job_views(job_id);
CREATE INDEX idx_job_views_worker_id ON job_views(worker_id);
CREATE INDEX idx_job_views_viewed_at ON job_views(viewed_at DESC);

-- =====================================================
-- REFERRALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  referrer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  referred_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(referrer_id, referred_id)
);

CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);

-- =====================================================
-- APPLICATION DAILY LIMITS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS application_limits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  worker_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  application_date DATE NOT NULL,
  application_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(worker_id, application_date)
);

CREATE INDEX idx_application_limits_worker_date ON application_limits(worker_id, application_date);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at trigger for job_templates
CREATE TRIGGER update_job_templates_updated_at BEFORE UPDATE ON job_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- END OF SCHEMA UPDATES
-- =====================================================
