# Connection & Interest System - Complete Guide

## 🎯 User Flow Overview

### What's Visible to Everyone (No Login Required)
✅ **Workers can see:**
- All job postings (after admin approval)
- Job title, description, requirements
- Salary range, location, employment type
- Employer business name and rating
- ❌ **NOT visible:** Employer phone number

✅ **Employers can see:**
- All worker profiles (verified workers)
- Worker name, skills, experience
- Location, availability, bio
- Worker rating and reviews
- ❌ **NOT visible:** Worker phone number, resume URL

---

## 📋 How the Interest & Connection System Works

### Step 1: Expressing Interest

#### Option A: Employer Expresses Interest in Worker
1. Employer browses workers at `/employer/browse-workers`
2. Sees full profile (name, skills, experience, location, photo)
3. Clicks **"Express Interest"** button on worker card
4. System creates a **connection request** with status = `'pending'`
5. Employer sees message: "Interest expressed! Admin will review your request."

#### Option B: Worker Applies to Job
1. Worker finds job at `/worker/jobs`
2. Clicks on job to view details
3. Clicks **"Apply"** button
4. Fills application form (cover letter, expected salary)
5. System creates:
   - **Application** record
   - **Connection request** (auto-created) with status = `'pending'`

---

### Step 2: Admin Reviews Connection Request

1. Admin logs in and goes to `/admin/connections`
2. Sees list of all connection requests:
   ```
   Worker: John Doe (8005111368)
   Employer: Peripheral Services (7275778842)
   Job: Driver needed (or "General Interest")
   Status: Pending
   ```
3. Admin can see:
   - Full worker profile (including phone)
   - Full employer profile (including phone)
   - Application details (if via job application)
   - Why connection was requested

4. Admin decides:
   - **Approve** → Both parties get contact info
   - **Reject** → Contact info stays hidden

---

### Step 3: After Admin Approval

#### If Approved:
✅ **Worker can now see:**
- Employer phone number
- Employer email (if available)

✅ **Employer can now see:**
- Worker phone number
- Worker resume (download link)
- Worker alternate phone numbers

❌ **If Rejected:**
- Contact info remains hidden
- Both parties can still see public profile info
- Admin can add notes explaining why rejected

---

## 🔄 Complete Workflow Examples

### Example 1: Employer Finding a Driver

1. **Browse Phase:**
   - Employer goes to "Browse Workers"
   - Filters: City = "Lucknow", Skill = "driver"
   - Sees: "D Kumar" - 1 year experience, sales skill
   - Sees profile photo, bio, availability
   - **Cannot see:** Phone number, resume

2. **Express Interest:**
   - Employer clicks "Express Interest" on D Kumar's card
   - System creates connection request
   - Request goes to admin dashboard

3. **Admin Review:**
   - Admin sees: "Peripheral Services wants to connect with D Kumar"
   - Admin checks both profiles
   - Admin approves connection

4. **Contact Reveal:**
   - Employer refreshes page / revisits D Kumar's profile
   - Now sees: Phone: 8005111368
   - Can download resume
   - Can call and hire

### Example 2: Worker Applying to Job

1. **Job Search:**
   - Worker "Deepanshu Verma" searches jobs
   - Finds: "Delivery Driver - Peripheral Services"
   - Sees job details, salary (₹15,000-20,000)
   - **Cannot see:** Employer phone number

2. **Apply to Job:**
   - Worker clicks "Apply"
   - Fills cover letter: "I have 1 year experience..."
   - Submits application
   - System auto-creates connection request

3. **Admin Review:**
   - Admin sees application in "Applications" dashboard
   - Admin sees connection request in "Connections" dashboard
   - Admin reviews worker qualifications
   - Admin approves connection

4. **Bidirectional Contact:**
   - Worker can now see employer phone: 7275778842
   - Employer can now see worker phone: 8957678849
   - Both can communicate directly

---

## 💻 Technical Implementation

### Database Table: `connections`
```sql
CREATE TABLE connections (
  id TEXT PRIMARY KEY,
  worker_id TEXT REFERENCES users(id),
  employer_id TEXT REFERENCES users(id),
  application_id TEXT NULL,  -- NULL for general interest
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by TEXT REFERENCES users(id),
  rejected_at TIMESTAMP,
  rejected_by TEXT REFERENCES users(id),
  admin_notes TEXT
);
```

### API Endpoints

#### Create Connection Request
```
POST /api/connections/create
Body: {
  worker_id: "worker-firebase-uid",
  employer_id: "employer-firebase-uid",
  application_id: "app-id" | null  // null for general interest
}
Response: { success: true, data: { id: "...", status: "pending" } }
```

#### Admin List Connections
```
GET /api/connections/admin?status=pending
Response: {
  success: true,
  data: [
    {
      id: "conn-123",
      worker: { full_name: "John", phone: "8005111368" },
      employer: { business_name: "ABC Co", phone: "9999999999" },
      status: "pending",
      created_at: "2026-03-09T..."
    }
  ]
}
```

