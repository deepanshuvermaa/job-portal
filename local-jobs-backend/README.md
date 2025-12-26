# Hyperlocal Job Marketplace - Backend API

Production-ready backend for hyperlocal job marketplace platform connecting workers with employers in Tier 2/3 Indian cities.

## 🚀 Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **File Storage:** Cloudinary
- **Authentication:** JWT + Supabase Auth
- **SMS:** MSG91 (India)
- **Email:** Brevo
- **OCR:** Tesseract.js

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account (free tier)
- Cloudinary account (free tier)
- MSG91 account (for SMS OTP)
- Brevo account (for emails)

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
cd local-jobs-backend
npm install
```

### 2. Setup Supabase Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to SQL Editor
4. Copy the entire content from `SUPABASE_SCHEMA.sql`
5. Paste and run it in SQL Editor
6. Get your API keys from Settings → API

### 3. Setup Cloudinary

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Sign up for free account
3. Get your Cloud Name, API Key, and API Secret from Dashboard

### 4. Setup MSG91 (SMS for India)

1. Go to [MSG91](https://msg91.com/)
2. Sign up and get Auth Key
3. Create SMS template for OTP
4. Get Template ID

### 5. Setup Brevo (Email)

1. Go to [Brevo](https://brevo.com/)
2. Sign up for free account (300 emails/day)
3. Get API key from Settings → API Keys

### 6. Configure Environment Variables

Edit `.env` file and fill in all the values:

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123def456

# MSG91
MSG91_AUTH_KEY=your-auth-key
MSG91_TEMPLATE_ID=your-template-id

# Brevo
BREVO_API_KEY=your-api-key

# JWT Secret (generate random string)
JWT_SECRET=generate-random-32-char-string
JWT_REFRESH_SECRET=generate-another-random-32-char-string
```

To generate JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 7. Run the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

Server will start at: `http://localhost:5000`

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/send-otp              Send OTP to phone
POST   /api/auth/register/worker       Register worker
POST   /api/auth/register/employer     Register employer
POST   /api/auth/login                 Login
POST   /api/auth/admin/login           Admin login
```

### Worker Routes
```
GET    /api/workers/profile            Get profile
PUT    /api/workers/profile            Update profile
POST   /api/workers/upload-document    Upload document
GET    /api/workers/jobs/search        Search jobs
POST   /api/workers/jobs/:id/apply     Apply to job
GET    /api/workers/applications       Get applications
```

### Employer Routes
```
GET    /api/employers/profile                      Get profile
PUT    /api/employers/profile                      Update profile
POST   /api/employers/jobs                         Create job
GET    /api/employers/jobs                         Get all jobs
GET    /api/employers/jobs/:id/applications        Get applications
PUT    /api/employers/applications/:id             Update application status
```

### Admin Routes
```
GET    /api/admin/dashboard                   Dashboard stats
GET    /api/admin/pending-verifications       Pending verifications
PUT    /api/admin/workers/:id/verify          Approve/reject worker
PUT    /api/admin/employers/:id/verify        Approve/reject employer
```

## 🔐 Authentication

All protected routes require JWT token in Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer <your-jwt-token>'
}
```

## 📦 Project Structure

```
local-jobs-backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── env.ts
│   │   ├── supabase.ts
│   │   └── cloudinary.ts
│   ├── middlewares/     # Express middlewares
│   │   ├── auth.middleware.ts
│   │   └── upload.middleware.ts
│   ├── services/        # Business logic
│   │   ├── ocr.service.ts
│   │   ├── sms.service.ts
│   │   └── upload.service.ts
│   ├── utils/           # Helper functions
│   │   ├── jwt.ts
│   │   ├── helpers.ts
│   │   └── response.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── package.json
├── tsconfig.json
├── .env
└── SUPABASE_SCHEMA.sql
```

## 🔧 Features

✅ OTP-based authentication (SMS via MSG91)
✅ JWT token authentication
✅ Role-based access control (Worker/Employer/Admin)
✅ File upload to Cloudinary
✅ OCR document verification (Aadhaar/PAN/GST)
✅ Job posting and application management
✅ Admin verification workflow
✅ Secure password hashing
✅ Rate limiting
✅ CORS configuration
✅ Error handling
✅ TypeScript support

## 🌍 Deployment

### Railway Deployment

1. Push code to GitHub
2. Go to [Railway](https://railway.app/)
3. New Project → Deploy from GitHub
4. Select your backend repository
5. Add all environment variables
6. Deploy!

Railway will auto-assign a URL like: `https://your-app.up.railway.app`

### Environment Variables for Production

Make sure to set these in Railway dashboard:
- All variables from `.env` file
- Set `NODE_ENV=production`
- Set `FRONTEND_URL` to your actual frontend URL

## 💰 Cost Estimate (Free Tier)

- Supabase: FREE (500MB DB, 50k users)
- Cloudinary: FREE (25GB storage, 25GB bandwidth)
- Railway: $5/month (512MB RAM)
- MSG91: Pay-per-use (~₹0.20/SMS)
- Brevo: FREE (300 emails/day)

**Total: ~₹415-500/month** (~$5-6/month)

## 🐛 Troubleshooting

### "Missing environment variable" error
- Make sure all variables in `.env` are filled

### Supabase connection error
- Check if SUPABASE_URL and keys are correct
- Check if SQL schema is properly executed

### File upload fails
- Verify Cloudinary credentials
- Check file size (max 5MB)
- Check file type (only jpg, png, pdf allowed)

### SMS not sending
- Verify MSG91 credentials
- In development, SMS is logged to console
- Check MSG91 balance

## 📞 Support

For issues, check:
1. Console logs
2. Supabase logs (Dashboard → Logs)
3. Railway logs (if deployed)

## 📝 License

Private - All rights reserved

---

**Ready to launch your hyperlocal job marketplace! 🚀**
