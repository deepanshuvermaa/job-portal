# Local Job Portal - Testing Guide

## 🚀 Quick Start for Testing

This guide will help you test all features of the Local Job Portal platform on **http://deepanshuverma.site/local-job-portal**

---

## 📋 Prerequisites

Before testing, ensure:
1. Backend is running and connected to Supabase
2. Frontend is deployed and accessible
3. Admin password is set in backend `.env` file

---

## 🔐 Test Credentials

### Admin Access
- **URL**: `/admin/login`
- **Password**: `admin123` (default, check `.env` file for ADMIN_PASSWORD)

### Test Phone Numbers
Use any 10-digit Indian phone number for testing. In development mode, the OTP will be displayed on the screen.

---

## 🧪 Testing Flows

### 1️⃣ **Worker Registration & Login Flow**

#### Step 1: Start Registration
1. Go to home page → Select language (English/Hindi)
2. Click "Continue" → Enter phone number (e.g., `9876543210`)
3. Click "Send OTP"
4. **Note**: The OTP will be displayed in a green box on the screen in development mode
5. Enter the OTP shown and click "Verify OTP"

#### Step 2: Select Role
1. Choose "Worker" role
2. Click "Continue"

#### Step 3: Complete Worker Profile
Fill in the following details:
- **Full Name**: John Doe
- **City**: Mumbai
- **State**: Maharashtra
- **Pincode**: 400001
- **Address**: 123 Test Street
- **Skills**: Select from dropdown (e.g., Plumber, Electrician)
- **Experience Years**: 5
- **Preferred Job Types**: Full-time, Part-time
- **Bio**: Experienced worker with 5 years in the field

#### Step 4: Upload Documents (Optional for testing)
- Aadhaar Front
- Aadhaar Back
- Photo
- Resume

#### Step 5: Submit & Wait for Verification
- After submission, you'll see "Verification Pending" status
- Admin needs to approve before you can access the dashboard

---

### 2️⃣ **Employer Registration & Login Flow**

#### Step 1: Start Registration
1. Go to home page → Select language
2. Enter phone number → Get OTP (displayed on screen)
3. Verify OTP

#### Step 2: Select Role
1. Choose "Employer" role
2. Click "Continue"

#### Step 3: Complete Employer Profile
Fill in the following details:
- **Business Name**: ABC Constructions
- **Business Type**: Company
- **City**: Mumbai
- **State**: Maharashtra
- **Pincode**: 400001
- **Address**: 456 Business Park
- **GST Number**: 27AAAAA0000A1Z5 (optional)
- **PAN Number**: AAAAA0000A (optional)
- **Industry**: Construction
- **Employee Count**: 50-100
- **Description**: Leading construction company in Mumbai

#### Step 4: Upload Documents (Optional)
- GST Certificate
- Business License
- PAN Card

#### Step 5: Submit & Wait for Verification
- After submission, you'll see "Verification Pending"
- Admin needs to approve

---

### 3️⃣ **Admin Verification Flow**

#### Step 1: Login as Admin
1. Go to `/admin/login`
2. Enter password: `admin123`
3. Click "Login"

#### Step 2: Verify Workers
1. In Admin Dashboard, find "Pending Worker Verifications" section
2. Click "Approve" for the worker you registered
3. Worker is now verified and can access the platform

#### Step 3: Verify Employers
1. Find "Pending Employer Verifications" section
2. Click "Approve" for the employer you registered
3. Employer is now verified and can post jobs

#### Step 4: Approve Jobs (Important!)
1. Find "Pending Job Approvals" section
2. Review jobs posted by employers
3. Click "Approve" to make jobs visible to workers
4. Click "Reject" to cancel jobs

---

### 4️⃣ **Employer Job Posting Flow**

#### Step 1: Login as Employer
1. Use the employer phone number you registered
2. Get OTP → Verify → Access dashboard

#### Step 2: Post a Job
1. Click "Post Job" from dashboard
2. Fill in job details:
   - **Title**: Plumber Needed for Residential Project
   - **Description**: We need an experienced plumber for a 2-week project
   - **Job Type**: Plumber
   - **Employment Type**: Contract
   - **Location**: Andheri, Mumbai
   - **City**: Mumbai
   - **State**: Maharashtra
   - **Pincode**: 400053
   - **Salary Min**: 15000
   - **Salary Max**: 25000
   - **Salary Type**: Monthly
   - **Required Skills**: Plumbing, Pipe Fitting
   - **Experience Required**: 2 years
   - **Vacancies**: 2
   - **Working Hours**: 9 AM - 5 PM
   - **Contact Phone**: 9876543210

3. Click "Post Job"

#### Step 3: Wait for Admin Approval
- Job status will be "draft" initially
- Admin needs to approve the job
- After approval, status changes to "open" and becomes visible to workers

---

### 5️⃣ **Worker Job Application Flow**

#### Step 1: Login as Worker
1. Use the worker phone number you registered
2. Get OTP → Verify → Access dashboard

#### Step 2: Browse Jobs
1. Go to "Jobs" section
2. Browse available jobs (only approved jobs are shown)
3. Filter by city or job type if needed

#### Step 3: Apply to Job
1. Click on a job to view details
2. Click "Apply Now"
3. Fill in:
   - **Cover Letter**: I am interested in this position and have relevant experience
   - **Expected Salary**: 20000
4. Click "Submit Application"

#### Step 4: Track Applications
1. Go to "My Applications" from dashboard
2. See status: Pending, Shortlisted, Rejected, or Hired

---

### 6️⃣ **Employer Application Management Flow**

