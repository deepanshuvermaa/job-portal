# Local Job Portal - Deployment Guide

## 🚀 Deployment Instructions

This guide covers deploying the Local Job Portal to **http://deepanshuverma.site/local-job-portal**

---

## 📋 Prerequisites

### Required Services
1. **Supabase Account** (Free tier works)
   - Database for data storage
   - Authentication service
   - Get credentials from: https://supabase.com/dashboard

2. **Cloudinary Account** (Free tier works)
   - For image/document uploads
   - Get credentials from: https://cloudinary.com/console

3. **MSG91 Account** (For production SMS)
   - For OTP SMS in production
   - Get credentials from: https://msg91.com/
   - ⚠️ Not required for testing (dev mode works without it)

4. **Server Access**
   - Access to http://deepanshuverma.site
   - Node.js 18+ installed
   - PM2 or similar process manager
   - Nginx or Apache for reverse proxy

---

## 🗄️ Database Setup

### Step 1: Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Name: `local-jobs-portal`
   - Database Password: (save this!)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### Step 2: Run Database Schema
1. In Supabase Dashboard, go to "SQL Editor"
2. Open the file: `local-jobs-backend/SUPABASE_SCHEMA.sql`
3. Copy all contents
4. Paste into SQL Editor
5. Click "Run"
6. Verify tables are created in "Table Editor"

### Step 3: Get Supabase Credentials
1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long key)
   - **service_role key**: `eyJhbGc...` (different long key)

---

## ⚙️ Backend Configuration

### Step 1: Update Environment Variables
Edit `local-jobs-backend/.env`:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://deepanshuverma.site/local-job-portal

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# JWT Secret (Generate new ones for production!)
# Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-generated-secret-here
JWT_REFRESH_SECRET=your-generated-refresh-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# MSG91 Configuration (Leave default for testing)
MSG91_AUTH_KEY=your-msg91-auth-key
MSG91_SENDER_ID=JOBAPP
MSG91_TEMPLATE_ID=your-template-id

# Admin Credentials (CHANGE IN PRODUCTION!)
ADMIN_PASSWORD=admin123

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 2: Generate JWT Secrets
Run this command to generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run it twice and use the outputs for `JWT_SECRET` and `JWT_REFRESH_SECRET`

### Step 3: Setup Cloudinary
1. Go to https://cloudinary.com/console
2. Sign up / Login
3. Copy from Dashboard:
   - Cloud Name
   - API Key
   - API Secret
4. Update `.env` with these values

### Step 4: Install Dependencies
```bash
cd local-jobs-backend
npm install
```

### Step 5: Build Backend
```bash
npm run build
```

### Step 6: Test Backend Locally
```bash
npm run dev
```
Visit: http://localhost:5000/health
Should return: `{"status":"OK","timestamp":"..."}`

---

## 🎨 Frontend Configuration

### Step 1: Update Environment Variables
Edit `local-jobs-platform/.env`:

```bash
VITE_API_URL=http://deepanshuverma.site/local-job-portal/api
VITE_SITE_URL=http://deepanshuverma.site/local-job-portal
VITE_MOCK_MODE=false
```

### Step 2: Install Dependencies
```bash
cd local-jobs-platform
npm install
```

### Step 3: Build Frontend
```bash
npm run build
```

This creates a `dist` folder with production-ready files.

---

## 🌐 Server Deployment

### Option 1: Deploy with PM2 (Recommended)

#### Install PM2
```bash
npm install -g pm2
```

#### Start Backend
```bash
cd local-jobs-backend
pm2 start npm --name "job-portal-api" -- start
pm2 save
pm2 startup
```

#### Verify Backend is Running
```bash
pm2 status
pm2 logs job-portal-api
```

### Option 2: Deploy with systemd

Create `/etc/systemd/system/job-portal-api.service`:
```ini
[Unit]
Description=Job Portal API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/local-jobs-backend
ExecStart=/usr/bin/node dist/server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl enable job-portal-api
sudo systemctl start job-portal-api
sudo systemctl status job-portal-api
```

---

## 🔧 Nginx Configuration

### Setup Reverse Proxy and Static Files

Create `/etc/nginx/sites-available/job-portal`:

