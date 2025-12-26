# ⚡ QUICK START GUIDE
## Get Your Backend Running in 10 Minutes

---

## 🚀 **FASTEST PATH TO RUNNING BACKEND**

### **Step 1: Install Dependencies** (2 minutes)
```bash
cd C:\Users\Asus\local-jobs-backend
npm install
```

### **Step 2: Setup Supabase** (3 minutes)
1. Go to [supabase.com](https://supabase.com) → Sign up (FREE)
2. Create new project → Copy URL and keys
3. Go to SQL Editor → Paste entire `SUPABASE_SCHEMA.sql` → Run

### **Step 3: Configure .env** (2 minutes)
Edit `.env` file:
```bash
# Minimum required for local testing:
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...

# Generate these:
JWT_SECRET=run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_REFRESH_SECRET=run again for different value

# Optional (use defaults for now):
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=demo
CLOUDINARY_API_SECRET=demo

MSG91_AUTH_KEY=demo
MSG91_SENDER_ID=JOBAPP
MSG91_TEMPLATE_ID=demo

BREVO_API_KEY=demo
EMAIL_FROM=noreply@demo.com
```

### **Step 4: Start Server** (30 seconds)
```bash
npm run dev
```

### **Step 5: Test** (30 seconds)
Open browser: `http://localhost:5000/health`

Should see:
```json
{
  "success": true,
  "data": {
    "status": "OK"
  }
}
```

---

## ✅ **YOU'RE DONE!**

Backend is running! 🎉

---

## 🧪 **Quick Test with Postman**

### Test 1: Send OTP
```http
POST http://localhost:5000/api/auth/send-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "purpose": "registration"
}
```

**Note:** In development mode, OTP is logged to console (not actually sent via SMS)

### Test 2: Register Worker
```http
POST http://localhost:5000/api/auth/register/worker
Content-Type: application/json

{
  "phone": "9876543210",
  "password": "Test@123",
  "full_name": "Test User",
  "otp": "123456"
}
```

**Note:** You'll get tokens in response. Copy `accessToken`.

### Test 3: Get Profile
```http
GET http://localhost:5000/api/workers/profile
Authorization: Bearer <paste-your-accessToken-here>
```

---

## 📖 **Next Steps**

1. ✅ Backend running locally
2. ⏭️ Read `API_DOCUMENTATION.md` for all endpoints
3. ⏭️ Setup external services (Cloudinary, MSG91, Brevo) for full functionality
4. ⏭️ Follow `DEPLOYMENT_GUIDE.md` to deploy to Railway

---

## 🆘 **Troubleshooting**

### Backend won't start?
```bash
# Check Node version (need 18+)
node --version

# Reinstall dependencies
rm -rf node_modules
npm install

# Check .env file exists
ls .env
```

### Supabase connection error?
- Double-check `SUPABASE_URL` and keys in .env
- Make sure you ran the SQL schema

### Can't generate JWT secret?
Just use any random 32+ character string for local testing:
```
JWT_SECRET=my-super-secret-key-for-local-testing-only
JWT_REFRESH_SECRET=another-secret-key-for-refresh-tokens
```

---

## 📱 **What Works Without External Services**

### ✅ Works with just Supabase:
- User registration (OTP logged to console)
- Login
- Profile management
- Job creation
- Job search
- Applications
- Admin functions

### ❌ Needs external setup:
- Actual SMS sending (MSG91)
- Email sending (Brevo)
- File uploads (Cloudinary)
- OCR processing (works locally with Tesseract.js but slower)

---

**🎯 Pro Tip:** Start with just Supabase, test core functionality, then add other services one by one!

---

**For detailed instructions, see:**
- `README.md` - Full project documentation
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `API_DOCUMENTATION.md` - API reference
- `PROJECT_SUMMARY.md` - Complete feature list
