# Backend Fixes Required

## 1. Session Expiration Issue - CRITICAL

### Problem:
Users are getting logged out too frequently, forcing them to re-authenticate via OTP. This creates:
- Poor user experience
- Excessive Firebase OTP costs
- User frustration

### Current Behavior:
JWT tokens are expiring too quickly (likely set to 1 hour or less)

### Solution Needed:
Update your backend JWT token configuration to increase expiration time.

**Location:** Your backend `auth` configuration file (likely in `src/config/auth.ts` or similar)

**Change this:**
```typescript
// Current (too short)
const JWT_EXPIRATION = '1h';  // or '3600' seconds
```

**To this:**
```typescript
// Recommended for mobile/web app
const JWT_EXPIRATION = '30d';  // 30 days

// OR if you want refresh tokens
const ACCESS_TOKEN_EXPIRATION = '7d';   // 7 days
const REFRESH_TOKEN_EXPIRATION = '90d'; // 90 days
```

### Implementation Steps:

#### Option 1: Simple Fix (Single Long-Lived Token)
```typescript
// In your JWT signing function
const token = jwt.sign(
  { userId, role, phone },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }  // ← Change this
);
```

#### Option 2: Better Fix (Access + Refresh Tokens)
```typescript
// Generate both tokens
const accessToken = jwt.sign(
  { userId, role, phone },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const refreshToken = jwt.sign(
  { userId, type: 'refresh' },
  process.env.REFRESH_TOKEN_SECRET,
  { expiresIn: '90d' }
);

// Return both to frontend
return {
  tokens: {
    accessToken,
    refreshToken
  }
};
```

**Then add a refresh endpoint:**
```typescript
POST /api/auth/refresh-token
Body: { refreshToken: string }
Response: { accessToken: string }
```

---

## 2. Job Visibility Issue

### Problem:
Approved jobs are not showing up in worker job search.

### Possible Causes:

#### Cause 1: Backend not filtering by status='active'
**Check:** `GET /api/workers/jobs/search` endpoint

**Should look like:**
```typescript
// Backend jobs search endpoint
router.get('/api/workers/jobs/search', async (req, res) => {
  const { city, jobType, employmentType, minSalary, maxSalary } = req.query;

  const query = supabase
    .from('jobs')
    .select('*, employer_profiles(*)')
    .eq('status', 'active')  // ← MUST filter by active
    .order('created_at', { ascending: false });

  // Apply optional filters
  if (city) query.eq('city', city);
  if (jobType) query.eq('job_type', jobType);
  // ... other filters

  const { data, error } = await query;
  return res.json({ data });
});
```

#### Cause 2: Jobs not being set to 'active' after approval
**Check:** `PUT /api/admin/jobs/:jobId/approve` endpoint

**Should look like:**
```typescript
router.put('/api/admin/jobs/:jobId/approve', async (req, res) => {
  const { jobId } = req.params;

  const { data, error } = await supabase
    .from('jobs')
    .update({
      status: 'active',  // ← Must set to 'active'
      approved_at: new Date().toISOString(),
      approved_by: req.user.id
    })
    .eq('id', jobId);

  return res.json({ data });
});
```

---

## 3. Connection Approval System - Backend Endpoints Needed (CRITICAL FOR PRIVACY)

⚠️ **ADMIN-ONLY POLICY:**
**NO phone numbers or resumes should be visible to anyone until admin explicitly approves the connection.**

This is a STRICT privacy protection requirement. The platform owner (admin) must moderate ALL connections between workers and employers.

The frontend is ready for the connection approval system, but requires these backend endpoints:

### Endpoint 1: Create Connection Request
**Trigger:** When employer shortlists a worker

```typescript
POST /api/connections
Body: {
  application_id: string,
  worker_id: string,
  employer_id: string
}

// Implementation
router.post('/api/connections', authMiddleware, async (req, res) => {
  const { application_id, worker_id, employer_id } = req.body;

  const { data, error } = await supabase
    .from('connections')
    .insert({
      application_id,
      worker_id,
      employer_id,
      status: 'pending',
      created_at: new Date().toISOString()
    });

  return res.json({ data });
});
```

### Endpoint 2: List Connection Requests (Admin)
```typescript
GET /api/admin/connections?status=pending

// Implementation
router.get('/api/admin/connections', adminMiddleware, async (req, res) => {
  const { status } = req.query;

  let query = supabase
    .from('connections')
    .select(`
      *,
      worker:worker_profiles!inner(full_name, user:users(phone)),
      employer:employer_profiles!inner(business_name, user:users(phone)),
      application:applications(jobs(title))
    `);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  return res.json({ data });
});
```

### Endpoint 3: Approve Connection
```typescript
PUT /api/admin/connections/:id/approve

// Implementation
router.put('/api/admin/connections/:id/approve', adminMiddleware, async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('connections')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: req.user.id
    })
    .eq('id', id);

  return res.json({ data });
});
```

### Endpoint 4: Reject Connection
```typescript
PUT /api/admin/connections/:id/reject

// Similar to approve, but set status to 'rejected'
```

