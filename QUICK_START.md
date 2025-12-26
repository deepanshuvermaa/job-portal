# 🚀 Quick Start Guide

## Project Completion Summary

✅ **All testing flows are ready!** The Local Job Portal is fully functional with all core features implemented:

### ✨ What's Been Completed

1. **✅ Mock OTP System** - OTP codes are displayed on screen during testing (dev mode)
2. **✅ Job Approval Workflow** - Admin must approve jobs before they're visible to workers
3. **✅ User Verification System** - Admin verification for both workers and employers
4. **✅ Complete User Flows** - Registration, login, job posting, applications
5. **✅ Build Ready** - Both backend and frontend compiled successfully

---

## 🎯 For Testing on http://deepanshuverma.site/local-job-portal

### Step 1: Verify Environment Files

**Backend** (`local-jobs-backend/.env`):
```bash
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://deepanshuverma.site/local-job-portal

# Add your Supabase credentials
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_KEY=your-key

# Generate JWT secrets:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<generate-new>
JWT_REFRESH_SECRET=<generate-new>

# Add Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Optional (leave default for testing)
MSG91_AUTH_KEY=not-required-for-dev-mode
ADMIN_PASSWORD=admin123
```

**Frontend** (`local-jobs-platform/.env`):
```bash
VITE_API_URL=http://deepanshuverma.site/local-job-portal/api
VITE_SITE_URL=http://deepanshuverma.site/local-job-portal
VITE_MOCK_MODE=false
```

### Step 2: Setup Database

1. Create Supabase project: https://supabase.com
2. Go to SQL Editor in Supabase
3. Run the entire `local-jobs-backend/SUPABASE_SCHEMA.sql` file
4. Verify tables are created (users, jobs, applications, etc.)

### Step 3: Deploy Backend

```bash
cd local-jobs-backend

# The dist folder already exists with compiled code
# Start with PM2 (recommended) or node
pm2 start dist/server.js --name job-portal-api
# OR
node dist/server.js
```

### Step 4: Deploy Frontend

```bash
cd local-jobs-platform

# The dist folder already exists with built files
# Copy dist/ contents to your web server
# Example:
cp -r dist/* /var/www/html/local-job-portal/
```

### Step 5: Configure Nginx

Add to your nginx config:

```nginx
# Backend API
location /local-job-portal/api {
    rewrite ^/local-job-portal/api/(.*) /api/$1 break;
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Frontend Static Files
location /local-job-portal {
    alias /var/www/html/local-job-portal;
    try_files $uri $uri/ /local-job-portal/index.html;
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

---

## 🧪 Start Testing!

### 1. Admin Login
- Visit: `http://deepanshuverma.site/local-job-portal/admin/login`
- Password: `admin123`

### 2. Register a Worker
- Visit: `http://deepanshuverma.site/local-job-portal`
- Select language → Enter phone (e.g., `9876543210`)
- Click "Send OTP"
- **THE OTP WILL BE DISPLAYED IN A GREEN BOX!** ✅
- Enter the OTP and verify
- Select "Worker" role
- Complete profile

### 3. Approve Worker (Admin)
- Go to admin dashboard
- Find worker in "Pending Worker Verifications"
- Click "Approve"

### 4. Register an Employer
- Open incognito/private window
- Repeat registration with different phone (e.g., `9876543211`)
- Select "Employer" role
- Complete business profile

### 5. Approve Employer (Admin)
- In admin dashboard
- Find employer in "Pending Employer Verifications"
- Click "Approve"

### 6. Post a Job (Employer)
- Login as employer
- Click "Post Job"
- Fill job details
- Submit (status will be "draft")

### 7. Approve Job (Admin)
- In admin dashboard
- Find job in "Pending Job Approvals"
- Click "Approve" (status changes to "open")

### 8. Apply to Job (Worker)
- Login as worker
- Go to "Jobs" section
- Click on the approved job
- Click "Apply Now"
- Fill application form and submit