```nginx
server {
    listen 80;
    server_name deepanshuverma.site;

    # Frontend Static Files
    location /local-job-portal {
        alias /path/to/local-jobs-platform/dist;
        try_files $uri $uri/ /local-job-portal/index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /local-job-portal/api {
        rewrite ^/local-job-portal/api/(.*) /api/$1 break;
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable Site and Restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/job-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔐 SSL Certificate (Optional but Recommended)

### Using Let's Encrypt
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d deepanshuverma.site
```

This will:
- Obtain SSL certificate
- Auto-configure Nginx
- Set up auto-renewal

---

## 🧪 Testing Deployment

### 1. Check Backend Health
```bash
curl http://deepanshuverma.site/local-job-portal/api/health
```
Expected: `{"status":"OK",...}`

### 2. Check Frontend
Visit: http://deepanshuverma.site/local-job-portal
Should see: Language selection page

### 3. Test OTP Flow
1. Go through phone auth
2. OTP should display on screen (dev mode)
3. Check backend logs: `pm2 logs job-portal-api`

### 4. Test Admin Panel
1. Visit: http://deepanshuverma.site/local-job-portal/admin/login
2. Enter password: `admin123`
3. Should see admin dashboard

---

## 📊 Monitoring

### Check Backend Logs
```bash
pm2 logs job-portal-api
pm2 logs job-portal-api --lines 100
```

### Monitor Backend Status
```bash
pm2 status
pm2 monit
```

### Check Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Update Deployment

### Update Backend
```bash
cd local-jobs-backend
git pull  # or update files manually
npm install
npm run build
pm2 restart job-portal-api
```

### Update Frontend
```bash
cd local-jobs-platform
git pull  # or update files manually
npm install
npm run build
# Files in dist/ are automatically served by Nginx
```

---

## 🚨 Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs job-portal-api --lines 50

# Check if port 5000 is in use
sudo netstat -tlnp | grep 5000

# Restart backend
pm2 restart job-portal-api
```

### Frontend showing blank page
```bash
# Check Nginx config
sudo nginx -t

# Check if files exist
ls -la /path/to/local-jobs-platform/dist

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### API requests failing
```bash
# Check CORS settings in backend
# Verify FRONTEND_URL in .env matches your domain

# Check Nginx proxy settings
sudo nginx -t
```

### Database connection errors
```bash
# Verify Supabase credentials in .env
# Check if Supabase project is active
# Test connection manually
```

---

## 🔒 Production Checklist

Before going live:

- [ ] Change `ADMIN_PASSWORD` in backend `.env`
- [ ] Generate new `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Set `NODE_ENV=production` in backend `.env`
- [ ] Setup MSG91 account and add credentials
- [ ] Remove OTP display from frontend (automatically hidden in production)
- [ ] Setup SSL certificate
- [ ] Configure firewall rules
- [ ] Setup regular database backups (Supabase has auto-backup)
- [ ] Test all flows in production
- [ ] Setup monitoring (PM2 plus, UptimeRobot, etc.)

---

## 📦 File Structure on Server

```
/var/www/job-portal/
├── local-jobs-backend/
│   ├── dist/              # Compiled TypeScript
│   ├── src/               # Source code
│   ├── .env               # Backend config
│   └── package.json
│
└── local-jobs-platform/
    ├── dist/              # Built frontend (served by Nginx)
    ├── src/               # Source code
    ├── .env               # Frontend config
    └── package.json
```

---

## 🎯 Quick Deploy Script

Create `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying Job Portal..."

# Update backend
cd /path/to/local-jobs-backend
git pull
npm install
npm run build
pm2 restart job-portal-api

# Update frontend
cd /path/to/local-jobs-platform
git pull
npm install
npm run build

echo "✅ Deployment complete!"
echo "Visit: http://deepanshuverma.site/local-job-portal"
```

Make executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📞 Support & Maintenance

### Regular Maintenance
- Check PM2 status daily: `pm2 status`
- Review logs weekly: `pm2 logs --lines 1000 > logs.txt`
- Update dependencies monthly: `npm update`
- Backup database (Supabase auto-backups)

### Performance Optimization
- Enable Nginx gzip compression
- Setup CDN for static assets
- Configure PM2 cluster mode for load balancing
- Setup Redis for caching (future enhancement)

---

**Deployment Complete! 🎉**

For testing instructions, see `TESTING_GUIDE.md`