### Endpoint 5: Browse Workers (For Employers)
```typescript
GET /api/employers/workers/browse?search=&city=&skill=&experience=

// Implementation
router.get('/api/employers/workers/browse', authMiddleware, async (req, res) => {
  const { search, city, skill, experience, limit = 50 } = req.query;

  let query = supabase
    .from('worker_profiles')
    .select(`
      *,
      user:users(phone, is_verified),
      average_rating,
      total_ratings
    `)
    .eq('user.role', 'worker')
    .limit(limit);

  // Apply filters
  if (search) query.ilike('full_name', `%${search}%`);
  if (city) query.ilike('city', `%${city}%`);
  if (skill) query.contains('skills', [skill]);
  // ... other filters

  const { data, error } = await query;
  return res.json({ data });
});
```

---

## 4. Phone Number & Resume Visibility Logic (STRICT PRIVACY)

### 🔒 CRITICAL PRIVACY RULES:

**NEVER expose the following without admin-approved connection:**
1. Phone numbers (primary + alternate)
2. Resume URLs
3. Any direct contact information

**Worker Contact Info (to Employer):**
- ❌ Hidden by default in ALL endpoints
- ✅ Only visible if connection exists AND status = 'approved' by admin

**Employer Contact Info (to Worker):**
- ❌ Hidden by default in ALL endpoints
- ✅ Only visible if connection exists AND status = 'approved' by admin

**Resume Files:**
- ❌ Hidden in browse/search endpoints
- ❌ Hidden in application lists
- ✅ Only accessible via direct URL if connection approved

### Implementation Example:
```typescript
// In worker profile endpoint
router.get('/api/employers/workers/:workerId', async (req, res) => {
  const { workerId } = req.params;
  const employerId = req.user.id;

  // Get worker profile
  const profile = await supabase
    .from('worker_profiles')
    .select('*, user:users(*)')
    .eq('user_id', workerId)
    .single();

  // Check if connection is approved
  const connection = await supabase
    .from('connections')
    .select('*')
    .eq('worker_id', workerId)
    .eq('employer_id', employerId)
    .eq('status', 'approved')
    .single();

  // Hide sensitive info if no approved connection
  if (!connection) {
    delete profile.user.phone;
    delete profile.alternate_phones;
    delete profile.resume_url;  // ← CRITICAL: Also hide resume
  }

  return res.json({ data: profile });
});
```

**Also apply to GET /api/employers/jobs/:jobId/applications:**
```typescript
// When fetching applications for a job
router.get('/api/employers/jobs/:jobId/applications', async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user.id;

  const applications = await supabase
    .from('applications')
    .select(`
      *,
      worker_profiles(
        full_name,
        city,
        state,
        skills,
        photo_url,
        user:users(phone)  // Fetch but will conditionally hide
      )
    `)
    .eq('job_id', jobId);

  // For each application, check if connection is approved
  for (const app of applications.data) {
    const connection = await supabase
      .from('connections')
      .select('status')
      .eq('worker_id', app.worker_id)
      .eq('employer_id', employerId)
      .eq('status', 'approved')
      .single();

    // Hide sensitive data if not approved
    if (!connection) {
      delete app.worker_profiles.user.phone;
      delete app.worker_profiles.resume_url;
      delete app.worker_profiles.alternate_phones;
    }
  }

  return res.json({ data: applications.data });
});
```

---

## 5. Database Schema for Connections Table

If you don't have a connections table yet, create it:

```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  worker_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  employer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT REFERENCES users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by TEXT REFERENCES users(id),
  notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_worker ON connections(worker_id);
CREATE INDEX idx_connections_employer ON connections(employer_id);
CREATE INDEX idx_connections_application ON connections(application_id);

-- Unique constraint: one connection per worker-employer-application combo
CREATE UNIQUE INDEX idx_unique_connection ON connections(worker_id, employer_id, application_id);
```

---

## 6. Auto-Create Connection Request Trigger

When an employer shortlists a worker, automatically create a pending connection:

```typescript
// In your updateApplicationStatus endpoint
router.put('/api/employers/applications/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Update application status
  await supabase
    .from('applications')
    .update({ status })
    .eq('id', id);

  // If shortlisted, create connection request
  if (status === 'shortlisted') {
    const application = await supabase
      .from('applications')
      .select('worker_id, jobs(employer_id)')
      .eq('id', id)
      .single();

    // Create connection request
    await supabase
      .from('connections')
      .insert({
        application_id: id,
        worker_id: application.worker_id,
        employer_id: application.jobs.employer_id,
        status: 'pending'
      });
  }

  return res.json({ success: true });
});
```

---

## Priority Order:

1. **CRITICAL:** Fix session expiration (30d tokens)
2. **HIGH:** Ensure job approval sets status='active'
3. **HIGH:** Ensure job search filters by status='active'
4. **MEDIUM:** Implement connection approval system
5. **LOW:** Add refresh token mechanism

---

## Testing Checklist:

- [ ] Users stay logged in for 30 days
- [ ] Approved jobs appear in worker search
- [ ] All jobs visible (not filtered by city initially)
- [ ] Connection requests created when employer shortlists
- [ ] Admin can approve/reject connections
- [ ] Phone numbers hidden until connection approved
- [ ] Phone numbers visible after admin approves

---

*Last Updated: 2026-03-09*
*Frontend Version: Latest build in dist/*
