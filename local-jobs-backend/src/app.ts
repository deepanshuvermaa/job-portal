import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { supabase } from './config/supabase';
import { JWTUtil } from './utils/jwt';
import ApiResponseUtil from './utils/response';
import { authenticate, authorize } from './middlewares/auth.middleware';
import { upload } from './middlewares/upload.middleware';
import { generateOTP, hashOTP, validatePhone } from './utils/helpers';
import { SMSService } from './services/sms.service';
import { UploadService } from './services/upload.service';
import { OCRService } from './services/ocr.service';
import { NotificationService } from './services/notification.service';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: [config.FRONTEND_URL, 'http://localhost:5173'],
  credentials: true
}));
app.use(rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  ApiResponseUtil.success(res, { status: 'OK', timestamp: new Date().toISOString() });
});

// ===================
// AUTH ROUTES
// ===================

// Send OTP
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone, purpose } = req.body;

    if (!phone || !validatePhone(phone)) {
      return ApiResponseUtil.error(res, 'Invalid phone number');
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP to database
    const { error } = await supabase.from('otp_verifications').insert({
      phone,
      otp_hash: otpHash,
      purpose: purpose || 'registration',
      expires_at: expiresAt.toISOString(),
    });

    if (error) throw error;

    // Send SMS
    await SMSService.sendOTP(phone, otp);

    // In development mode, return OTP in response for testing
    const response: any = { message: 'OTP sent successfully' };
    if (config.NODE_ENV === 'development') {
      response.otp = otp;
      response.devMode = true;
    }

    return ApiResponseUtil.success(res, response);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to send OTP');
  }
});

// Verify OTP (login or proceed to signup)
app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phone, otp, purpose } = req.body;

    if (!phone || !otp) {
      return ApiResponseUtil.error(res, 'Phone and OTP are required');
    }

    const otpHash = hashOTP(otp);

    const { data: otpData, error: otpError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone', phone)
      .eq('otp_hash', otpHash)
      .eq('is_verified', false)
      .eq('purpose', purpose || 'registration')
      .single();

    if (otpError || !otpData) {
      return ApiResponseUtil.error(res, 'Invalid or expired OTP');
    }

    if (new Date(otpData.expires_at) < new Date()) {
      return ApiResponseUtil.error(res, 'OTP expired');
    }

    await supabase
      .from('otp_verifications')
      .update({ is_verified: true })
      .eq('id', otpData.id);

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (!user) {
      return ApiResponseUtil.success(res, { verified: true, signupRequired: true });
    }

    const tokens = JWTUtil.generateTokens(user.id, user.role);
    return ApiResponseUtil.success(res, { user, tokens, verified: true, signupRequired: false });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to verify OTP');
  }
});

// Get current user
app.get('/api/auth/me', authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role === 'admin') {
      return ApiResponseUtil.success(res, {
        id: req.user.userId,
        role: 'admin',
        phone: '',
        email: null,
        is_verified: true,
        is_active: true,
        language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user!.userId)
      .single();

    if (!user) {
      return ApiResponseUtil.notFound(res, 'User not found');
    }

    return ApiResponseUtil.success(res, user);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to fetch user');
  }
});

// Register Worker
app.post('/api/auth/register/worker', async (req: Request, res: Response) => {
  try {
    const {
      phone,
      password,
      full_name,
      city,
      state,
      pincode,
      address,
      skills,
      experience_years,
      preferred_job_types,
      preferred_locations,
      bio,
      otp,
    } = req.body;

    if (!phone || !password || !full_name) {
      return ApiResponseUtil.error(res, 'Missing required fields');
    }

    // Verify OTP (either verified already or verify now)
    if (otp) {
      const otpHash = hashOTP(otp);
      const { data: otpData } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone', phone)
        .eq('otp_hash', otpHash)
        .eq('is_verified', false)
        .single();

      if (!otpData || new Date(otpData.expires_at) < new Date()) {
        return ApiResponseUtil.error(res, 'Invalid or expired OTP');
      }

      await supabase
        .from('otp_verifications')
        .update({ is_verified: true })
        .eq('id', otpData.id);
    } else {
      const { data: verifiedOtp } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone', phone)
        .eq('is_verified', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!verifiedOtp || new Date(verifiedOtp.expires_at) < new Date()) {
        return ApiResponseUtil.error(res, 'OTP verification required');
      }
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      return ApiResponseUtil.error(res, 'User already exists');
    }

    

    // Create user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      phone: `+91${phone}`,
      password: password,
      user_metadata: { role: 'worker' }
    });

    if (authError) throw authError;

    // Create user record
    const { error: userError } = await supabase.from('users').insert({
      id: authData.user.id,
      phone,
      role: 'worker',
      is_verified: false
    });

    if (userError) throw userError;

    // Create worker profile
    await supabase.from('worker_profiles').insert({
      user_id: authData.user.id,
      full_name,
      city,
      state,
      pincode,
      address,
      skills: skills || [],
      experience_years: experience_years || 0,
      preferred_job_types: preferred_job_types || [],
      preferred_locations: preferred_locations || [],
      bio,
    });

    // Generate tokens
    const tokens = JWTUtil.generateTokens(authData.user.id, 'worker');

    return ApiResponseUtil.created(res, { user: authData.user, tokens });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Registration failed');
  }
});

