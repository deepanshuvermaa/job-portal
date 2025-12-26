# 🚀 Running on Localhost - READY!

## ✅ Status: SERVERS ARE RUNNING!

### 🟢 Backend Server
- **Status**: Running
- **URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### 🟢 Frontend Server
- **Status**: Running
- **URL**: http://localhost:5173/local-job-portal/
- **Direct Access**: Open in your browser!

---

## 🎯 Quick Access URLs

### Main Application
**👉 Open this in your browser**: http://localhost:5173/local-job-portal/

### Admin Panel
**👉 Admin Login**: http://localhost:5173/local-job-portal/admin/login
- **Password**: `admin123`

### API Health
**👉 Backend Status**: http://localhost:5000/health

---

## ⚠️ Important Notes

### Database Setup Required
The app is running but **you need to setup Supabase** for data to persist:

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create a free account
   - Create a new project

2. **Setup Database**
   - In Supabase Dashboard → SQL Editor
   - Copy all contents from `local-jobs-backend/SUPABASE_SCHEMA.sql`
   - Paste and run in SQL Editor

3. **Get Credentials**
   - In Supabase → Settings → API
   - Copy:
     - Project URL
     - anon/public key
     - service_role key

4. **Update Backend .env**
   - Edit `local-jobs-backend/.env`
   - Replace these values:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-actual-anon-key
   SUPABASE_SERVICE_KEY=your-actual-service-key
   ```

5. **Restart Backend**
   - Stop current backend (Ctrl+C in terminal)
   - Run: `cd local-jobs-backend && npm run dev`

### Cloudinary Setup (Optional for testing)
For file uploads (documents, photos), you need Cloudinary:

1. Create account: https://cloudinary.com
2. Get credentials from dashboard
3. Update in `local-jobs-backend/.env`:
   ```bash
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

---

## 🧪 Testing Without Database

You can still test the UI and flows, but data won't persist. The app will show errors when trying to:
- Register users
- Post jobs
- Save applications

**Recommendation**: Set up Supabase (free, takes 5 minutes) for full functionality.

---

## 🎮 How to Test (Once Supabase is Setup)

### 1️⃣ Admin Login
- Visit: http://localhost:5173/local-job-portal/admin/login
- Password: `admin123`
- You'll see the admin dashboard

### 2️⃣ Register a Worker
- Visit: http://localhost:5173/local-job-portal/
- Select language
- Enter phone: `9876543210`
- Click "Send OTP"
- **OTP will be shown in a GREEN BOX on screen!** ✅
- Enter the OTP and verify
- Select "Worker" role
- Complete profile

### 3️⃣ Approve Worker (as Admin)
- Login as admin
- Find worker in "Pending Worker Verifications"
- Click "Approve"

### 4️⃣ Register an Employer
- Open new incognito/private window
- Register with different phone: `9876543211`
- Select "Employer" role
- Complete business profile

### 5️⃣ Approve Employer (as Admin)
- In admin dashboard
- Find employer in "Pending Employer Verifications"
- Click "Approve"

### 6️⃣ Post a Job (as Employer)
- Login as employer
- Click "Post Job"
- Fill job details
- Submit (status: "draft")

### 7️⃣ Approve Job (as Admin)
- In admin dashboard
- Find job in "Pending Job Approvals"
- Click "Approve" (status: "open")

### 8️⃣ Apply to Job (as Worker)
- Login as worker
- Go to "Jobs"
- Click on job
- Click "Apply Now"
- Submit application

### 9️⃣ Review Application (as Employer)
- Login as employer
- Go to "My Jobs"
- View applications
- Shortlist/Hire worker

---

## 🔑 Key Features Active

### ✅ Mock OTP System
- OTP displayed in GREEN BOX on screen
- OTP also logged in backend console
- No SMS sent (saves costs)
- Perfect for testing!

### ✅ Job Approval Flow
- Jobs start as "draft"
- Admin must approve
- Only "open" jobs visible to workers

### ✅ User Verification
- Workers/Employers need approval
- Admin reviews and approves
- Full access after approval

---

## 🛑 How to Stop Servers

The servers are running in background. To stop them:

**Option 1: Close Terminal**
- Just close the terminal window

**Option 2: Find and Kill Process**
```bash
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
lsof -ti:5173 | xargs kill
```

---

## 🔄 How to Restart Servers

If you need to restart:

```bash
# Terminal 1 - Backend
cd local-jobs-backend
npm run dev

# Terminal 2 - Frontend
cd local-jobs-platform
npm run dev
```

---

## 📊 Server Logs

### Backend Logs
Check the terminal where backend is running for:
- API requests
- OTP codes (in dev mode)
- Database queries
- Errors

### Frontend Logs
- Check browser console (F12)
- Check terminal for build issues

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Check backend is running: http://localhost:5000/health
- Should return: `{"success":true,"data":{"status":"OK",...}}`

### "Database error"
- Setup Supabase (see above)
- Update .env with real credentials
- Restart backend

### "OTP not showing"
- OTP appears in a green box below phone input
- Also check backend terminal logs
- Make sure `NODE_ENV=development` in backend .env

### Port already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

---

## 📁 File Structure

```
job-portal/
├── local-jobs-backend/
│   ├── .env                    ← Backend config (update Supabase here)
│   ├── src/server.ts           ← Backend entry point
│   ├── SUPABASE_SCHEMA.sql     ← Run this in Supabase
│   └── package.json
│
└── local-jobs-platform/
    ├── .env                    ← Frontend config (already set)
    ├── src/App.tsx             ← Frontend entry point
    └── package.json
```

---

## ✅ Next Steps

1. **Setup Supabase** (5 minutes)
   - Create project
   - Run schema
   - Update .env
   - Restart backend

2. **Start Testing**
   - Follow the testing flow above
   - OTP will be shown on screen
   - Test all approval workflows

3. **Optional: Setup Cloudinary**
   - For document uploads
   - Not required for basic testing

---

## 🎉 You're All Set!

**Backend**: ✅ Running on http://localhost:5000
**Frontend**: ✅ Running on http://localhost:5173/local-job-portal/
**Admin Password**: `admin123`

**Next**: Setup Supabase to enable data persistence, then start testing!

For detailed testing instructions, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)
