-- Create connections table for admin-moderated contact sharing
-- This table tracks connection requests between workers and employers
-- Admin must approve connections before phone numbers/resumes are visible

CREATE TABLE IF NOT EXISTS connections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  application_id TEXT REFERENCES applications(id) ON DELETE CASCADE,
  worker_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  employer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT REFERENCES users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by TEXT REFERENCES users(id),
  admin_notes TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
CREATE INDEX IF NOT EXISTS idx_connections_worker ON connections(worker_id);
CREATE INDEX IF NOT EXISTS idx_connections_employer ON connections(employer_id);
CREATE INDEX IF NOT EXISTS idx_connections_application ON connections(application_id);

-- Unique constraint: one connection per worker-employer-application combo
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_connection ON connections(worker_id, employer_id, application_id);

-- Comments
COMMENT ON TABLE connections IS 'Tracks connection requests between workers and employers requiring admin approval';
COMMENT ON COLUMN connections.status IS 'Connection status: pending, approved, rejected';
COMMENT ON COLUMN connections.admin_notes IS 'Admin notes about approval/rejection decision';
