# 🔥 Firebase Billing Error Fix

## Error: `auth/billing-not-enabled`

Firebase Phone Authentication requires the **Blaze Plan** (pay-as-you-go) because it uses Google Cloud services for SMS.

---

## ✅ Enable Firebase Blaze Plan (Still FREE for 10K verifications!)

### Step 1: Upgrade to Blaze Plan

1. Go to Firebase Console: https://console.firebase.google.com
2. Click your project: `local-job-portal-2369c`
3. Click ⚙️ (Settings gear) in left sidebar
4. Click **"Usage and billing"**
5. Click **"Modify plan"**
6. Select **"Blaze (Pay as you go)"**
7. Click **"Continue"**

### Step 2: Link Google Cloud Billing Account

1. Click **"Create a billing account"** or select existing one
2. Enter billing details (credit/debit card)
3. Click **"Confirm purchase"**

### Step 3: Set Budget Alerts (Optional but Recommended)

1. Still in **"Usage and billing"**
2. Scroll to **"Set a budget alert"**
3. Set budget to **$5/month** (very safe limit)
4. Enter your email for alerts
5. Click **"Continue"**

---

## 💰 Pricing Breakdown

### Phone Authentication (SMS):
- **First 10,000 verifications/month: FREE**
- After 10K: $0.06 per verification

### Example Usage:
- 100 users/day × 30 days = 3,000 verifications/month
- **Cost: $0** (within free tier)

### If You Hit 10K+:
- 15,000 verifications = 5,000 over limit
- 5,000 × $0.06 = **$3.00/month**

---

## 🛡️ Safety Tips

1. **Set budget alerts** to $5 or $10
2. **Monitor usage** in Firebase Console → Usage tab
3. **Use test phone numbers** for development (doesn't count toward quota)
4. **Firebase won't charge you** without explicit confirmation

---

## 📞 Alternative: Use Test Phone Numbers (FREE)

For testing, you can use Firebase test numbers (no SMS sent, no cost):

1. Firebase Console → Authentication → Sign-in method
2. Scroll to **"Phone numbers for testing"**
3. Add test numbers:
   - Phone: `+919876543210` → Code: `123456`
   - Phone: `+919999999999` → Code: `654321`

**Testing with these numbers:**
- No actual SMS sent
- No cost incurred
- Instant verification
- Perfect for development!

---

## ⚡ After Enabling Blaze Plan

Your app will work immediately:
1. Users enter real phone numbers
2. Firebase sends real SMS OTP
3. User verifies and logs in
4. 10,000 verifications/month FREE!

---

## ❌ If You Don't Want to Upgrade

You have two options:

### Option 1: Email OTP (100% FREE)
- Use Brevo email service (300 emails/day free)
- Users verify with email instead of phone
- No billing required

### Option 2: Keep Using Test Numbers Only
- Only works for the test numbers you configure
- Real users can't sign up
- Good for demos/testing only

---

## 🚀 Recommended: Upgrade to Blaze

**Why?**
- 10,000 FREE SMS/month is generous
- Production-ready
- Real users can sign up
- Set budget alerts for safety
- Most indie apps never exceed free tier
