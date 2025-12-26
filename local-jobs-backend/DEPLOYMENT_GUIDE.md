# Complete Deployment Guide
## Hyperlocal Job Marketplace Backend

This guide will help you deploy your production-ready backend to Railway with Supabase, Cloudinary, and other services.

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### Required Accounts (All Free Tier Available)
- [ ] Supabase account
- [ ] Cloudinary account
- [ ] MSG91 account (for Indian SMS)
- [ ] Brevo account (for emails)
- [ ] Railway account
- [ ] GitHub account

---

## 🚀 **STEP-BY-STEP DEPLOYMENT**

### **STEP 1: Setup Supabase Database**

#### 1.1 Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new organization (free)
4. Click "New Project"
   - Name: `job-platform-db`
   - Database Password: (Generate strong password - SAVE THIS!)
   - Region: Select closest to India (Singapore/Mumbai if available)
5. Wait 2-3 minutes for database to provision

#### 1.2 Run Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open `SUPABASE_SCHEMA.sql` file from your backend folder
4. Copy ENTIRE content
5. Paste into SQL Editor
6. Click **RUN** (bottom right)
7. Wait for "Success. No rows returned" message

#### 1.3 Get API Keys
1. Go to **Settings** → **API**
2. Copy these values:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJxxx...
   service_role key: eyJxxx...  (click "Reveal" to see)
   ```
3. **SAVE THESE** - you'll need them for .env

#### 1.4 Enable RLS (Row Level Security)
- Already configured in schema ✓
- Verify: Go to **Authentication** → **Policies**
- You should see multiple policies listed

---

### **STEP 2: Setup Cloudinary (File Storage)**

#### 2.1 Create Account
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for FREE account
3. Verify email

#### 2.2 Get Credentials
1. Go to **Dashboard**
2. Copy these values:
   ```
   Cloud Name: your-cloud-name
   API Key: 123456789012345
   API Secret: xxxxxxxxxxxxx
   ```
3. **SAVE THESE** for .env

#### 2.3 Create Upload Presets (Optional but recommended)
1. Go to **Settings** → **Upload**
2. Scroll to "Upload presets"
3. Click "Add upload preset"
   - Preset name: `job_platform`
   - Signing mode: Signed
   - Folder: `job-platform`
   - Save

---

### **STEP 3: Setup MSG91 (India SMS)**

#### 3.1 Create Account
1. Go to [https://msg91.com](https://msg91.com)
2. Sign up with Indian phone number
3. Verify mobile and email

#### 3.2 Get Auth Key
1. Go to **Dashboard**
2. Click on your name (top right) → **API Keys**
3. Copy **Auth Key**
4. **SAVE THIS** for .env

#### 3.3 Create OTP Template
1. Go to **SMS** → **Configure** → **Templates**
2. Click "Create New Template"
3. Template content:
   ```
   Your Job Platform OTP is {#var#}. Valid for 5 minutes. Do not share with anyone.
   ```
4. **Sender ID**: JOBAPP (or your preferred 6-char ID)
5. Submit for approval
6. Copy **Template ID** once approved
7. **SAVE Template ID** for .env

**Note**: Template approval takes 1-2 hours. Meanwhile, use development mode.

---

### **STEP 4: Setup Brevo/SendinBlue (Emails)**

#### 4.1 Create Account
1. Go to [https://brevo.com](https://brevo.com)
2. Sign up for FREE account (300 emails/day)
3. Verify email

#### 4.2 Get API Key
1. Go to **SMTP & API** → **API Keys**
2. Click "Generate a new API key"
3. Name: `Job Platform Backend`
4. Copy the key
5. **SAVE THIS** for .env

#### 4.3 Verify Sender Email (Important!)
1. Go to **Senders & IP**
2. Click "Add a sender"
3. Enter your email (e.g., noreply@yourdomain.com)
4. Verify via email link

---

### **STEP 5: Configure Environment Variables**

#### 5.1 Update Local .env File
Edit `local-jobs-backend/.env` with all your collected values:

```bash
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Supabase (from Step 1.3)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Secrets (generate these - see below)
JWT_SECRET=your-generated-32-char-secret-here
JWT_REFRESH_SECRET=your-generated-32-char-refresh-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary (from Step 2.2)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnop

# MSG91 (from Step 3.2 & 3.3)
MSG91_AUTH_KEY=123456ABCDEFxxxxx
MSG91_SENDER_ID=JOBAPP
MSG91_TEMPLATE_ID=123456789012345678901234

# Brevo (from Step 4.2 & 4.3)
BREVO_API_KEY=xkeysib-xxxxx
EMAIL_FROM=noreply@yourdomain.com

# Admin
ADMIN_PASSWORD=admin123
```

#### 5.2 Generate JWT Secrets
Run these commands to generate secure secrets:

```bash
# For Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output and paste as JWT_SECRET

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output and paste as JWT_REFRESH_SECRET
```

---

### **STEP 6: Test Backend Locally**

#### 6.1 Start Development Server
```bash
cd local-jobs-backend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Job Platform API Server Running                 ║
║                                                       ║
║   Environment: development                            ║
║   Port:        5000                                   ║
║   URL:         http://localhost:5000                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

#### 6.2 Test Health Endpoint
Open browser: `http://localhost:5000/health`

You should see:
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2024-xx-xxT..."
  }
}
```

#### 6.3 Test Registration (Optional)
Use Postman/Thunder Client:

```http
POST http://localhost:5000/api/auth/send-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "purpose": "registration"
}
```

**If everything works:** Backend is ready for deployment! ✅

---

### **STEP 7: Deploy to Railway**

#### 7.1 Push Code to GitHub
```bash
cd local-jobs-backend
git init
git add .
git commit -m "Initial backend setup"

# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/job-platform-backend.git
git branch -M main
git push -u origin main
```

#### 7.2 Deploy on Railway
1. Go to [https://railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `job-platform-backend` repository
6. Railway will auto-detect Node.js and start deployment

#### 7.3 Add Environment Variables on Railway
1. Click on your project
2. Go to **Variables** tab
3. Click "RAW Editor"
4. Paste ALL environment variables (copy from your local .env):

```bash
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...

JWT_SECRET=your-generated-secret
JWT_REFRESH_SECRET=your-generated-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdef

MSG91_AUTH_KEY=xxxxx
MSG91_SENDER_ID=JOBAPP
MSG91_TEMPLATE_ID=xxxxx

BREVO_API_KEY=xkeysib-xxxxx
EMAIL_FROM=noreply@yourdomain.com

ADMIN_PASSWORD=admin123

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. Click "Deploy" or wait for auto-deploy

#### 7.4 Get Railway URL
1. Go to **Settings** tab
2. Under "Domains", click "Generate Domain"
3. Railway will assign: `https://your-app-name.up.railway.app`
4. **COPY THIS URL** - This is your backend API URL!

#### 7.5 Update CORS
In Railway **Variables**, update:
```
FRONTEND_URL=https://www.yourdomain.com
```
(Replace with your actual frontend URL)

---

### **STEP 8: Test Production Backend**

#### 8.1 Test Health Endpoint
Open: `https://your-app.up.railway.app/health`

Should return:
```json
{"success":true,"data":{"status":"OK","timestamp":"..."}}
```

#### 8.2 Test with Frontend
Update frontend `.env`:
```
VITE_API_URL=https://your-app.up.railway.app
```

Rebuild frontend and test registration/login flow.

---

## 🔧 **TROUBLESHOOTING**

### Backend won't start on Railway
**Check**: Railway Logs (click "View Logs")
**Common issues**:
- Missing environment variables
- Database connection failed (check Supabase URL)
- Port configuration (Railway auto-assigns port)

### CORS errors
**Solution**: Update `FRONTEND_URL` in Railway variables to match your frontend domain exactly

### SMS not sending
**Check**:
- MSG91 account balance
- Template approval status
- In development mode, OTP is logged to console

### Database errors
**Check**:
- Supabase project is active
- SQL schema was executed completely
- Service role key is correct (not anon key)

### File upload failing
**Check**:
- Cloudinary credentials are correct
- File size < 5MB
- File type is jpg/png/pdf

---

## 📊 **MONITORING**

### Railway Dashboard
- View logs: Real-time application logs
- Metrics: CPU, memory, network usage
- Deployments: History of all deployments

### Supabase Dashboard
- Database: View tables, run queries
- Auth: Monitor user signups
- Storage: Check file uploads (if using Supabase storage)
- Logs: Database query logs

### Cost Monitoring
- Railway: Check usage in Settings
- Supabase: Check usage in Organization settings
- Cloudinary: Dashboard shows bandwidth/storage used

---

## 💰 **COST SUMMARY**

| Service | Free Tier | Estimated Cost (Month 1-2) |
|---------|-----------|----------------------------|
| Railway | $5 credit | $5/month |
| Supabase | 500MB DB, 50k users | FREE |
| Cloudinary | 25GB storage, 25GB bandwidth | FREE |
| MSG91 | Pay per SMS | ₹100-500 (~100-500 SMS) |
| Brevo | 300 emails/day | FREE |
| **TOTAL** | | **~₹500-1000/month** |

---

## 🎯 **NEXT STEPS**

1. ✅ Backend deployed and running
2. ⏭️ Update frontend to use production backend URL
3. ⏭️ Test complete user flow (registration → verification → job application)
4. ⏭️ Monitor logs for first 24 hours
5. ⏭️ Set up alerts (Railway can send notifications)
6. ⏭️ Plan scaling strategy (when needed)

---

## 📞 **SUPPORT RESOURCES**

- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Cloudinary**: [cloudinary.com/documentation](https://cloudinary.com/documentation)
- **MSG91**: [docs.msg91.com](https://docs.msg91.com)
- **Brevo**: [developers.brevo.com](https://developers.brevo.com)

---

**🎉 Congratulations! Your backend is now live in production!**

Save this guide for future reference and updates.