// Register Employer
app.post('/api/auth/register/employer', async (req: Request, res: Response) => {
  try {
    const {
      phone,
      password,
      business_name,
      business_type,
      city,
      state,
      pincode,
      address,
      gst_number,
      pan_number,
      description,
      industry,
      employee_count,
      otp,
    } = req.body;

    if (!phone || !password || !business_name) {
      return ApiResponseUtil.error(res, 'Missing required fields');
    }

    // Verify OTP (either verified already or verify now)
    if (otp) {
      const otpHash = hashOTP(otp);
      const { data: otpData } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone', phone)
        .eq('otp_hash', otpHash)
        .eq('is_verified', false)
        .single();

      if (!otpData || new Date(otpData.expires_at) < new Date()) {
        return ApiResponseUtil.error(res, 'Invalid or expired OTP');
      }

      await supabase
        .from('otp_verifications')
        .update({ is_verified: true })
        .eq('id', otpData.id);
    } else {
      const { data: verifiedOtp } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone', phone)
        .eq('is_verified', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!verifiedOtp || new Date(verifiedOtp.expires_at) < new Date()) {
        return ApiResponseUtil.error(res, 'OTP verification required');
      }
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      return ApiResponseUtil.error(res, 'User already exists');
    }

    // Create user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      phone: `+91${phone}`,
      password: password,
      user_metadata: { role: 'employer' }
    });

    if (authError) throw authError;

    // Create user record
    await supabase.from('users').insert({
      id: authData.user.id,
      phone,
      role: 'employer',
      is_verified: false
    });

    // Create employer profile
    await supabase.from('employer_profiles').insert({
      user_id: authData.user.id,
      business_name,
      business_type,
      city,
      state,
      pincode,
      address,
      gst_number,
      pan_number,
      description,
      industry,
      employee_count,
    });

    // Generate tokens
    const tokens = JWTUtil.generateTokens(authData.user.id, 'employer');

    return ApiResponseUtil.created(res, { user: authData.user, tokens });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Registration failed');
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (!user) {
      return ApiResponseUtil.error(res, 'Invalid credentials');
    }

    // Sign in via Supabase Auth
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      phone: `+91${phone}`,
      password
    });

    if (error) {
      return ApiResponseUtil.error(res, 'Invalid credentials');
    }

    // Generate tokens
    const tokens = JWTUtil.generateTokens(user.id, user.role);

    return ApiResponseUtil.success(res, { user, tokens });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Login failed');
  }
});

// Admin Login
app.post('/api/auth/admin/login', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (password !== config.ADMIN_PASSWORD) {
      return ApiResponseUtil.unauthorized(res, 'Invalid admin credentials');
    }

    // Generate admin token (using fixed admin ID)
    const tokens = JWTUtil.generateTokens('admin-user-id', 'admin');

    return ApiResponseUtil.success(res, { tokens, role: 'admin' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Login failed');
  }
});

// ===================
// WORKER ROUTES
// ===================

