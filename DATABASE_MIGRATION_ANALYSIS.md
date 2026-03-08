# Database Migration Analysis: UUID to TEXT Conversion

## Problem Statement

The application currently uses **Firebase Authentication** for user authentication, which generates string-based UIDs (e.g., `WXKI9JGaa6Nz5afZINSLyGyoNF02`). However, the Supabase database schema was designed for **Supabase Auth**, which uses UUID format for user IDs.

**Current Error:**
```
invalid input syntax for type uuid: "WXKI9JGaa6Nz5afZINSLyGyoNF02"
```

## Complete Schema Analysis

### Tables Overview

| Table | Purpose | UUID Columns to Convert |
|-------|---------|------------------------|
| `users` | Core user table | `id` (PK, FK to auth.users) |
| `worker_profiles` | Worker details | `id` (PK), `user_id` (FK), `verified_by` (FK) |
| `employer_profiles` | Employer details | `id` (PK), `user_id` (FK), `verified_by` (FK) |
| `jobs` | Job postings | `id` (PK), `employer_id` (FK) |
| `applications` | Job applications | `id` (PK), `job_id` (FK), `worker_id` (FK) |
| `reviews` | Ratings/reviews | `id` (PK), `reviewer_id` (FK), `reviewee_id` (FK), `job_id` (FK), `application_id` (FK) |
| `saved_jobs` | Bookmarked jobs | `id` (PK), `worker_id` (FK), `job_id` (FK) |
| `notifications` | User notifications | `id` (PK), `user_id` (FK) |
| `reports` | User complaints | `id` (PK), `reporter_id` (FK), `reported_user_id` (FK), `reported_job_id` (FK), `resolved_by` (FK) |
| `otp_verifications` | OTP storage | `id` (PK) - **Keep as UUID** |
| `admin_logs` | Admin actions | `id` (PK), `admin_id` (FK), `target_user_id` (FK), `target_job_id` (FK) |

### Detailed Column Analysis

#### 1. users (13 columns)
- **UUID Columns:**
  - `id` - PRIMARY KEY, references auth.users(id)
- **Action:** Convert `id` to TEXT, remove FK to auth.users
- **Impact:** All tables with user_id FKs must be updated

#### 2. worker_profiles (28 columns)
- **UUID Columns:**
  - `id` - PRIMARY KEY (auto-generated)
  - `user_id` - UNIQUE FK to users(id)
  - `verified_by` - FK to users(id) (nullable)
- **Action:** Convert all to TEXT
- **Impact:** Applications, reviews, saved_jobs reference this

#### 3. employer_profiles (24 columns)
- **UUID Columns:**
  - `id` - PRIMARY KEY (auto-generated)
  - `user_id` - UNIQUE FK to users(id)
  - `verified_by` - FK to users(id) (nullable)
- **Action:** Convert all to TEXT
- **Impact:** Jobs table references this

#### 4. jobs (27 columns)
- **UUID Columns:**
  - `id` - PRIMARY KEY (auto-generated)
  - `employer_id` - FK to users(id)
- **Action:** Convert all to TEXT
- **Impact:** Applications, reviews, saved_jobs, reports reference this

#### 5. applications (14 columns)
- **UUID Columns:**
  - `id` - PRIMARY KEY (auto-generated)
  - `job_id` - FK to jobs(id)
  - `worker_id` - FK to users(id)
- **Action:** Convert all to TEXT
- **Impact:** Reviews table references this

#### 6. reviews (11 columns)
- **UUID Columns:**
  - `id` - PRIMARY KEY (auto-generated)
  - `reviewer_id` - FK to users(id)
  - `reviewee_id` - FK to users(id)
  - `job_id` - FK to jobs(id)
  - `application_id` - FK to applications(id)
- **Action:** Convert all to TEXT
- **Impact:** No other tables reference this

#### 7. saved_jobs (4 columns)
- **UUID Columns:**
  - `id` - PRIMARY KEY (auto-generated)
  - `worker_id` - FK to users(id)
  - `job_id` - FK to jobs(id)
- **Action:** Convert all to TEXT
- **Impact:** No other tables reference this

#### 8. notifications (8 columns)
- **UUID Columns:**
  - `id` - PRIMARY KEY (auto-generated)
  - `user_id` - FK to users(id)
- **Action:** Convert all to TEXT
- **Impact:** No other tables reference this

#### 9. reports (10 columns)
- **UUID Columns:**
  - `id` - PRIMARY KEY (auto-generated)
  - `reporter_id` - FK to users(id)
  - `reported_user_id` - FK to users(id)
  - `reported_job_id` - FK to jobs(id)
  - `resolved_by` - FK to users(id)
- **Action:** Convert all to TEXT
- **Impact:** No other tables reference this

#### 10. otp_verifications (7 columns)
- **UUID Columns:**
  - `id` - PRIMARY KEY (auto-generated)
- **Action:** **KEEP AS UUID** (not related to user IDs)
- **Impact:** None

#### 11. admin_logs (8 columns)
- **UUID Columns:**
  - `id` - PRIMARY KEY (auto-generated)
  - `admin_id` - FK to users(id)
  - `target_user_id` - FK to users(id)
  - `target_job_id` - FK to jobs(id)
- **Action:** Convert all to TEXT
- **Impact:** No other tables reference this

### Foreign Key Dependencies (Hierarchy)

