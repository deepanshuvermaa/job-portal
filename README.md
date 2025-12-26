# 🏢 Local Job Portal - Hyperlocal Job Marketplace

A comprehensive job marketplace platform connecting local workers with employers in their area. Features include OTP-based authentication, admin verification system, job approval workflow, and real-time application management.

**Live Testing URL**: http://deepanshuverma.site/local-job-portal

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Phone OTP Authentication** - Secure login via SMS OTP
- **Role-Based Access** - Worker, Employer, and Admin roles
- **Dev Mode OTP Display** - OTP shown on screen during testing
- **Session Management** - Persistent login with JWT tokens

### 👷 Worker Features
- Multi-language support (English/Hindi)
- Complete profile with documents (Aadhaar, Photo, Resume)
- OCR-based Aadhaar verification
- Job search with filters (city, job type)
- One-click job applications
- Application status tracking
- Skill-based job matching

### 🏪 Employer Features
- Business profile creation
- Document verification (GST, PAN, Business License)
- Post job listings with detailed requirements
- View and manage applications
- Shortlist, reject, or hire candidates
- Track hiring statistics

### 👨‍💼 Admin Features
- **Worker Verification** - Approve/reject worker registrations
- **Employer Verification** - Verify business authenticity
- **Job Approval System** - Review and approve jobs before they go live
- Statistics dashboard
- Platform moderation tools

### 🎯 Key Workflows
1. **Registration** → **Admin Verification** → **Platform Access**
2. **Job Posting** → **Admin Approval** → **Visible to Workers**
3. **Worker Application** → **Employer Review** → **Hiring**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- Cloudinary account (for uploads, free tier works)

### 1. Clone Repository
```bash
git clone <repository-url>
cd job-portal
```

### 2. Setup Backend

```bash
cd local-jobs-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add:
# - Supabase credentials
# - Cloudinary credentials
# - JWT secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Run database schema
# Go to Supabase Dashboard → SQL Editor
# Run the contents of SUPABASE_SCHEMA.sql

# Start development server
npm run dev
```

Backend will run on http://localhost:5000

### 3. Setup Frontend

```bash
cd local-jobs-platform

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env (default values work for local development)
VITE_API_URL=http://localhost:5000
VITE_SITE_URL=http://localhost:5173
VITE_MOCK_MODE=false

# Start development server
npm run dev
```

Frontend will run on http://localhost:5173

---

## 📚 Documentation

### 📖 Complete Guides
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Step-by-step testing instructions
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment guide

### 🧪 Testing the Platform

**Admin Credentials**:
- URL: `/admin/login`
- Password: `admin123` (change in production!)

**Test Flow**:
1. Register as Worker (phone: any 10-digit number)
2. Register as Employer (phone: different 10-digit number)
3. Login as Admin → Approve both accounts
4. Login as Employer → Post a job
5. Login as Admin → Approve the job
6. Login as Worker → Apply to the job
7. Login as Employer → Manage application

**OTP in Development Mode**:
- OTP is displayed in a green box on the screen
- OTP is also logged in backend console
- No actual SMS is sent (saves costs)

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed instructions.

---

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express** - Server framework
- **TypeScript** - Type safety
- **Supabase** - Database & Authentication
- **Cloudinary** - Image/document storage
- **Tesseract.js** - OCR for document verification
- **JWT** - Token-based authentication
- **MSG91** - SMS OTP (production)

### Frontend
- **React** + **TypeScript** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hook Form** - Form handling

---

## 📁 Project Structure

```
job-portal/
├── local-jobs-backend/          # Backend API
│   ├── src/
│   │   ├── app.ts               # Main Express app with all routes
│   │   ├── server.ts            # Server entry point
│   │   ├── config/              # Configuration files
│   │   ├── middlewares/         # Auth, upload, validation
│   │   ├── services/            # Business logic (SMS, Upload, OCR)
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Helper functions
│   ├── SUPABASE_SCHEMA.sql      # Database schema
│   └── .env                     # Environment variables
│
├── local-jobs-platform/         # Frontend React app
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   ├── store/               # State management
│   │   ├── utils/               # Helpers & translations
│   │   └── App.tsx              # Main app component
│   └── .env                     # Environment variables
│
├── TESTING_GUIDE.md             # Testing instructions
├── DEPLOYMENT_GUIDE.md          # Deployment guide
└── README.md                    # This file
```

---

## 🔑 Key Features Explained

### 1. OTP Authentication Flow
```
User enters phone → Backend generates OTP → Stored in database
                  ↓
[DEV MODE] OTP returned in API response → Shown on screen
[PROD MODE] OTP sent via MSG91 SMS → User receives SMS
                  ↓
User enters OTP → Backend verifies → JWT token issued
```

### 2. Job Approval Workflow
```
Employer posts job → Status: "draft" → Invisible to workers
                  ↓
Admin reviews job in admin panel
                  ↓
Admin approves → Status: "open" → Visible to workers
                  ↓
Workers can now browse and apply
```