// Get Worker Profile
app.get('/api/workers/profile', authenticate, authorize('worker'), async (req: Request, res: Response) => {
  try {
    const { data } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('user_id', req.user!.userId)
      .single();

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Update Worker Profile
app.put('/api/workers/profile', authenticate, authorize('worker'), async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('worker_profiles')
      .update(req.body)
      .eq('user_id', req.user!.userId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Profile updated' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Upload Document
app.post('/api/workers/upload-document',
  authenticate,
  authorize('worker'),
  upload.single('document'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return ApiResponseUtil.error(res, 'No file uploaded');
      }

      const { documentType } = req.body; // 'aadhaar_front', 'aadhaar_back', 'photo', 'resume'

      // Upload to Cloudinary
      const result = await UploadService.uploadImage(
        req.file.buffer,
        `workers/${req.user!.userId}`,
        `${documentType}-${Date.now()}`
      );

      // Process OCR if aadhaar
      let ocrData = null;
      if (documentType === 'aadhaar_front') {
        ocrData = await OCRService.processDocument(req.file.buffer);
      }

      // Update profile
      const updateData: any = {
        [`${documentType}_url`]: result.secure_url
      };

      if (ocrData) {
        updateData.aadhaar_number = ocrData.aadhaarNumber;
        updateData.aadhaar_name = ocrData.name;
        updateData.ocr_confidence = ocrData.confidence;
        updateData.ocr_verified = ocrData.confidence > 80;
      }

      await supabase
        .from('worker_profiles')
        .update(updateData)
        .eq('user_id', req.user!.userId);

      return ApiResponseUtil.success(res, { url: result.secure_url, ocrData });
    } catch (error: any) {
      return ApiResponseUtil.error(res, error.message);
    }
  }
);

// Upload Employer Document
app.post('/api/employers/upload-document',
  authenticate,
  authorize('employer'),
  upload.single('document'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return ApiResponseUtil.error(res, 'No file uploaded');
      }

      const { documentType } = req.body; // 'gst_certificate', 'business_license', 'pan_card'

      const result = await UploadService.uploadImage(
        req.file.buffer,
        `employers/${req.user!.userId}`,
        `${documentType}-${Date.now()}`
      );

      const updateData: any = {};
      if (documentType === 'gst_certificate') updateData.gst_certificate_url = result.secure_url;
      if (documentType === 'business_license') updateData.business_license_url = result.secure_url;
      if (documentType === 'pan_card') updateData.pan_card_url = result.secure_url;

      await supabase
        .from('employer_profiles')
        .update(updateData)
        .eq('user_id', req.user!.userId);

      return ApiResponseUtil.success(res, { url: result.secure_url });
    } catch (error: any) {
      return ApiResponseUtil.error(res, error.message);
    }
  }
);

// Search Jobs
app.get('/api/workers/jobs/search', async (req: Request, res: Response) => {
  try {
    const { city, jobType, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('jobs')
      .select('*, employer_profiles!inner(business_name, average_rating)')
      .eq('status', 'open');

    if (city) query = query.eq('city', city);
    if (jobType) query = query.eq('job_type', jobType);

    const { data, error, count } = await query
      .range((+page - 1) * +limit, +page * +limit - 1);

    if (error) throw error;

    return ApiResponseUtil.paginated(res, data || [], +page, +limit, count || 0);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Apply to Job
app.post('/api/workers/jobs/:jobId/apply', authenticate, authorize('worker'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { cover_letter, expected_salary } = req.body;

    const { error } = await supabase.from('applications').insert({
      job_id: jobId,
      worker_id: req.user!.userId,
      cover_letter,
      expected_salary
    });

    if (error) throw error;

    return ApiResponseUtil.created(res, { message: 'Application submitted' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Get Worker Applications
app.get('/api/workers/applications', authenticate, authorize('worker'), async (req: Request, res: Response) => {
  try {
    const { data } = await supabase
      .from('applications')
      .select('*, jobs(*), employer_profiles!jobs(business_name)')
      .eq('worker_id', req.user!.userId)
      .order('applied_at', { ascending: false });

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// ===================
// EMPLOYER ROUTES
// ===================

// Get Employer Profile
app.get('/api/employers/profile', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { data } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', req.user!.userId)
      .single();

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Update Employer Profile
app.put('/api/employers/profile', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('employer_profiles')
      .update(req.body)
      .eq('user_id', req.user!.userId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Profile updated' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Create Job
app.post('/api/employers/jobs', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const jobData = {
      ...req.body,
      employer_id: req.user!.userId,
      status: 'draft'
    };

    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) throw error;

    return ApiResponseUtil.created(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Get Employer Jobs
app.get('/api/employers/jobs', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', req.user!.userId)
      .order('created_at', { ascending: false });

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Get Applications for Job
app.get('/api/employers/jobs/:jobId/applications', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const { data } = await supabase
      .from('applications')
      .select('*, worker_profiles!inner(*)')
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Update Application Status
app.put('/api/employers/applications/:applicationId', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { status, employer_notes } = req.body;

    const { error } = await supabase
      .from('applications')
      .update({ status, employer_notes, status_updated_at: new Date().toISOString() })
      .eq('id', applicationId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Application updated' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// ===================
// ADMIN ROUTES
// ===================

// Get Pending Verifications
app.get('/api/admin/pending-verifications', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { data: workers } = await supabase
      .from('worker_profiles')
      .select('*, users!inner(*)')
      .eq('verification_status', 'pending');

    const { data: employers } = await supabase
      .from('employer_profiles')
      .select('*, users!inner(*)')
      .eq('verification_status', 'pending');

    return ApiResponseUtil.success(res, { workers, employers });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Approve/Reject Worker
app.put('/api/admin/workers/:userId/verify', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, rejection_reason } = req.body;

    const { error } = await supabase
      .from('worker_profiles')
      .update({
        verification_status: status,
        verified_at: new Date().toISOString(),
        rejection_reason: rejection_reason || null
      })
      .eq('user_id', userId);

    if (error) throw error;

    // Update user is_verified
    await supabase
      .from('users')
      .update({ is_verified: status === 'approved' })
      .eq('id', userId);

    return ApiResponseUtil.success(res, { message: `Worker ${status}` });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Approve/Reject Employer
app.put('/api/admin/employers/:userId/verify', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, rejection_reason } = req.body;

    const { error } = await supabase
      .from('employer_profiles')
      .update({
        verification_status: status,
        verified_at: new Date().toISOString(),
        rejection_reason: rejection_reason || null
      })
      .eq('user_id', userId);

    if (error) throw error;

    await supabase
      .from('users')
      .update({ is_verified: status === 'approved' })
      .eq('id', userId);

    return ApiResponseUtil.success(res, { message: `Employer ${status}` });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Get Dashboard Stats
app.get('/api/admin/dashboard', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { count: totalWorkers } = await supabase.from('worker_profiles').select('*', { count: 'exact', head: true });
    const { count: totalEmployers } = await supabase.from('employer_profiles').select('*', { count: 'exact', head: true });
    const { count: totalJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
    const { count: totalApplications } = await supabase.from('applications').select('*', { count: 'exact', head: true });
    const { count: pendingVerifications } = await supabase
      .from('worker_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'pending');

    return ApiResponseUtil.success(res, {
      totalWorkers,
      totalEmployers,
      totalJobs,
      totalApplications,
      pendingVerifications
    });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Pending Job Approvals
app.get('/api/admin/jobs/pending', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { data } = await supabase
      .from('jobs')
      .select('*, employer_profiles!inner(business_name)')
      .eq('status', 'draft')
      .order('created_at', { ascending: false });

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Approve Job
app.put('/api/admin/jobs/:jobId/approve', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { error } = await supabase
      .from('jobs')
      .update({ status: 'open' })
      .eq('id', jobId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Job approved' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Reject Job
app.put('/api/admin/jobs/:jobId/reject', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { error } = await supabase
      .from('jobs')
      .update({ status: 'cancelled' })
      .eq('id', jobId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Job rejected' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// ===================
// PUBLIC JOB ROUTES
// ===================

app.get('/api/jobs/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { data, error } = await supabase
      .from('jobs')
      .select('*, employer_profiles!inner(business_name, average_rating)')
      .eq('id', jobId)
      .single();

    if (error) throw error;

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// ===================
// NOTIFICATION ROUTES
// ===================

app.get('/api/notifications', authenticate, async (req: Request, res: Response) => {
  try {
    const notifications = await NotificationService.getUserNotifications(req.user!.userId, 50);
    return ApiResponseUtil.success(res, notifications);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

app.put('/api/notifications/:notificationId/read', authenticate, async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const success = await NotificationService.markAsRead(notificationId);
    return ApiResponseUtil.success(res, { success });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

app.put('/api/notifications/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    const success = await NotificationService.markAllAsRead(req.user!.userId);
    return ApiResponseUtil.success(res, { success });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Error handling
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  return ApiResponseUtil.serverError(res, err.message);
});

export default app;










