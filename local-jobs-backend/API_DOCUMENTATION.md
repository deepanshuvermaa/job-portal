# API Documentation
## Hyperlocal Job Marketplace Backend

Base URL: `http://localhost:5000` (development)
Production: `https://your-app.up.railway.app`

---

## 📝 **AUTHENTICATION**

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 **AUTH ENDPOINTS**

### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "purpose": "registration"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent successfully"
  }
}
```

---

### Register Worker
```http
POST /api/auth/register/worker
Content-Type: application/json

{
  "phone": "9876543210",
  "password": "SecurePass123!",
  "full_name": "Rajesh Kumar",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "9876543210",
      "role": "worker"
    },
    "tokens": {
      "accessToken": "eyJxxx...",
      "refreshToken": "eyJxxx..."
    }
  }
}
```

---

### Register Employer
```http
POST /api/auth/register/employer
Content-Type: application/json

{
  "phone": "9876543210",
  "password": "SecurePass123!",
  "business_name": "ABC Construction",
  "otp": "123456"
}
```

---

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "9876543210",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "9876543210",
      "role": "worker",
      "is_verified": false
    },
    "tokens": {
      "accessToken": "eyJxxx...",
      "refreshToken": "eyJxxx..."
    }
  }
}
```

---

### Admin Login
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "password": "admin123"
}
```

---

## 👷 **WORKER ENDPOINTS**

### Get Worker Profile
```http
GET /api/workers/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "full_name": "Rajesh Kumar",
    "city": "Indore",
    "skills": ["construction", "plumbing"],
    "experience_years": 5,
    "verification_status": "pending",
    "average_rating": 0,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Update Worker Profile
```http
PUT /api/workers/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "city": "Indore",
  "state": "Madhya Pradesh",
  "skills": ["construction", "plumbing", "electrical"],
  "experience_years": 5,
  "bio": "Experienced construction worker"
}
```

---

### Upload Document
```http
POST /api/workers/upload-document
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
  document: <file>
  documentType: "aadhaar_front" | "aadhaar_back" | "photo" | "resume"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/xxx/image/upload/xxx.jpg",
    "ocrData": {
      "aadhaarNumber": "123456789012",
      "name": "RAJESH KUMAR",
      "confidence": 85,
      "documentType": "aadhaar"
    }
  }
}
```

---

### Search Jobs
```http
GET /api/workers/jobs/search?city=Indore&jobType=construction&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Construction Worker Needed",
      "description": "Looking for experienced construction workers",
      "job_type": "construction",
      "employment_type": "full-time",
      "city": "Indore",
      "salary_min": 15000,
      "salary_max": 25000,
      "employer_profiles": {
        "business_name": "ABC Construction",
        "average_rating": 4.5
      },
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

### Apply to Job
```http
POST /api/workers/jobs/{jobId}/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "cover_letter": "I have 5 years of experience in construction...",
  "expected_salary": 20000
}
```

---

### Get Worker Applications
```http
GET /api/workers/applications
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "pending",
      "cover_letter": "...",
      "applied_at": "2024-01-01T00:00:00.000Z",
      "jobs": {
        "title": "Construction Worker",
        "city": "Indore"
      },
      "employer_profiles": {
        "business_name": "ABC Construction"
      }
    }
  ]
}
```

---

## 🏢 **EMPLOYER ENDPOINTS**

### Get Employer Profile
```http
GET /api/employers/profile
Authorization: Bearer <token>
```

---

### Update Employer Profile
```http
PUT /api/employers/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "business_name": "ABC Construction",
  "business_type": "company",
  "city": "Indore",
  "description": "Leading construction company in MP",
  "industry": "construction"
}
```

---

### Create Job
```http
POST /api/employers/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Construction Worker Needed",
  "description": "Looking for experienced construction workers for new project",
  "job_type": "construction",
  "employment_type": "full-time",
  "location": "Vijay Nagar, Indore",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "pincode": "452010",
  "salary_min": 15000,
  "salary_max": 25000,
  "salary_type": "monthly",
  "required_skills": ["construction", "brick laying"],
  "experience_required": 2,
  "vacancies": 5,
  "working_hours": "8 AM - 5 PM",
  "contact_phone": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Construction Worker Needed",
    "status": "open",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get Employer Jobs
```http
GET /api/employers/jobs
Authorization: Bearer <token>
```

---

### Get Applications for Job
```http
GET /api/employers/jobs/{jobId}/applications
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "pending",
      "cover_letter": "...",
      "expected_salary": 20000,
      "applied_at": "2024-01-01T00:00:00.000Z",
      "worker_profiles": {
        "full_name": "Rajesh Kumar",
        "city": "Indore",
        "skills": ["construction", "plumbing"],
        "experience_years": 5,
        "average_rating": 4.5,
        "photo_url": "...",
        "resume_url": "..."
      }
    }
  ]
}
```

---

### Update Application Status
```http
PUT /api/employers/applications/{applicationId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shortlisted",  // "pending" | "shortlisted" | "rejected" | "hired"
  "employer_notes": "Good candidate, schedule interview"
}
```

---

## 👨‍💼 **ADMIN ENDPOINTS**

### Get Dashboard Stats
```http
GET /api/admin/dashboard
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalWorkers": 150,
    "totalEmployers": 50,
    "totalJobs": 200,
    "totalApplications": 500,
    "pendingVerifications": 10
  }
}
```

---

### Get Pending Verifications
```http
GET /api/admin/pending-verifications
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workers": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "full_name": "Rajesh Kumar",
        "aadhaar_front_url": "...",
        "aadhaar_back_url": "...",
        "aadhaar_number": "123456789012",
        "verification_status": "pending",
        "users": {
          "phone": "9876543210",
          "email": "rajesh@example.com"
        }
      }
    ],
    "employers": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "business_name": "ABC Construction",
        "gst_certificate_url": "...",
        "gst_number": "...",
        "verification_status": "pending"
      }
    ]
  }
}
```

---

### Approve/Reject Worker
```http
PUT /api/admin/workers/{userId}/verify
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "approved",  // "approved" | "rejected"
  "rejection_reason": "Aadhaar document not clear"  // Required if rejected
}
```

---

### Approve/Reject Employer
```http
PUT /api/admin/employers/{userId}/verify
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "approved",
  "rejection_reason": ""
}
```

---

## 📊 **COMMON RESPONSE FORMATS**

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here",
  "errors": [ /* validation errors array */ ]
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 🚨 **ERROR CODES**

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/expired token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🧪 **TESTING WITH POSTMAN/THUNDER CLIENT**

### 1. Import Collection
Save this as `job-platform.postman_collection.json`:

```json
{
  "info": {
    "name": "Job Platform API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

### 2. Set Environment Variables
- `baseUrl`: `http://localhost:5000` or production URL
- `token`: JWT token from login response

### 3. Test Flow
1. Send OTP → Get 6-digit code
2. Register Worker/Employer → Get tokens
3. Copy `accessToken` to `{{token}}` variable
4. Test protected endpoints

---

## 📱 **WEBSOCKET/REAL-TIME (Future Enhancement)**

Currently using polling for notifications. For real-time, consider:
- Supabase Realtime subscriptions
- Socket.io integration
- Server-Sent Events (SSE)

---

## 🔒 **SECURITY BEST PRACTICES**

1. **Always use HTTPS** in production
2. **Never expose service role key** in frontend
3. **Validate all inputs** on backend
4. **Use rate limiting** for auth endpoints
5. **Implement refresh token rotation**
6. **Log all admin actions**
7. **Regular security audits**

---

**📚 For more details, check README.md and DEPLOYMENT_GUIDE.md**
