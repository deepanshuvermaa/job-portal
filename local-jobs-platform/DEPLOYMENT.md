# Deployment Guide - LocalJobs Platform

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Frontend)

**Advantages:**
- Zero configuration for React/Vite projects
- Automatic SSL certificates
- Global CDN
- Free tier available
- CI/CD built-in

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd local-jobs-platform
   vercel
   ```

4. **Production Deployment**
   ```bash
   vercel --prod
   ```

**Configuration (vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

### Option 2: Netlify

**Steps:**

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

**Configuration (netlify.toml):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

---

### Option 3: AWS S3 + CloudFront

**Steps:**

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   - Enable static website hosting
   - Upload `dist` folder contents

3. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Enable HTTPS
   - Custom error page: `/index.html` (for 404)

4. **Configure DNS**
   - Point domain to CloudFront distribution

---

## 🔐 Environment Variables

Create `.env.production` file:

```env
# API Configuration
VITE_API_URL=https://api.localjobs.in
VITE_API_TIMEOUT=30000

# SMS Gateway
VITE_SMS_PROVIDER=twilio
VITE_TWILIO_ACCOUNT_SID=your_account_sid
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_PHONE_NUMBER=+919876543210

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key

# Storage (AWS S3 / Cloudinary)
VITE_STORAGE_PROVIDER=cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret

# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_FB_PIXEL_ID=YOUR_PIXEL_ID

# App Configuration
VITE_APP_NAME=LocalJobs
VITE_APP_URL=https://localjobs.in
VITE_SUPPORT_EMAIL=support@localjobs.in
VITE_SUPPORT_PHONE=+919876543210

# Feature Flags
VITE_ENABLE_VOICE_RECORDING=true
VITE_ENABLE_RESUME_OCR=true
VITE_ENABLE_WHATSAPP_INTEGRATION=true
VITE_MAX_FILE_SIZE_MB=5
VITE_MAX_VOICE_DURATION_SEC=30
```

---

## 🗄️ Backend Deployment (Node.js/Express API)

### Option 1: Railway

1. **Create `railway.json`**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run start",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. **Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

### Option 2: Heroku

1. **Create `Procfile`**
   ```
   web: npm run start
   ```

2. **Deploy**
   ```bash
   heroku create localjobs-api
   heroku addons:create heroku-postgresql:hobby-dev
   git push heroku main
   ```

### Option 3: AWS ECS / EC2

- Use Docker containers
- Auto-scaling based on load
- Application Load Balancer
- RDS for PostgreSQL

---

## 🗃️ Database Setup (PostgreSQL)

### Managed Services (Recommended)

1. **Neon (Serverless PostgreSQL)**
   - Free tier: 512MB storage
   - Auto-scaling
   - Point-in-time recovery

2. **Supabase**
   - Free tier: 500MB database
   - Built-in auth & storage
   - Real-time subscriptions

3. **AWS RDS**
   - Production-grade
   - Automated backups
   - Multi-AZ deployment

### Database Schema Migration

```bash
# Using Prisma
npx prisma migrate deploy

# Using Knex
npx knex migrate:latest

