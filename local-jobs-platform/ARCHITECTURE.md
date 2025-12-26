# Technical Architecture - LocalJobs Platform

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │  Employer  │  │   Worker   │  │  Admin/Moderator │  │
│  │    App     │  │    App     │  │     Dashboard    │  │
│  └────────────┘  └────────────┘  └──────────────────┘  │
│         │                │                   │          │
│         └────────────────┴───────────────────┘          │
│                          │                               │
│                  ┌───────▼────────┐                     │
│                  │  Shared Layer  │                     │
│                  │  (Components,  │                     │
│                  │   State, Utils)│                     │
│                  └────────────────┘                     │
└─────────────────────────────────────────────────────────┘
                          │
                ┌─────────▼──────────┐
                │    API Gateway     │
                │    (Future)        │
                └────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼───────┐ ┌──────▼──────┐ ┌───────▼────────┐
│   Auth API    │ │  Jobs API   │ │ Moderation API │
│  (SMS OTP)    │ │ (CRUD+Match)│ │  (Approval)    │
└───────────────┘ └─────────────┘ └────────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                ┌─────────▼──────────┐
                │     Database       │
                │   (PostgreSQL)     │
                └────────────────────┘
```

## 📦 Frontend Architecture

### Component Hierarchy

```
App (BrowserRouter)
├── LanguageSelection (Public)
├── PhoneAuth (Public)
├── RoleSelection (Public)
├── EmployerApp (Protected)
│   ├── EmployerSignup
│   ├── EmployerDashboard
│   │   ├── JobList
│   │   ├── PostJobForm
│   │   └── ApplicantsList
│   └── JobDetails
├── WorkerApp (Protected)
│   ├── WorkerSignup
│   ├── WorkerDashboard
│   │   ├── JobFeed
│   │   ├── Filters
│   │   └── ApplicationsList
│   └── JobDetails
└── AdminApp (Protected)
    ├── AdminDashboard
    ├── VerificationQueue
    ├── ModerationQueue
    └── ReportsManagement
```

### State Management (Zustand)

#### Auth Store
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  loading: boolean,
  // Actions
  login(), logout(), setUser()
}
```

#### App Store
```typescript
{
  language: 'en' | 'hi',
  currentLocation: Location | null,
  isLocationPermissionGranted: boolean,
  // Actions
  setLanguage(), setCurrentLocation()
}
```

#### Future Stores
- `jobStore`: Job listings, filters, search
- `applicationStore`: Worker applications
- `notificationStore`: Real-time updates

### Routing Structure

```
/                          → LanguageSelection
/auth/phone                → PhoneAuth
/auth/role-select          → RoleSelection

/employer/signup           → EmployerSignup
/employer/dashboard        → EmployerDashboard (Protected)
/employer/jobs/:id         → JobDetails (Protected)
/employer/post-job         → PostJobForm (Protected)
/employer/applicants/:id   → ApplicantsList (Protected)

/worker/signup             → WorkerSignup
/worker/dashboard          → WorkerDashboard (Protected)
/worker/jobs/:id           → JobDetails (Protected)
/worker/profile            → WorkerProfile (Protected)
/worker/applications       → ApplicationsList (Protected)

/admin/dashboard           → AdminDashboard (Protected)
/admin/verify-employers    → EmployerVerificationQueue (Protected)
/admin/verify-jobs         → JobVerificationQueue (Protected)
/admin/reports             → ReportsManagement (Protected)
```

## 🗄️ Data Models

### User Hierarchy

```typescript
User (Base)
├── Employer
│   ├── businessType
│   ├── businessName
│   ├── location
│   ├── proofDocumentUrl
│   ├── responsivenesScore
│   └── verifiedBadge
│
├── Worker
│   ├── skills[]
│   ├── experience
│   ├── availability[]
│   ├── languages[]
│   ├── voiceIntroUrl
│   ├── reliabilityScore
│   └── verifiedBadge
│
└── Admin
    ├── role (super-admin, moderator, verifier)
    └── permissions[]
```

### Job Lifecycle

```
1. Employer creates job (status: 'pending')
   ↓
2. Admin reviews (verificationStatus: 'under-review')
   ↓
3. Admin approves/rejects
   ├─→ Approved: status → 'active', goes live
   └─→ Rejected: verificationStatus → 'rejected', reason sent
   ↓
4. Workers discover & apply
   ↓
5. Employer views applicants
   ↓
6. Employer contacts/hires
   ↓
7. Job closed or expires (30 days)
```

### Application Lifecycle

```
Worker applies
   ↓
status: 'sent'
   ↓
Employer views → status: 'viewed'
   ↓
Employer calls → workerReceivedCall: true
   ↓
   ├─→ Employer selects → status: 'selected'
   │   ↓
   │   Employer hires → status: 'hired'
   │
   └─→ Employer rejects → status: 'rejected'
```

## 🔐 Authentication Flow

### Phone OTP Flow

```
1. User enters phone number
2. Backend generates OTP (6 digits)
3. SMS sent via provider (Twilio/MSG91)
4. User enters OTP
5. Backend verifies OTP
6. JWT token generated
7. Token stored in localStorage (via Zustand persist)
8. Subsequent requests use Authorization: Bearer <token>
```

### Session Management

- JWT token expires in 30 days
- Refresh token flow (future)
- Logout clears localStorage
- Protected routes check `isAuthenticated`

## 🎯 Matching Algorithm (Location-Based)

### Distance Calculation

```typescript
// Haversine formula
function calculateDistance(
  lat1, lon1, // Worker location
  lat2, lon2  // Job location
): number {
  // Returns distance in km
}
```

### Job Matching Logic

