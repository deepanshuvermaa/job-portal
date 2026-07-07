-- Phase 1 Platform Upgrade Migration
-- Credits system, subscriptions, interviews, job alerts, testimonials, worker boosts
-- Note: users.id is TEXT (Firebase UID), so all user FK columns use TEXT

-- Credits system
CREATE TABLE IF NOT EXISTS credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id TEXT NOT NULL,
  credits_remaining INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  credits INTEGER NOT NULL,
  payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id TEXT NOT NULL,
  plan VARCHAR(20) NOT NULL,
  credits_per_month INTEGER NOT NULL,
  max_active_jobs INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  razorpay_subscription_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled interviews
CREATE TABLE IF NOT EXISTS scheduled_interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id TEXT,
  worker_id TEXT NOT NULL,
  employer_id TEXT NOT NULL,
  job_id TEXT,
  interview_type VARCHAR(20) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  location TEXT,
  meeting_link TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job alerts preferences
CREATE TABLE IF NOT EXISTS job_alert_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id TEXT NOT NULL UNIQUE,
  categories TEXT[] DEFAULT '{}',
  cities TEXT[] DEFAULT '{}',
  min_salary INTEGER,
  employment_types TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  frequency VARCHAR(20) DEFAULT 'daily',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  quote_hindi TEXT,
  author_name VARCHAR(255) NOT NULL,
  author_role VARCHAR(100),
  author_company VARCHAR(255),
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker premium features
CREATE TABLE IF NOT EXISTS worker_boosts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id TEXT NOT NULL,
  boost_type VARCHAR(30) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  payment_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns to existing tables
ALTER TABLE employer_profiles ADD COLUMN IF NOT EXISTS auto_approve_jobs BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT false;
ALTER TABLE employer_profiles ADD COLUMN IF NOT EXISTS avg_response_hours DECIMAL(5,1);
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false;
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMPTZ;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credits_employer ON credits(employer_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_employer ON credit_transactions(employer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_employer ON subscriptions(employer_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_interviews_worker ON scheduled_interviews(worker_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_interviews_employer ON scheduled_interviews(employer_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_interviews_status ON scheduled_interviews(status);
CREATE INDEX IF NOT EXISTS idx_job_alert_preferences_worker ON job_alert_preferences(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_boosts_worker ON worker_boosts(worker_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_remote ON jobs(is_remote) WHERE is_remote = true;

-- Seed testimonials
INSERT INTO testimonials (quote, quote_hindi, author_name, author_role, author_company, display_order) VALUES
('We hired 10 delivery drivers in just 3 days. The platform made it incredibly easy to find verified workers near our warehouse.', 'हमने सिर्फ 3 दिन में 10 डिलीवरी ड्राइवर हायर किए। प्लेटफॉर्म ने हमारे वेयरहाउस के पास वेरिफाइड वर्कर ढूंढना बहुत आसान बना दिया।', 'Rajesh Kumar', 'Operations Manager', 'QuickDeliver Logistics', 1),
('I got a cook job within 2 days of signing up. No agent fees, no middlemen. Just applied and got a call directly.', 'साइन अप करने के 2 दिन के अंदर मुझे कुक की नौकरी मिल गई। कोई एजेंट फीस नहीं, कोई बिचौलिया नहीं।', 'Sunita Devi', 'Cook', 'Hotel Grand Palace', 2),
('Best platform for hiring security guards. All candidates were verified and we could see their complete profiles before scheduling interviews.', 'सिक्योरिटी गार्ड हायर करने के लिए सबसे अच्छा प्लेटफॉर्म। सभी कैंडिडेट वेरिफाइड थे।', 'Amit Sharma', 'HR Manager', 'SecureForce Services', 3),
('As a fresher with only 10th pass, I was struggling to find work. LocalJobs helped me get a helper job in a factory near my home.', '10वीं पास फ्रेशर होने के कारण मुझे काम ढूंढने में बहुत मुश्किल हो रही थी। LocalJobs ने मुझे मेरे घर के पास फैक्ट्री में हेल्पर की नौकरी दिलाई।', 'Mohammed Irfan', 'Factory Helper', 'Bharat Manufacturing', 4);