### 3. User Verification System
```
User registers → Profile status: "pending" → Limited access
                  ↓
Admin reviews profile & documents
                  ↓
Admin approves → Status: "approved" → Full platform access
```

---

## 🔧 Configuration

### Backend Environment Variables

```bash
# Server
NODE_ENV=development                    # development | production
PORT=5000
FRONTEND_URL=http://localhost:5173

# Supabase (Required)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_KEY=eyJhbG...

# JWT (Required - Generate new secrets!)
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Cloudinary (Required for uploads)
CLOUDINARY_CLOUD_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# MSG91 (Optional - only for production SMS)
MSG91_AUTH_KEY=your-key
MSG91_SENDER_ID=JOBAPP
MSG91_TEMPLATE_ID=your-template

# Admin
ADMIN_PASSWORD=admin123                 # CHANGE IN PRODUCTION!
```

### Frontend Environment Variables

```bash
VITE_API_URL=http://localhost:5000
VITE_SITE_URL=http://localhost:5173
VITE_MOCK_MODE=false
```

---

## 🎯 Testing Checklist

- [ ] Worker registration with OTP
- [ ] Employer registration with OTP
- [ ] Admin login (password: admin123)
- [ ] Admin approves worker
- [ ] Admin approves employer
- [ ] Employer posts job
- [ ] Admin approves job
- [ ] Worker sees approved job in job feed
- [ ] Worker applies to job
- [ ] Employer sees application
- [ ] Employer shortlists/hires worker
- [ ] OTP displays on screen (dev mode)

---

## 🚀 Deployment

### Quick Deploy to Production

1. **Setup Database**
   - Create Supabase project
   - Run `SUPABASE_SCHEMA.sql`

2. **Configure Backend**
   - Update `.env` with production values
   - Set `NODE_ENV=production`
   - Generate new JWT secrets
   - Add MSG91 credentials for SMS

3. **Build & Deploy Backend**
   ```bash
   npm run build
   pm2 start dist/server.js --name job-portal-api
   ```

4. **Build & Deploy Frontend**
   ```bash
   npm run build
   # Upload dist/ folder to web server
   ```

5. **Configure Nginx**
   - Setup reverse proxy for API
   - Serve frontend static files
   - Enable SSL certificate

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🐛 Troubleshooting

### OTP Not Showing
- **Dev Mode**: Check backend console logs
- **Ensure**: `NODE_ENV=development` in backend `.env`
- **Check**: OTP is in API response (use browser DevTools)

### Jobs Not Visible to Workers
- **Reason**: Jobs need admin approval
- **Fix**: Login as admin → Approve job
- **Check**: Job status should be "open", not "draft"

### User Can't Login After Registration
- **Reason**: User needs admin verification
- **Fix**: Login as admin → Approve user
- **Check**: User verification status

### Database Connection Errors
- **Check**: Supabase credentials in `.env`
- **Verify**: Supabase project is active
- **Test**: Visit Supabase dashboard

---

## 📊 Database Schema

### Main Tables
- **users** - Base user table (linked to Supabase auth)
- **worker_profiles** - Worker details, skills, documents
- **employer_profiles** - Business details, verification
- **jobs** - Job listings with status (draft/open/closed)
- **applications** - Job applications with status
- **otp_verifications** - OTP codes and verification
- **notifications** - User notifications
- **reviews** - Ratings and reviews

### Key Relationships
```
users (1) ←→ (1) worker_profiles
users (1) ←→ (1) employer_profiles
users (1) ←→ (many) jobs (as employer)
users (1) ←→ (many) applications (as worker)
jobs (1) ←→ (many) applications
```

---

## 🔒 Security Features

- ✅ OTP-based authentication
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Rate limiting on API endpoints
- ✅ Input validation and sanitization
- ✅ File upload size limits
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Environment variable protection

---

## 🎨 UI/UX Features

- 📱 Fully responsive design
- 🌍 Multi-language support (English/Hindi)
- ♿ Accessible components
- 🎯 Intuitive navigation
- ⚡ Fast page loads
- 📊 Real-time status updates
- 🔔 Notification system
- 🎨 Clean, modern interface

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- Supabase for database and auth
- Cloudinary for media storage
- MSG91 for SMS services
- All open-source libraries used

---

## 📞 Support

For issues or questions:
1. Check the [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. Review backend logs: `pm2 logs job-portal-api`
4. Check browser console for frontend errors

---

## 🎉 Current Status

✅ **Ready for Testing**
- All core features implemented
- Dev mode OTP display working
- Admin approval workflows functional
- Job approval system active
- Complete documentation provided

🚧 **Next Steps**
1. Test all user flows thoroughly
2. Set up production environment
3. Configure MSG91 for production SMS
4. Deploy to production server
5. Monitor and optimize performance

---

**Built with ❤️ for connecting local workers with opportunities**

Visit: http://deepanshuverma.site/local-job-portal