### 9. Review Application (Employer)
- Login as employer
- Go to "My Jobs"
- View applications
- Shortlist/Hire the worker

---

## 🎯 Key Testing Features

### OTP Display (Dev Mode)
When `NODE_ENV=development`:
- ✅ OTP shown in green box on screen
- ✅ OTP logged in backend console
- ✅ No actual SMS sent

### Job Approval Flow
- ✅ New jobs start as "draft"
- ✅ Only admin can approve
- ✅ Workers see only "open" jobs
- ✅ Admin can reject jobs

### User Verification
- ✅ New users are "pending"
- ✅ Admin reviews and approves
- ✅ Approved users get full access

---

## 📁 Project Structure

```
job-portal/
├── local-jobs-backend/
│   ├── dist/                 ✅ BUILT (ready to deploy)
│   ├── src/                  (source code)
│   ├── .env                  (configure this!)
│   └── SUPABASE_SCHEMA.sql   (run this in Supabase)
│
├── local-jobs-platform/
│   ├── dist/                 ✅ BUILT (ready to deploy)
│   ├── src/                  (source code)
│   └── .env                  (configure this!)
│
├── README.md                 (main documentation)
├── TESTING_GUIDE.md          (detailed testing instructions)
├── DEPLOYMENT_GUIDE.md       (full deployment guide)
└── QUICK_START.md            (this file)
```

---

## 🔍 Troubleshooting

### OTP not showing?
- Check browser console for errors
- OTP should appear in a green box below "OTP sent to: {phone}"
- Also check backend logs: `pm2 logs job-portal-api`

### Jobs not visible to workers?
- Ensure job status is "open" (not "draft")
- Admin must approve jobs first
- Check admin panel → Pending Job Approvals

### Cannot login after registration?
- Admin needs to approve user first
- Check admin panel → Pending Verifications
- Approve the user

### Database errors?
- Verify Supabase credentials in `.env`
- Check if SUPABASE_SCHEMA.sql was run
- Test connection: `curl http://localhost:5000/health`

---

## 📚 Full Documentation

- **Testing Guide**: See `TESTING_GUIDE.md` for comprehensive test scenarios
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md` for production deployment
- **README**: See `README.md` for project overview and tech stack

---

## 🎉 Success Checklist

Test these flows to ensure everything works:

- [ ] Admin can login
- [ ] Worker registration shows OTP on screen
- [ ] Employer registration shows OTP on screen
- [ ] Admin can approve workers
- [ ] Admin can approve employers
- [ ] Employer can post job (starts as draft)
- [ ] Admin can approve job (becomes open)
- [ ] Worker can see and apply to approved jobs
- [ ] Employer can manage applications
- [ ] Employer can shortlist/hire workers

---

## 🚀 Next Steps

1. **Test thoroughly** using the flows above
2. **Document any issues** you find
3. **When ready for production**:
   - Set `NODE_ENV=production` in backend
   - Add real MSG91 credentials for SMS
   - Change admin password
   - Generate new JWT secrets
   - Enable SSL certificate

---

## 📞 Quick Reference

### Default Credentials
- **Admin Password**: `admin123`
- **Test Phone 1**: `9876543210` (Worker)
- **Test Phone 2**: `9876543211` (Employer)

### Important URLs
- **Frontend**: http://deepanshuverma.site/local-job-portal
- **Admin**: http://deepanshuverma.site/local-job-portal/admin/login
- **API Health**: http://deepanshuverma.site/local-job-portal/api/health

### Key Commands
```bash
# Check backend status
pm2 status
pm2 logs job-portal-api

# Restart backend
pm2 restart job-portal-api

# Check nginx
sudo nginx -t
sudo systemctl status nginx

# View nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

**Everything is ready for testing! 🎉**

Start with the Admin Login and work through the test flows. The OTP will be displayed on screen, and all approval workflows are active.

For any questions, refer to the detailed guides in this project.
