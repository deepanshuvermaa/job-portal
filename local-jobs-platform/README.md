# LocalJobs - Hyperlocal Job Marketplace

A hyperlocal job marketplace platform designed specifically for Tier 2 & 3 cities in India, connecting local employers with nearby workers for non-tech, less-skilled positions.

## 🎯 Vision

**"Urban Company + Indeed + WhatsApp simplicity"**

Solving the gap where LinkedIn/Naukri are overkill for:
- Local shop owners, restaurants, garages, contractors
- Delivery boys, helpers, electricians, drivers, security guards
- Fast hiring with no resume requirements
- Trust-first approach with verification

## 🚀 Key Features

### For Employers
- ✅ **Simple Job Posting** (2-3 minutes)
- ✅ **Verification System** to prevent scams
- ✅ **Location-based Candidate Matching**
- ✅ **Direct Contact** via Call/WhatsApp
- ✅ **Applicant Management**

### For Workers
- ✅ **No Resume Required** - Skills-based profiles
- ✅ **Voice Introduction** support for low-literacy users
- ✅ **One-Click Apply** to jobs
- ✅ **Direct Call to Employer** option
- ✅ **Jobs Near You** with distance-based search
- ✅ **Multi-language Support** (Hindi + English)

### For Admins/Moderators
- ✅ **Employer Verification Queue**
- ✅ **Job Approval System**
- ✅ **Reports & Dispute Management**
- ✅ **Fraud Detection Signals**
- ✅ **Platform Analytics**

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Query Management**: TanStack Query

## 📁 Project Structure

```
local-jobs-platform/
├── src/
│   ├── components/
│   │   ├── employer/      # Employer-specific components
│   │   ├── worker/        # Worker-specific components
│   │   ├── admin/         # Admin dashboard components
│   │   └── shared/        # Reusable UI components
│   ├── pages/             # Page components
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions & constants
│   ├── hooks/             # Custom React hooks
│   ├── App.tsx            # Main app with routing
│   └── main.tsx           # Entry point
└── package.json
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. **Navigate to project directory**
   ```bash
   cd local-jobs-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   - Navigate to `http://localhost:5174` (or port shown in terminal)

### Demo Credentials

**Phone Authentication:**
- Use any 10-digit Indian mobile number (starting with 6-9)
- OTP will be displayed in the console
- Default demo OTP: `123456`

## 🎨 UI/UX Design Principles

1. **Mobile-First**: Large buttons, touch-friendly
2. **Icon-Heavy**: Minimize text, use visual indicators
3. **Multi-language**: Hindi as default, English option
4. **Low-Bandwidth Friendly**: Optimized assets
5. **Accessibility**: Voice support, high contrast

## 📊 Database Schema

### Core Entities

#### Users
- Base user with phone, role, verification status

#### Employers
- Business type, location, proof documents
- Responsiveness score, verified badge

#### Workers
- Skills (checkboxes), experience level
- Availability, languages, optional voice intro
- Reliability score, verified badge

#### Jobs
- Category, work type, salary range
- Location-based (lat/long for matching)
- Requirements, benefits
- Verification status, expiry

#### Applications
- Worker applies to job
- Status tracking (sent → viewed → hired)
- Distance calculation

## 🔒 Trust & Safety Features

### Employer Verification
- Phone OTP
- Business proof (photo/GST/license)
- Manual approval (initially)

### Job Quality Check
- Salary transparency enforced
- No MLM/scam/illegal jobs
- Moderation queue

### Worker Protection
- Verified employer badges
- Report job functionality
- Clear salary & location info

### Fraud Prevention
- Application limits (10/day)
- Duplicate detection
- Ban/warn system

## 🌍 Localization

### Supported Languages
- **Hindi (हिंदी)** - Default for Tier 2/3 cities
- **English** - Optional

### Translation Coverage
- All UI elements
- Error messages
- Form labels & placeholders
- Job categories & business types

## 📱 User Flows

### Employer Flow
1. Language selection
2. Phone OTP verification
3. Role selection (Employer)
4. Business signup + proof upload
5. Wait for approval
6. Post job (2-3 min form)
7. Job goes to moderation
8. View applicants
9. Call/WhatsApp candidates
10. Mark as hired

### Worker Flow
1. Language selection
2. Phone OTP verification
3. Role selection (Worker)
4. Profile creation (skills, experience, availability)
5. Optional: Record voice intro
6. Browse jobs near me
7. Apply with one click OR call directly
8. Track application status
9. Confirm call received

### Admin Flow
1. View pending employer verifications
2. Review business proofs
3. Approve/reject employers
4. Review job postings
5. Check for scam indicators
6. Handle reports
7. Ban/warn users if needed

## 🎯 Target Job Categories

1. **Delivery** - Bike/On-foot delivery
2. **Driver** - Car/Bike/Auto
3. **Helper** - Shop helper, office peon
4. **Mechanic** - Garage worker, technician
5. **Electrician** - Electrical work
6. **Plumber** - Plumbing work
7. **Cook** - Restaurant, home cooking
8. **Waiter** - Restaurant staff
9. **Cleaner** - Housekeeping, office cleaning
10. **Security** - Security guard
11. **Sales** - Shop sales person
12. **Factory Worker** - Manufacturing labor

## 🚫 What We Don't Allow

❌ Resume-based hiring
❌ English-only interface
❌ Unverified employers posting jobs
❌ Agency/MLM disguised as jobs
❌ Hidden salary information
❌ Complex multi-step forms
❌ Jobs without clear location
❌ Discrimination based on caste/gender/religion

## 🔮 Roadmap

### Phase 1 - MVP (Current)
- [x] Project setup & structure
- [x] Type definitions & schema
- [x] Multi-language support
- [x] Authentication UI (Phone OTP)
- [ ] Employer signup & verification
- [ ] Worker signup & profile
- [ ] Job posting form
- [ ] Job discovery & apply
- [ ] Admin dashboard

### Phase 2 - Core Features
- [ ] Backend API integration
- [ ] Real SMS OTP integration
- [ ] File upload (business proof, photos)
- [ ] Voice recording for worker intro
- [ ] Google Maps integration
- [ ] WhatsApp deep linking
- [ ] Push notifications (SMS)

### Phase 3 - Trust & Safety
- [ ] Advanced fraud detection
- [ ] Rating system
- [ ] Review system
- [ ] Employer responsiveness tracking
- [ ] Worker reliability scoring
- [ ] Automated scam detection

### Phase 4 - Scale
- [ ] Multiple cities
- [ ] Regional languages (Marathi, Tamil, etc.)
- [ ] Analytics dashboard
- [ ] Performance optimization
- [ ] Mobile app (React Native)

### Phase 5 - Monetization
- [ ] Paid job postings (₹99-499)
- [ ] Featured listings
- [ ] Subscription plans
- [ ] City franchise model

## 📈 Success Metrics

- **Employer Side**: Job post → hire rate
- **Worker Side**: Application → interview call rate
- **Platform**: Response time, verification turnaround
- **Trust**: Report rate, ban rate, quality score

## 🤝 Contributing

This is a private project. For questions or suggestions:
- Create an issue
- Submit a pull request

## 📄 License

Proprietary - All rights reserved

## 🙏 Acknowledgments

Inspired by the real needs of:
- Kirana shop owners in tier 2 cities
- Daily wage workers seeking local jobs
- The gap in hyperlocal job marketplaces

---

**Built with ❤️ for Bharat's local workforce**
