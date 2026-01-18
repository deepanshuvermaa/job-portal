# 🚀 Final Deployment Checklist

## ✅ Fresh Build Created - Ready to Upload!

**Build Details:**
- **Location:** `local-jobs-platform/dist/`
- **Main JS File:** `index-Cntz5B1n.js` (655.86 kB)
- **API URL:** `https://job-portal-production-7fb3.up.railway.app` ✅
- **No localhost references** ✅
- **Build Date:** January 18, 2026

---

## 📤 cPanel Upload Instructions

### Step 1: Delete Old Files First (IMPORTANT!)

1. Go to cPanel → File Manager
2. Navigate to `public_html/local-job-portal/`
3. **Delete these folders:**
   - `assets/` (old cached files)
4. **Keep these files:**
   - `.htaccess` (if exists)
   - `robots.txt` (if exists)

### Step 2: Upload Fresh Build

1. On your computer, open: `C:\Users\Asus\Desktop\job-portal\local-jobs-platform\dist\`
2. Select **ALL files and folders** inside `dist/`:
   - `index.html`
   - `assets/` folder
   - `vite.svg`
   - Any other files
3. Upload to `public_html/local-job-portal/`
4. Overwrite when asked

### Step 3: Verify Upload

1. In cPanel File Manager, go to `public_html/local-job-portal/assets/`
2. **You should see:**
   - `index-Cntz5B1n.js` (655 KB) ← **NEW FILE**
   - `index-C4N5bsFQ.css` (31 KB)
   - `pdf-CEWM7r6c.js` (406 KB)
3. **You should NOT see:**
   - `index-DCExRdEV.js` ← **OLD FILE** (if present, delete it!)

### Step 4: Clear Browser Cache

After uploading:

**Windows:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Close and reopen browser

**Mac:**
1. Press `Cmd + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Close and reopen browser

### Step 5: Test in Incognito

1. Open Incognito/Private window
2. Go to: https://deepanshuverma.site/local-job-portal
3. Press F12 to open DevTools → Console
4. **You should see:**
   ```
   === API Configuration ===
   VITE_API_URL: https://job-portal-production-7fb3.up.railway.app
   API_BASE_URL: https://job-portal-production-7fb3.up.railway.app
   MOCK_MODE: false
   ========================
   ```
5. **The JS file should be:** `index-Cntz5B1n.js` (check Network tab)

---

## 🔥 Firebase Billing (Still Required)

After uploading, you'll still see this error:
```
Firebase: Error (auth/billing-not-enabled)
```

**Why?** Firebase Phone Auth requires Blaze Plan even though first 10K SMS are FREE.

**Fix:**
1. Go to: https://console.firebase.google.com/project/local-job-portal-2369c/usage
2. Click "Modify plan"
3. Select "Blaze (Pay as you go)"
4. Add billing info (credit/debit card)
5. Set budget alert to $5/month (optional but recommended)

**Pricing:**
- First 10,000 SMS/month: **$0.00**
- After 10K: $0.06 per SMS
- Most apps never hit 10K

---

## ✅ Backend Status (Already Done!)

Railway backend is **LIVE and WORKING:**
- ✅ Firebase initialized successfully
- ✅ Connected to Supabase
- ✅ Connected to Cloudinary
- ✅ All environment variables configured

**Railway URL:** https://job-portal-production-7fb3.up.railway.app

---

## 🎯 After Deployment Checklist

- [ ] Old files deleted from cPanel
- [ ] Fresh dist uploaded to cPanel
- [ ] `index-Cntz5B1n.js` visible in assets folder
- [ ] Browser cache cleared
- [ ] Tested in incognito mode
- [ ] Console shows Railway URL (not localhost)
- [ ] Firebase Blaze plan enabled
- [ ] Phone OTP test successful

---

## 🧪 Testing the App

### Test Phone Numbers (FREE - No SMS sent):
1. Enter: `9876543210`
2. OTP: `123456`
3. Should proceed to role selection

### Real Phone Numbers (Requires Blaze Plan):
1. Enter real Indian number: `98XXXXXXXX`
2. Firebase sends real SMS
3. Enter 6-digit OTP received
4. Should work perfectly!

---

## 🆘 Troubleshooting

### Still seeing localhost?
- Clear browser cache again
- Try different browser
- Check cPanel has correct files

### Firebase billing error?
- Enable Blaze plan (required for SMS)
- Check Firebase console for errors

### Network errors?
- Check Railway is still running
- Verify environment variables in Railway

---

## 📊 Summary

**Frontend:**
- Hosted on cPanel: https://deepanshuverma.site/local-job-portal
- Points to Railway backend

**Backend:**
- Hosted on Railway: https://job-portal-production-7fb3.up.railway.app
- Firebase ✅, Supabase ✅, Cloudinary ✅

**Authentication:**
- Firebase Phone Auth (requires Blaze plan)
- 10,000 FREE SMS/month

**Ready to go live!** 🚀