```
For each job:
  1. Get job location (lat, lon)
  2. For each worker in area:
     - Calculate distance
     - Check if distance <= maxDistance (default 10km)
     - Check if worker skills match job category
     - Check if worker availability matches job workType
  3. Sort by:
     - Distance (nearest first)
     - Reliability score (higher first)
     - Application timestamp (recent first)
  4. Return top N matches
```

## 🛡️ Security Considerations

### Frontend Security

1. **No Sensitive Data in State**
   - Passwords never stored
   - Token encrypted in localStorage
   - Personal documents not cached

2. **Input Validation**
   - Phone number format (10 digits, starts with 6-9)
   - OTP format (6 digits)
   - File upload size limits (2MB)
   - File type restrictions (image/pdf only)

3. **XSS Prevention**
   - React automatically escapes
   - DOMPurify for user-generated content
   - No `dangerouslySetInnerHTML`

4. **CSRF Protection**
   - JWT in header, not cookies
   - SameSite cookie policy (future)

### API Security (Future Backend)

1. **Rate Limiting**
   - OTP requests: 3 per phone per hour
   - Job posts: 10 per employer per day
   - Applications: 10 per worker per day

2. **Verification Layers**
   - Phone verification (OTP)
   - Employer business proof
   - Admin approval for first job

3. **Fraud Detection**
   - Duplicate phone detection
   - Suspicious pattern flagging
   - IP-based rate limiting

## 📱 Responsive Design Strategy

### Breakpoints (Tailwind)

```css
sm:  640px   → Small phones (landscape)
md:  768px   → Tablets
lg:  1024px  → Small laptops
xl:  1280px  → Desktop
2xl: 1536px  → Large desktop
```

### Mobile-First Approach

```tsx
// Base styles for mobile
<button className="px-4 py-3 text-base">
  // Larger for tablets/desktop
  <button className="px-4 py-3 md:px-6 md:py-4 text-base md:text-lg">
```

### Touch Targets

- Minimum 48x48px (iOS/Android guidelines)
- Buttons: py-3 (48px height)
- Icons: w-6 h-6 minimum
- Spacing between interactive elements: 8px minimum

## 🌐 Internationalization (i18n)

### Translation System

```typescript
translations = {
  en: { ... },
  hi: { ... },
  // Future: mr, gu, ta, te, kn, bn, pa
}

// Usage
const { t } = useTranslation(language);
t('auth.enterPhone') // → "Enter your mobile number" or "अपना मोबाइल नंबर दर्ज करें"
```

### RTL Support (Future)

For Urdu/Arabic support:
```tsx
<html dir={language === 'ur' ? 'rtl' : 'ltr'}>
```

## ⚡ Performance Optimization

### Code Splitting

```typescript
// Lazy load routes
const EmployerDashboard = lazy(() => import('./pages/EmployerDashboard'));
const WorkerDashboard = lazy(() => import('./pages/WorkerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
```

### Image Optimization

- Use WebP format with fallback
- Lazy load images below fold
- Compress uploads on client-side
- CDN for static assets (future)

### Caching Strategy

```typescript
// React Query setup
{
  staleTime: 5 * 60 * 1000,      // 5 minutes
  cacheTime: 10 * 60 * 1000,     // 10 minutes
  refetchOnWindowFocus: false,
}
```

### Bundle Size

- Tree-shaking enabled (Vite default)
- Dynamic imports for routes
- Remove unused Tailwind classes (PurgeCSS)
- Target bundle size: <200KB initial

## 📊 Analytics & Monitoring (Future)

### Key Metrics to Track

1. **User Behavior**
   - Language preference distribution
   - Role selection ratio (employer/worker)
   - Average time to complete signup
   - OTP verification success rate

2. **Job Metrics**
   - Jobs posted per day
   - Job approval rate
   - Average applicants per job
   - Hire rate

3. **Application Metrics**
   - Applications per worker per day
   - Application view rate
   - Call received rate
   - Hire conversion rate

4. **Trust & Safety**
   - Verification rejection reasons
   - Reports filed per category
   - Ban/warn actions taken
   - Average moderation time

### Error Tracking

- Sentry for runtime errors
- Console errors in production
- API error rates
- OTP delivery failures

## 🔄 CI/CD Pipeline (Future)

```
Git Push
   ↓
GitHub Actions Trigger
   ↓
   ├─→ Run Linters (ESLint, Prettier)
   ├─→ Type Check (TypeScript)
   ├─→ Run Tests (Vitest)
   ├─→ Build (Vite)
   └─→ Deploy
       ├─→ Staging (Vercel/Netlify)
       └─→ Production (after approval)
```

## 🧪 Testing Strategy (Future)

### Unit Tests
- Utility functions (calculateDistance, formatSalary)
- State management (Zustand stores)
- Pure components

### Integration Tests
- Form submissions
- API mocking (MSW)
- Navigation flows

### E2E Tests
- Complete user flows (Playwright)
- Phone auth → signup → job post
- Worker apply → employer view

## 🔌 Third-Party Integrations (Future)

### SMS Gateway
- **Primary**: Twilio
- **Backup**: MSG91
- OTP expiry: 10 minutes
- Retry logic: 3 attempts

### Maps
- **Google Maps API**
  - Geocoding (address → lat/lon)
  - Reverse geocoding (lat/lon → address)
  - Distance matrix
- Rate limit: 2,500 requests/day (free tier)

### Storage
- **AWS S3 / Cloudinary**
  - Business proof documents
  - Worker photos
  - Voice recordings
- Max upload size: 2MB per file

### WhatsApp
- Deep linking: `https://wa.me/91${phone}?text=${message}`
- No API integration needed initially

---

**Version**: 1.0.0
**Last Updated**: December 2025
**Status**: MVP Phase