```
auth.users (Supabase Auth - EXTERNAL)
    ↓
users (id)
    ├─→ worker_profiles (user_id, verified_by)
    ├─→ employer_profiles (user_id, verified_by)
    ├─→ jobs (employer_id)
    │      ├─→ applications (job_id)
    │      │      └─→ reviews (application_id)
    │      ├─→ saved_jobs (job_id)
    │      └─→ reports (reported_job_id)
    ├─→ applications (worker_id)
    ├─→ reviews (reviewer_id, reviewee_id, job_id)
    ├─→ saved_jobs (worker_id)
    ├─→ notifications (user_id)
    ├─→ reports (reporter_id, reported_user_id, resolved_by)
    └─→ admin_logs (admin_id, target_user_id, target_job_id)
```

### Row Level Security (RLS) Policies

**Critical Issue:** All RLS policies use `auth.uid()` which returns the Supabase Auth user ID. With Firebase Auth, this will NOT work.

**Policies Using auth.uid():**
1. `users` - 2 policies (SELECT, UPDATE)
2. `worker_profiles` - 2 policies (SELECT, UPDATE)
3. `employer_profiles` - 2 policies (SELECT, UPDATE)
4. `jobs` - 4 policies (SELECT, INSERT, UPDATE, DELETE)
5. `applications` - 4 policies (SELECT, INSERT for workers, SELECT/UPDATE for employers)
6. `reviews` - 2 policies (SELECT, INSERT)
7. `saved_jobs` - 1 policy (ALL)
8. `notifications` - 2 policies (SELECT, UPDATE)
9. `reports` - 2 policies (SELECT, INSERT)

**Total: 21 RLS policies that will break**

### Indexes

**GIN Indexes (Array columns):**
- `idx_worker_profiles_skills` on worker_profiles(skills)
- `idx_jobs_skills` on jobs(required_skills)

**Regular Indexes:** 29 indexes total, none dependent on UUID type

### Triggers

**Active Triggers:**
1. `update_users_updated_at` - Updates timestamps
2. `update_worker_profiles_updated_at` - Updates timestamps
3. `update_employer_profiles_updated_at` - Updates timestamps
4. `update_jobs_updated_at` - Updates timestamps
5. `update_applications_updated_at` - Updates timestamps
6. `increment_job_application_count` - Updates job application counter
7. `update_rating_on_review` - Updates average ratings

**None of these triggers depend on UUID types.**

## Migration Strategy

### Option 1: Drop and Recreate (RECOMMENDED for Development)

**Pros:**
- Clean slate, no data loss concerns
- Fastest implementation
- No constraint conflicts

**Cons:**
- Loses all existing data
- Requires re-testing all features

**Steps:**
1. Drop all tables in reverse dependency order
2. Recreate schema with TEXT instead of UUID
3. Modify RLS policies to work with JWT tokens instead of auth.uid()
4. Test thoroughly

### Option 2: In-Place Migration (For Production with Data)

**Pros:**
- Preserves existing data
- Can be rolled back

**Cons:**
- Complex, multi-step process
- High risk of errors
- Requires careful constraint management

**Steps:**
1. Disable all RLS policies
2. Drop all foreign key constraints
3. Drop all triggers
4. Convert all UUID columns to TEXT (in dependency order)
5. Recreate foreign key constraints
6. Recreate triggers
7. Create new RLS policies using JWT claims
8. Re-enable RLS

## RLS Policy Redesign for Firebase Auth

Since `auth.uid()` won't work with Firebase Auth, we have two options:

### Option A: Use JWT Claims (Recommended)

Modify backend to include user ID in JWT tokens, then use `auth.jwt() ->> 'user_id'` in policies.

**Example:**
```sql
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = (auth.jwt() ->> 'user_id')::text);
```

### Option B: Disable RLS, Enforce in Backend

Remove all RLS policies and handle all authorization in the Node.js backend.

**Pros:** Simpler, more control
**Cons:** Security depends entirely on backend code

## Recommended Approach

### For Current Development Stage: **Option 1 (Drop & Recreate)**

**Rationale:**
1. No production data to preserve
2. Faster to implement
3. Cleaner result
4. Easier to test

### RLS Strategy: **Option B (Backend Enforcement)**

**Rationale:**
1. Already using JWT tokens in backend
2. Middleware already validates tokens
3. Simpler to implement and maintain
4. Common pattern for Firebase Auth + Supabase data

## Migration Script Requirements

The migration script must:

1. ✅ Drop all RLS policies (21 policies)
2. ✅ Drop all foreign key constraints (in correct order)
3. ✅ Drop all triggers (7 triggers)
4. ✅ Convert all UUID columns to TEXT (except otp_verifications.id)
5. ✅ Recreate foreign key constraints with TEXT type
6. ✅ Recreate triggers
7. ✅ Remove reference to auth.users FK
8. ✅ Keep tables in dependency order
9. ✅ Use TEXT PRIMARY KEY with gen_random_uuid()::text for auto-generated IDs
10. ✅ Disable RLS on all tables

## Files Requiring Updates After Migration

### Backend Files:
1. None - backend already sends Firebase UID as string

### Frontend Files:
1. None - frontend already uses firebaseToken

## Estimated Impact

### Breaking Changes:
- ❌ All RLS policies will be removed
- ❌ All existing data will be lost (if using Option 1)
- ✅ Backend code already compatible
- ✅ Frontend code already compatible

### Non-Breaking:
- ✅ All triggers will work
- ✅ All indexes will work
- ✅ All constraints will work (after recreation)
- ✅ Application logic unchanged

## Next Steps

1. ✅ Review this analysis
2. ⏳ Get user approval for approach
3. ⏳ Create comprehensive migration SQL script
4. ⏳ Test migration on development database
5. ⏳ Execute migration
6. ⏳ Test worker and employer registration
7. ⏳ Verify all features work correctly