#### Approve Connection
```
PUT /api/connections/:id/approve
Response: { success: true, message: "Connection approved" }
```

#### Reject Connection
```
PUT /api/connections/:id/reject
Body: { admin_notes: "Not a good match" }
Response: { success: true, message: "Connection rejected" }
```

#### Check Connection Status
```
GET /api/connections/check?worker_id=xxx&employer_id=yyy
Response: {
  success: true,
  data: {
    hasConnection: true,
    connection: { status: "approved", approved_at: "..." }
  }
}
```

---

## 🎨 UI Components

### BrowseWorkers.tsx
**Location:** `local-jobs-platform/src/pages/BrowseWorkers.tsx`

**Features:**
- Lists all verified workers
- Shows skills, experience, location, photo
- **"Express Interest" button** on each worker card
- Hides phone numbers and resume links
- Shows privacy notice

**Code Snippet:**
```tsx
<Button
  variant="primary"
  onClick={() => handleExpressInterest(worker.user_id)}
>
  <Heart size={16} />
  Express Interest
</Button>
```

### AdminConnections.tsx
**Location:** `local-jobs-platform/src/pages/AdminConnections.tsx`

**Features:**
- Lists all connection requests
- Filter by status (pending/approved/rejected)
- Shows both worker and employer details
- **"Approve" and "Reject" buttons**
- Admin notes field

### EmployerJobApplications.tsx
**Location:** `local-jobs-platform/src/pages/EmployerJobApplications.tsx`

**Features:**
- Lists all applications for employer's jobs
- Hides worker phone/resume until connection approved
- Shows privacy notice
- Links to request connection

---

## 🔒 Privacy Rules

### What's Always Hidden:
1. **Worker phone numbers** - Hidden until connection approved
2. **Worker resume URLs** - Hidden until connection approved
3. **Employer phone numbers** - Hidden until connection approved
4. **Worker alternate phones** - Hidden until connection approved

### What's Always Visible:
1. **Worker profile:** Name, skills, experience, location, photo, bio, availability
2. **Employer profile:** Business name, business type, industry, location, description
3. **Job postings:** Title, description, requirements, salary, location
4. **Ratings and reviews:** For both workers and employers

### Backend Implementation:
When fetching worker/employer profiles, the API checks for approved connections:
```typescript
const connection = await getConnection(workerId, employerId);
if (!connection || connection.status !== 'approved') {
  delete profile.phone;
  delete profile.resume_url;
  delete profile.alternate_phones;
}
```

---

## 📊 Admin Dashboard

### Connection Request Details:
```
Worker Information:
  Name: Deepanshu Verma
  Phone: 8957678849
  Skills: delivery, driver
  City: dsvds

Employer Information:
  Business: Peripheral Services
  Phone: 7275778842
  Industry: office
  City: Lucknow

Request Details:
  Type: General Interest
  Created: Mar 9, 2026 at 1:30 AM
  Status: Pending

Actions:
  [Approve] [Reject]
  Admin Notes: _______________
```

---

## 🚀 Testing the Flow

### Test 1: Employer Express Interest
1. Login as employer (phone: 7275778842)
2. Go to "Browse Workers"
3. Click "Express Interest" on any worker
4. Check: Connection created in database
5. Login as admin
6. Go to "Admin → Connections"
7. See pending request
8. Click "Approve"
9. Logout, login as employer again
10. Revisit worker profile
11. ✅ Should see phone number now

### Test 2: Worker Apply to Job
1. Login as worker (phone: 8957678849)
2. Go to "Find Jobs"
3. Click on any job
4. Fill application form and apply
5. Check: Application + Connection created
6. Login as admin
7. Go to "Admin → Connections"
8. See pending request for this application
9. Click "Approve"
10. Logout, login as worker again
11. Go to "My Applications"
12. ✅ Should see employer phone number now

---

## 🛠️ Deployment Checklist

- [x] Frontend: Express Interest button added
- [x] Backend: Connection creation endpoint updated
- [x] Backend: Null application_id supported
- [x] Database: Connections table migration ready
- [x] Admin UI: AdminConnections page created
- [x] Privacy: Phone/resume hiding enforced
- [ ] Database: Run MIGRATION_CONNECTIONS.sql
- [ ] Backend: Deploy to Railway
- [ ] Frontend: Deploy dist folder
- [ ] Test: Full flow from interest to approval

---

## 📝 Notes for Future Development

### Auto-Create Connection on Application
Add this to application creation endpoint:
```typescript
// After creating application
await createConnection({
  worker_id: workerId,
  employer_id: employerId,
  application_id: newApplication.id
});
```

### Email Notifications
When admin approves connection:
```typescript
await sendEmail(worker.email, 'Connection Approved!', template);
await sendEmail(employer.email, 'Connection Approved!', template);
```

### In-App Notifications
Show notification badge when connection is approved:
```typescript
notifications.push({
  type: 'connection_approved',
  message: 'Your connection with Peripheral Services was approved!'
});
```

---

**Last Updated:** March 9, 2026
**Version:** 2.0 - Interest System Implemented
