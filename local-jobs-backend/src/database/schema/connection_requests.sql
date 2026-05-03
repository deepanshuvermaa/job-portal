-- Connection Requests Table for Admin-Mediated Contact Sharing
-- When a worker applies to a job, a connection request is created
-- Admin reviews and approves/rejects the connection
-- Upon approval, contact details are shared between worker and employer

CREATE TABLE IF NOT EXISTS connection_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,

  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  -- Contact information (populated upon approval)
  worker_phone VARCHAR(15),
  worker_email VARCHAR(255),
  employer_phone VARCHAR(15),
  employer_email VARCHAR(255),

  -- Admin action tracking
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON connection_requests(status);
CREATE INDEX IF NOT EXISTS idx_connection_requests_worker ON connection_requests(worker_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_employer ON connection_requests(employer_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_application ON connection_requests(application_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_job ON connection_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_created_at ON connection_requests(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_connection_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_connection_requests_updated_at
  BEFORE UPDATE ON connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_connection_requests_updated_at();

-- Comments for documentation
COMMENT ON TABLE connection_requests IS 'Manages admin-mediated connections between workers and employers';
COMMENT ON COLUMN connection_requests.status IS 'pending: awaiting admin review, approved: contact details shared, rejected: connection denied';
COMMENT ON COLUMN connection_requests.application_id IS 'The job application that triggered this connection request';