# Using raw SQL
psql -U postgres -d localjobs -f schema.sql
```

---

## 📱 SMS Gateway Setup

### Twilio

1. **Sign up**: https://www.twilio.com/try-twilio
2. **Get phone number** (Indian number recommended)
3. **Configure webhook** for OTP verification
4. **Pricing**: ~₹0.50 per SMS in India

### MSG91 (India-focused)

1. **Sign up**: https://msg91.com
2. **Verify sender ID**
3. **Get API key**
4. **Pricing**: ~₹0.15 per SMS

### 2Factor.in

1. **Sign up**: https://2factor.in
2. **India-specific**
3. **Pricing**: ~₹0.10 per SMS

---

## 🗺️ Google Maps API Setup

1. **Go to**: https://console.cloud.google.com/
2. **Create project**: "LocalJobs"
3. **Enable APIs**:
   - Maps JavaScript API
   - Geocoding API
   - Places API
   - Distance Matrix API
4. **Create credentials**: API Key
5. **Restrict key**:
   - HTTP referrers (websites): `*.localjobs.in/*`
   - APIs: Only enable required APIs
6. **Billing**: Enable with spending limit

---

## 📦 File Storage Setup

### Cloudinary (Recommended)

1. **Sign up**: https://cloudinary.com
2. **Free tier**: 25GB storage, 25GB bandwidth
3. **Auto-optimization** for images
4. **Transformation** API for resizing

**Configuration:**
```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

### AWS S3

1. **Create bucket**: `localjobs-uploads`
2. **Enable CORS**
3. **Configure lifecycle rules** (delete after 90 days for temp files)
4. **Set up IAM user** with limited permissions

---

## 🔒 Security Checklist

### Pre-Deployment

- [ ] All API keys in environment variables
- [ ] No hardcoded credentials in code
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS protection (React auto-escapes)
- [ ] CSRF tokens for sensitive operations

### SSL Certificate

- Use Let's Encrypt (free)
- Auto-renewal enabled
- HSTS header configured
- Redirect HTTP to HTTPS

### Database Security

- Strong password
- Restricted IP access
- Regular backups
- Encrypted connections
- Read replicas for scaling

---

## 📊 Monitoring & Analytics

### Application Monitoring

1. **Sentry** (Error tracking)
   ```bash
   npm install @sentry/react
   ```

   ```javascript
   import * as Sentry from "@sentry/react";

   Sentry.init({
     dsn: "your_sentry_dsn",
     environment: "production",
   });
   ```

2. **New Relic** (Performance monitoring)
3. **Datadog** (Infrastructure monitoring)

### Analytics

1. **Google Analytics 4**
   - Already integrated in `index.html`
   - Replace `G-XXXXXXXXXX` with your ID

2. **Meta Pixel**
   - Already integrated in `index.html`
   - Replace `YOUR_PIXEL_ID` with your ID

3. **Mixpanel** (Product analytics)
   ```bash
   npm install mixpanel-browser
   ```

---

## 🚦 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.MAPS_API_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🌐 Domain Configuration

### DNS Records

```
A Record:
  Name: @
  Value: [CloudFront IP / Vercel IP]
  TTL: 3600

CNAME:
  Name: www
  Value: localjobs.in
  TTL: 3600

MX Records (for email):
  Priority: 10
  Value: [Your email provider]
```

### SSL/TLS

- Use Vercel/Netlify automatic SSL
- Or Let's Encrypt with Certbot
- Force HTTPS redirect
- Enable HSTS

---

## 📱 PWA Configuration

Create `public/manifest.json`:

```json
{
  "name": "LocalJobs - Find Jobs Near You",
  "short_name": "LocalJobs",
  "description": "Hyperlocal job marketplace for India",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0ea5e9",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🧪 Pre-Launch Checklist

### Testing

- [ ] Test all user flows (employer, worker, admin)
- [ ] Test on multiple devices (mobile, tablet, desktop)
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)
- [ ] Test in Hindi and English languages
- [ ] Test file uploads (image, PDF, resume)
- [ ] Test voice recording
- [ ] Load testing (1000+ concurrent users)
- [ ] Security audit (OWASP Top 10)

### Performance

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading

### SEO

- [ ] Sitemap.xml generated
- [ ] Robots.txt configured
- [ ] Meta tags on all pages
- [ ] Schema.org markup
- [ ] Google Search Console verified
- [ ] Bing Webmaster Tools verified

### Legal

- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] GDPR compliance (if applicable)
- [ ] Contact information

---

## 📞 Post-Deployment

1. **Monitor errors** (Sentry)
2. **Check analytics** (GA4)
3. **Test all features** in production
4. **Set up alerts** (Uptime monitoring)
5. **Create backups** (Database, files)
6. **Document** any issues

---

## 🆘 Rollback Plan

If something goes wrong:

1. **Vercel**: Revert to previous deployment
   ```bash
   vercel rollback
   ```

2. **Database**: Restore from backup
   ```bash
   pg_restore -U postgres -d localjobs backup.dump
   ```

3. **Files**: Restore from S3 versioning

---

## 📱 Scaling Strategy

### Phase 1: 0-10K users
- Single server
- Shared database
- Cloudinary for files

### Phase 2: 10K-100K users
- Load balancer
- Database read replicas
- Redis for caching
- CDN for static assets

### Phase 3: 100K+ users
- Multi-region deployment
- Database sharding
- Microservices architecture
- Kubernetes for orchestration

---

**Need help? Contact: support@localjobs.in**