#### Step 1: View Applications
1. Login as employer
2. Go to "My Jobs"
3. Click on a job that has applications
4. View list of applicants with their profiles

#### Step 2: Manage Applications
1. Review worker profiles
2. Click "Shortlist" to move forward with an applicant
3. Click "Reject" to decline
4. Click "Hire" when you've selected a candidate
5. Add notes for internal reference

---

## 🔄 Complete Test Workflow

Here's the recommended order to test all features:

1. **Setup Phase**
   - ✅ Login as Admin
   - ✅ Keep admin panel open in one tab

2. **Worker Registration**
   - ✅ Register a worker account (use phone: 9876543210)
   - ✅ Complete worker profile
   - ✅ Switch to admin tab → Approve worker
   - ✅ Switch back → Login as worker

3. **Employer Registration**
   - ✅ Open new incognito/private window
   - ✅ Register employer account (use phone: 9876543211)
   - ✅ Complete employer profile
   - ✅ Switch to admin tab → Approve employer
   - ✅ Switch back → Login as employer

4. **Job Posting & Approval**
   - ✅ As employer → Post a job
   - ✅ Switch to admin tab → Approve the job
   - ✅ Verify job status changes to "open"

5. **Job Application**
   - ✅ As worker → Browse jobs
   - ✅ Apply to the posted job
   - ✅ Check application status

6. **Application Management**
   - ✅ As employer → View applications
   - ✅ Shortlist/Reject/Hire workers
   - ✅ As worker → Check updated application status

---

## 🧪 Mock OTP Feature

### Development Mode
When `NODE_ENV=development` in backend `.env`:
- OTP is displayed in the API response
- OTP is shown in a green box on the frontend
- OTP is also logged in backend console
- No actual SMS is sent (saves costs during testing)

### Production Mode
When `NODE_ENV=production`:
- OTP is sent via MSG91 SMS service
- OTP is NOT shown in response
- Requires valid MSG91 credentials in `.env`

---

## 📱 Key Features to Test

### Authentication
- ✅ Phone OTP login
- ✅ Role-based access (Worker/Employer/Admin)
- ✅ Session persistence
- ✅ Logout functionality

### Worker Features
- ✅ Profile creation with documents
- ✅ Job search and filtering
- ✅ Job application submission
- ✅ Application status tracking
- ✅ Notifications

### Employer Features
- ✅ Business profile creation
- ✅ Job posting
- ✅ Application management
- ✅ Worker shortlisting
- ✅ Hiring workflow

### Admin Features
- ✅ Dashboard with statistics
- ✅ Worker verification
- ✅ Employer verification
- ✅ Job approval/rejection
- ✅ Platform moderation

---

## 🐛 Common Issues & Solutions

### Issue: OTP not showing
**Solution**: Check backend logs. OTP is printed in console in development mode.

### Issue: "User not verified" error
**Solution**: Login as admin and approve the user from pending verifications.

### Issue: Jobs not showing for workers
**Solution**:
1. Check if job status is "open" (not "draft")
2. Admin needs to approve jobs before they're visible
3. Check city/location filters

### Issue: Cannot login after registration
**Solution**: Wait for admin approval or approve yourself via admin panel.

### Issue: Application submission fails
**Solution**:
1. Ensure worker profile is complete
2. Check if job is still "open"
3. Cannot apply twice to same job

---

## 📊 Test Data Examples

### Sample Worker Profiles
```
Worker 1:
- Phone: 9876543210
- Name: Ramesh Kumar
- City: Mumbai
- Skills: Plumber, Pipe Fitting
- Experience: 5 years

Worker 2:
- Phone: 9876543211
- Name: Suresh Patil
- City: Pune
- Skills: Electrician, Wiring
- Experience: 3 years
```

### Sample Employer Profiles
```
Employer 1:
- Phone: 9876543220
- Business: ABC Constructions
- City: Mumbai
- Industry: Construction

Employer 2:
- Phone: 9876543221
- Business: XYZ Builders
- City: Pune
- Industry: Real Estate
```

### Sample Jobs
```
Job 1:
- Title: Plumber Required
- Type: Full-time Contract
- Location: Mumbai
- Salary: ₹15,000 - ₹25,000/month

Job 2:
- Title: Electrician for Commercial Project
- Type: Part-time
- Location: Pune
- Salary: ₹20,000 - ₹30,000/month
```

---

## 🎯 Success Criteria

The testing is successful if:
- ✅ All user registrations work smoothly
- ✅ OTP is visible during testing (dev mode)
- ✅ Admin can approve workers, employers, and jobs
- ✅ Jobs appear to workers only after admin approval
- ✅ Workers can apply to jobs
- ✅ Employers can manage applications
- ✅ All role-based access controls work
- ✅ No console errors during normal flow

---

## 🚀 Ready for Production

After successful testing:
1. Update backend `.env`: `NODE_ENV=production`
2. Configure MSG91 with valid credentials
3. Update frontend `.env` with production API URL
4. Test OTP flow with real SMS
5. Deploy both frontend and backend
6. Test complete flow on production domain

---

## 📞 Support

If you encounter any issues during testing:
1. Check browser console for errors
2. Check backend logs
3. Verify environment variables
4. Ensure database is properly configured
5. Check admin panel for pending approvals

---

## 🔒 Security Notes

- Admin password should be changed in production
- OTP display should only work in development
- All API endpoints are role-protected
- File uploads are validated and limited

---

**Happy Testing! 🎉**

For deployment instructions, see `DEPLOYMENT_GUIDE.md`
