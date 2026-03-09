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
import { initializeFirebase } from './services/firebase.service';
import firebaseAuthRouter from './routes/firebase-auth';
import connectionsRouter from './routes/connections';

const app: Express = express();

// Initialize Firebase
try {
  initializeFirebase();
} catch (error) {
  console.warn('⚠️ Firebase initialization failed. Firebase auth will not be available.');
}

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: [
    config.FRONTEND_URL,
    'http://localhost:5173',
    'https://deepanshuverma.site',
    'https://www.deepanshuverma.site'
  ],
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

// Firebase Authentication
app.use('/api/firebase-auth', firebaseAuthRouter);

// Connections (admin-moderated contact sharing)
app.use('/api/connections', connectionsRouter);

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

// Forgot Password - Reset via OTP
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      return ApiResponseUtil.error(res, 'Missing required fields');
    }

    // Verify OTP
    const otpHash = hashOTP(otp);
    const { data: otpData } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone', phone)
      .eq('otp_hash', otpHash)
      .eq('is_verified', false)
      .eq('purpose', 'password_reset')
      .single();

    if (!otpData || new Date(otpData.expires_at) < new Date()) {
      return ApiResponseUtil.error(res, 'Invalid or expired OTP');
    }

    // Mark OTP as verified
    await supabase
      .from('otp_verifications')
      .update({ is_verified: true })
      .eq('id', otpData.id);

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (!user) {
      return ApiResponseUtil.error(res, 'User not found');
    }

    // Update password via Supabase Auth
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Password reset successfully' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Password reset failed');
  }
});

// Admin Login
app.post('/api/auth/admin/login', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    // Import bcrypt for password comparison
    const bcrypt = require('bcryptjs');

    // Check if password matches using bcrypt
    const isValidPassword = await bcrypt.compare(password, config.ADMIN_PASSWORD);

    if (!isValidPassword) {
      console.log('❌ Invalid admin login attempt');
      return ApiResponseUtil.unauthorized(res, 'Invalid admin credentials');
    }

    console.log('✅ Admin login successful');

    // Generate admin token (using fixed admin ID)
    const tokens = JWTUtil.generateTokens('admin-user-id', 'admin');

    return ApiResponseUtil.success(res, { tokens, role: 'admin' });
  } catch (error: any) {
    console.error('❌ Admin login error:', error);
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

    console.log(`🔍 Job search request - city: ${city}, jobType: ${jobType}, page: ${page}`);

    // First get jobs with status='open'
    let jobsQuery = supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open');

    if (city) jobsQuery = jobsQuery.eq('city', city);
    if (jobType) jobsQuery = jobsQuery.eq('job_type', jobType);

    const { data: jobs, error: jobsError } = await jobsQuery
      .range((+page - 1) * +limit, +page * +limit - 1);

    if (jobsError) throw jobsError;

    console.log(`📊 Found ${jobs?.length || 0} jobs with status='open'`);

    // Get employer profiles for these jobs
    if (jobs && jobs.length > 0) {
      const employerIds = jobs.map(job => job.employer_id);
      const { data: employers } = await supabase
        .from('employer_profiles')
        .select('user_id, business_name, average_rating')
        .in('user_id', employerIds);

      // Attach employer data to jobs
      const jobsWithEmployers = jobs.map(job => ({
        ...job,
        employer: employers?.find(e => e.user_id === job.employer_id) || null
      }));

      return ApiResponseUtil.paginated(res, jobsWithEmployers, +page, +limit, jobs.length);
    }

    return ApiResponseUtil.paginated(res, [], +page, +limit, 0);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Apply to Job
app.post('/api/workers/jobs/:jobId/apply', authenticate, authorize('worker'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { cover_letter, expected_salary } = req.body;

    // Check daily application limit
    const today = new Date().toISOString().split('T')[0];
    const { data: limitData } = await supabase
      .from('application_limits')
      .select('application_count')
      .eq('worker_id', req.user!.userId)
      .eq('application_date', today)
      .single();

    if (limitData && limitData.application_count >= 10) {
      return ApiResponseUtil.error(res, 'Daily application limit reached (10 applications per day)');
    }

    // Get job details to find employer_id
    const { data: jobData } = await supabase
      .from('jobs')
      .select('employer_id')
      .eq('id', jobId)
      .single();

    const { data: applicationData, error } = await supabase.from('applications').insert({
      job_id: jobId,
      worker_id: req.user!.userId,
      cover_letter,
      expected_salary
    }).select().single();

    if (error) throw error;

    console.log(`✅ Application created: ${applicationData.id}`);

    // AUTO-CREATE CONNECTION REQUEST when worker applies
    if (jobData?.employer_id) {
      // Check if connection already exists
      const { data: existingConnection } = await supabase
        .from('connections')
        .select('id, status')
        .eq('worker_id', req.user!.userId)
        .eq('employer_id', jobData.employer_id)
        .maybeSingle();

      if (!existingConnection) {
        await supabase.from('connections').insert({
          application_id: applicationData.id,
          worker_id: req.user!.userId,
          employer_id: jobData.employer_id,
          status: 'pending'
        });
        console.log(`📨 Auto-created connection request: worker=${req.user!.userId}, employer=${jobData.employer_id}`);
      } else {
        console.log(`📌 Connection already exists with status: ${existingConnection.status}`);
      }
    }

    // Update application limit counter
    if (limitData) {
      await supabase
        .from('application_limits')
        .update({ application_count: limitData.application_count + 1 })
        .eq('worker_id', req.user!.userId)
        .eq('application_date', today);
    } else {
      await supabase.from('application_limits').insert({
        worker_id: req.user!.userId,
        application_date: today,
        application_count: 1
      });
    }

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
      .select(`
        *,
        jobs(*),
        employer:jobs(employer:employer_profiles!employer_profiles_user_id_fkey(business_name))
      `)
      .eq('worker_id', req.user!.userId)
      .order('applied_at', { ascending: false });

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Withdraw Application
app.delete('/api/workers/applications/:applicationId', authenticate, authorize('worker'), async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;

    const { error } = await supabase
      .from('applications')
      .update({ status: 'withdrawn' })
      .eq('id', applicationId)
      .eq('worker_id', req.user!.userId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Application withdrawn' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Save Job
app.post('/api/workers/jobs/:jobId/save', authenticate, authorize('worker'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const { error } = await supabase.from('saved_jobs').insert({
      worker_id: req.user!.userId,
      job_id: jobId
    });

    if (error) throw error;

    return ApiResponseUtil.created(res, { message: 'Job saved' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Unsave Job
app.delete('/api/workers/jobs/:jobId/save', authenticate, authorize('worker'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('worker_id', req.user!.userId)
      .eq('job_id', jobId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Job unsaved' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Get Saved Jobs
app.get('/api/workers/saved-jobs', authenticate, authorize('worker'), async (req: Request, res: Response) => {
  try {
    const { data } = await supabase
      .from('saved_jobs')
      .select(`
        *,
        job:jobs(*)
      `)
      .eq('worker_id', req.user!.userId)
      .order('created_at', { ascending: false });

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Check if job is saved
app.get('/api/workers/jobs/:jobId/is-saved', authenticate, authorize('worker'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const { data } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('worker_id', req.user!.userId)
      .eq('job_id', jobId)
      .single();

    return ApiResponseUtil.success(res, { isSaved: !!data });
  } catch (error: any) {
    return ApiResponseUtil.success(res, { isSaved: false });
  }
});

// Check if already applied
app.get('/api/workers/jobs/:jobId/is-applied', authenticate, authorize('worker'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const { data } = await supabase
      .from('applications')
      .select('id')
      .eq('worker_id', req.user!.userId)
      .eq('job_id', jobId)
      .single();

    return ApiResponseUtil.success(res, { isApplied: !!data });
  } catch (error: any) {
    return ApiResponseUtil.success(res, { isApplied: false });
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
    const { status, employer_notes, interview_scheduled_at, interview_location } = req.body;

    const updateData: any = {
      status,
      status_updated_at: new Date().toISOString()
    };

    if (employer_notes !== undefined) updateData.employer_notes = employer_notes;
    if (interview_scheduled_at) updateData.interview_scheduled_at = interview_scheduled_at;
    if (interview_location) updateData.interview_location = interview_location;

    const { error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', applicationId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Application updated' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Bulk Update Applications
app.put('/api/employers/applications/bulk', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { applicationIds, status, employer_notes } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return ApiResponseUtil.error(res, 'Application IDs required');
    }

    const { error } = await supabase
      .from('applications')
      .update({
        status,
        employer_notes,
        status_updated_at: new Date().toISOString()
      })
      .in('id', applicationIds);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: `${applicationIds.length} applications updated` });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Edit Job
app.put('/api/employers/jobs/:jobId', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const { error } = await supabase
      .from('jobs')
      .update(req.body)
      .eq('id', jobId)
      .eq('employer_id', req.user!.userId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Job updated' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Close Job
app.put('/api/employers/jobs/:jobId/close', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const { error } = await supabase
      .from('jobs')
      .update({ status: 'closed' })
      .eq('id', jobId)
      .eq('employer_id', req.user!.userId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Job closed' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Reopen Job
app.put('/api/employers/jobs/:jobId/reopen', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const { error } = await supabase
      .from('jobs')
      .update({ status: 'open' })
      .eq('id', jobId)
      .eq('employer_id', req.user!.userId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Job reopened' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Extend Job
app.put('/api/employers/jobs/:jobId/extend', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { days = 30 } = req.body;

    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + days);

    const { error } = await supabase
      .from('jobs')
      .update({
        expiry_date: newExpiryDate.toISOString(),
        last_extended_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .eq('employer_id', req.user!.userId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: `Job extended by ${days} days` });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Get Job Analytics
app.get('/api/employers/jobs/:jobId/analytics', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    // Get job details
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('employer_id', req.user!.userId)
      .single();

    if (!job) {
      return ApiResponseUtil.notFound(res, 'Job not found');
    }

    // Get application stats
    const { data: applications } = await supabase
      .from('applications')
      .select('status')
      .eq('job_id', jobId);

    const stats = {
      pending: applications?.filter(a => a.status === 'pending').length || 0,
      shortlisted: applications?.filter(a => a.status === 'shortlisted').length || 0,
      rejected: applications?.filter(a => a.status === 'rejected').length || 0,
      hired: applications?.filter(a => a.status === 'hired').length || 0,
      withdrawn: applications?.filter(a => a.status === 'withdrawn').length || 0,
    };

    // Get view count
    const { count: viewCount } = await supabase
      .from('job_views')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId);

    return ApiResponseUtil.success(res, {
      job,
      applicationStats: stats,
      totalApplications: applications?.length || 0,
      totalViews: viewCount || 0
    });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Job Templates - Create
app.post('/api/employers/templates', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const templateData = {
      ...req.body,
      employer_id: req.user!.userId
    };

    const { data, error } = await supabase
      .from('job_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) throw error;

    return ApiResponseUtil.created(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Job Templates - Get All
app.get('/api/employers/templates', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { data } = await supabase
      .from('job_templates')
      .select('*')
      .eq('employer_id', req.user!.userId)
      .order('created_at', { ascending: false });

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Job Templates - Delete
app.delete('/api/employers/templates/:templateId', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;

    const { error } = await supabase
      .from('job_templates')
      .delete()
      .eq('id', templateId)
      .eq('employer_id', req.user!.userId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Template deleted' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Create Job from Template
app.post('/api/employers/templates/:templateId/create-job', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;

    // Get template
    const { data: template } = await supabase
      .from('job_templates')
      .select('*')
      .eq('id', templateId)
      .eq('employer_id', req.user!.userId)
      .single();

    if (!template) {
      return ApiResponseUtil.notFound(res, 'Template not found');
    }

    // Create job from template
    const jobData = {
      employer_id: req.user!.userId,
      title: template.title,
      description: template.description,
      job_type: template.job_type,
      employment_type: template.employment_type,
      location: template.location,
      city: template.city,
      state: template.state,
      pincode: template.pincode,
      salary_min: template.salary_min,
      salary_max: template.salary_max,
      salary_type: template.salary_type,
      required_skills: template.required_skills,
      experience_required: template.experience_required,
      education_required: template.education_required,
      vacancies: template.vacancies,
      benefits: template.benefits,
      working_hours: template.working_hours,
      contact_phone: template.contact_phone,
      contact_email: template.contact_email,
      status: 'draft',
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    const { data: job, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) throw error;

    return ApiResponseUtil.created(res, job);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// ===================
// ADMIN ROUTES
// ===================

// Get All Verifications (pending + approved + rejected)
app.get('/api/admin/pending-verifications', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    // Get ALL workers (not just pending)
    const { data: workers } = await supabase
      .from('worker_profiles')
      .select(`
        *,
        users!worker_profiles_user_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

    // Get ALL employers (not just pending)
    const { data: employers } = await supabase
      .from('employer_profiles')
      .select(`
        *,
        users!employer_profiles_user_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

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
      .select(`
        *,
        employer:employer_profiles!employer_profiles_user_id_fkey(business_name)
      `)
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

    console.log(`📝 Admin approving job: ${jobId}`);

    const { data, error } = await supabase
      .from('jobs')
      .update({
        status: 'open',
        approved_at: new Date().toISOString(),
        approved_by: req.user!.userId
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Job approved successfully:`, data);

    return ApiResponseUtil.success(res, { message: 'Job approved', data });
  } catch (error: any) {
    console.error(`❌ Job approval failed:`, error);
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

// DEBUG: Get all jobs with their statuses
app.get('/api/admin/jobs/debug', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, status, created_at, employer_id')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    console.log('🔍 DEBUG - All jobs in database:', JSON.stringify(data, null, 2));

    return ApiResponseUtil.success(res, { jobs: data });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// ===================
// ADMIN: CONNECTION MANAGEMENT
// ===================

// Get All Connection Requests
app.get('/api/admin/connections', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    console.log(`📋 Admin fetching connections, status filter: ${status || 'all'}`);

    let query = supabase
      .from('connections')
      .select(`
        *,
        application:applications(id, cover_letter, expected_salary),
        job:applications(job:jobs(id, title, city))
      `);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: connections, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ Found ${connections?.length || 0} connection requests`);

    // Now get worker and employer details separately
    const enrichedConnections = await Promise.all(
      (connections || []).map(async (conn: any) => {
        // Get worker profile
        const { data: workerProfile } = await supabase
          .from('worker_profiles')
          .select('full_name, city, state')
          .eq('user_id', conn.worker_id)
          .single();

        // Get worker phone
        const { data: workerUser } = await supabase
          .from('users')
          .select('phone')
          .eq('id', conn.worker_id)
          .single();

        // Get employer profile
        const { data: employerProfile } = await supabase
          .from('employer_profiles')
          .select('business_name, city, state')
          .eq('user_id', conn.employer_id)
          .single();

        // Get employer phone
        const { data: employerUser } = await supabase
          .from('users')
          .select('phone')
          .eq('id', conn.employer_id)
          .single();

        // Get job details
        const { data: application } = await supabase
          .from('applications')
          .select('job_id')
          .eq('id', conn.application_id)
          .single();

        let jobTitle = 'N/A';
        if (application?.job_id) {
          const { data: job } = await supabase
            .from('jobs')
            .select('title')
            .eq('id', application.job_id)
            .single();
          jobTitle = job?.title || 'N/A';
        }

        return {
          id: conn.id,
          application_id: conn.application_id,
          worker_id: conn.worker_id,
          employer_id: conn.employer_id,
          status: conn.status,
          created_at: conn.created_at,
          approved_at: conn.approved_at,
          rejected_at: conn.rejected_at,
          worker_name: workerProfile?.full_name || 'Unknown',
          employer_name: employerProfile?.business_name || 'Unknown',
          job_title: jobTitle,
          worker_phone: conn.status === 'approved' ? workerUser?.phone : undefined,
          employer_phone: conn.status === 'approved' ? employerUser?.phone : undefined
        };
      })
    );

    return ApiResponseUtil.success(res, enrichedConnections);
  } catch (error: any) {
    console.error('❌ Failed to fetch connections:', error);
    return ApiResponseUtil.error(res, error.message);
  }
});

// Approve Connection Request
app.put('/api/admin/connections/:connectionId/approve', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { connectionId } = req.params;

    console.log(`✅ Admin approving connection: ${connectionId}`);

    // Don't set approved_by to avoid foreign key constraint issues
    // The admin user ID from Firebase may not exist in the users table
    const { data, error } = await supabase
      .from('connections')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Connection approved successfully`);

    return ApiResponseUtil.success(res, { message: 'Connection approved', data });
  } catch (error: any) {
    console.error('❌ Connection approval failed:', error);
    return ApiResponseUtil.error(res, error.message);
  }
});

// Reject Connection Request
app.put('/api/admin/connections/:connectionId/reject', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { connectionId } = req.params;

    console.log(`❌ Admin rejecting connection: ${connectionId}`);

    // Don't set rejected_by to avoid foreign key constraint issues
    const { data, error } = await supabase
      .from('connections')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString()
      })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Connection rejected successfully`);

    return ApiResponseUtil.success(res, { message: 'Connection rejected', data });
  } catch (error: any) {
    console.error('❌ Connection rejection failed:', error);
    return ApiResponseUtil.error(res, error.message);
  }
});

// Get All Jobs (with filters)
app.get('/api/admin/jobs/all', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { city, status, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('jobs')
      .select(`
        *,
        employer:employer_profiles!employer_profiles_user_id_fkey(business_name, city)
      `, { count: 'exact' });

    if (city) query = query.eq('city', city);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((+page - 1) * +limit, +page * +limit - 1);

    if (error) throw error;

    return ApiResponseUtil.paginated(res, data, +page, +limit, count || 0);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Get All Reports
app.get('/api/admin/reports', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:users!reports_reporter_id_fkey(phone, role),
        reported_user:users!reports_reported_user_id_fkey(phone, role),
        reported_job:jobs(title, city)
      `);

    if (status) query = query.eq('status', status);

    const { data } = await query.order('created_at', { ascending: false });

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Update Report Status
app.put('/api/admin/reports/:reportId', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { status, admin_notes } = req.body;

    const updateData: any = {
      status,
      admin_notes,
      resolved_by: req.user!.userId,
      resolved_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', reportId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Report updated' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Ban User
app.put('/api/admin/users/:userId/ban', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', userId);

    if (error) throw error;

    // Log admin action
    await supabase.from('admin_logs').insert({
      admin_id: req.user!.userId,
      action: 'ban_user',
      target_user_id: userId,
      details: { reason: 'Admin ban' },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    return ApiResponseUtil.success(res, { message: 'User banned' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Unban User
app.put('/api/admin/users/:userId/unban', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', userId);

    if (error) throw error;

    // Log admin action
    await supabase.from('admin_logs').insert({
      admin_id: req.user!.userId,
      action: 'unban_user',
      target_user_id: userId,
      details: { reason: 'Admin unban' },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    return ApiResponseUtil.success(res, { message: 'User unbanned' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Hide Review
app.put('/api/admin/reviews/:reviewId/hide', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    const { error } = await supabase
      .from('reviews')
      .update({ is_visible: false })
      .eq('id', reviewId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Review hidden' });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Show Review
app.put('/api/admin/reviews/:reviewId/show', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    const { error } = await supabase
      .from('reviews')
      .update({ is_visible: true })
      .eq('id', reviewId);

    if (error) throw error;

    return ApiResponseUtil.success(res, { message: 'Review visible' });
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

    console.log(`📋 Fetching job details for ID: ${jobId}`);

    // First, get the job
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError) {
      console.error(`❌ Job fetch error:`, jobError);
      throw jobError;
    }

    console.log(`✅ Job found: ${jobData.title}, employer_id: ${jobData.employer_id}`);

    // Then get the employer profile separately
    const { data: employerData } = await supabase
      .from('employer_profiles')
      .select('business_name, average_rating')
      .eq('user_id', jobData.employer_id)
      .single();

    console.log(`✅ Employer found: ${employerData?.business_name || 'Not found'}`);

    // Combine the data
    const data = {
      ...jobData,
      employer: employerData || null
    };

    // Increment views count
    await supabase.from('jobs').update({ views_count: (data.views_count || 0) + 1 }).eq('id', jobId);

    // Track job view
    const workerIdHeader = req.headers['x-worker-id'] as string;
    if (workerIdHeader) {
      await supabase.from('job_views').insert({
        job_id: jobId,
        worker_id: workerIdHeader,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });
    }

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    console.error(`❌ Job detail error:`, error);
    return ApiResponseUtil.error(res, error.message);
  }
});

// ===================
// REVIEWS & RATINGS
// ===================

// Create Review
app.post('/api/reviews', authenticate, async (req: Request, res: Response) => {
  try {
    const { reviewee_id, job_id, application_id, rating, comment, review_type } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return ApiResponseUtil.error(res, 'Rating must be between 1 and 5');
    }

    // Check if review already exists
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', req.user!.userId)
      .eq('reviewee_id', reviewee_id)
      .eq('job_id', job_id)
      .single();

    if (existing) {
      return ApiResponseUtil.error(res, 'You have already reviewed this user for this job');
    }

    const { data, error } = await supabase.from('reviews').insert({
      reviewer_id: req.user!.userId,
      reviewee_id,
      job_id,
      application_id,
      rating,
      comment,
      review_type
    }).select().single();

    if (error) throw error;

    return ApiResponseUtil.created(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Get Reviews for Worker
app.get('/api/workers/:workerId/reviews', async (req: Request, res: Response) => {
  try {
    const { workerId } = req.params;

    const { data } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:users!reviews_reviewer_id_fkey(phone),
        reviewer_profile:employer_profiles!inner(business_name)
      `)
      .eq('reviewee_id', workerId)
      .eq('review_type', 'employer_to_worker')
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Get Reviews for Employer
app.get('/api/employers/:employerId/reviews', async (req: Request, res: Response) => {
  try {
    const { employerId } = req.params;

    const { data } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:users!reviews_reviewer_id_fkey(phone),
        reviewer_profile:worker_profiles!inner(full_name)
      `)
      .eq('reviewee_id', employerId)
      .eq('review_type', 'worker_to_employer')
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// ===================
// REPORTS & FRAUD DETECTION
// ===================

// Create Report
app.post('/api/reports', authenticate, async (req: Request, res: Response) => {
  try {
    const { reported_user_id, reported_job_id, reason, description } = req.body;

    const { data, error } = await supabase.from('reports').insert({
      reporter_id: req.user!.userId,
      reported_user_id,
      reported_job_id,
      reason,
      description
    }).select().single();

    if (error) throw error;

    return ApiResponseUtil.created(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Get My Reports
app.get('/api/reports/my', authenticate, async (req: Request, res: Response) => {
  try {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('reporter_id', req.user!.userId)
      .order('created_at', { ascending: false });

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// ===================
// REFERRALS
// ===================

// Generate Referral Code
app.post('/api/referrals/generate-code', authenticate, async (req: Request, res: Response) => {
  try {
    // Check if user is verified
    const { data: user } = await supabase
      .from('users')
      .select('is_verified, role')
      .eq('id', req.user!.userId)
      .single();

    if (!user?.is_verified) {
      return ApiResponseUtil.error(res, 'Only verified users can generate referral codes');
    }

    // Generate unique code
    const code = `${user.role.toUpperCase().slice(0,3)}-${req.user!.userId.slice(0, 8).toUpperCase()}`;

    return ApiResponseUtil.success(res, { referralCode: code });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Apply Referral Code (during signup)
app.post('/api/referrals/apply', async (req: Request, res: Response) => {
  try {
    const { referral_code, referred_id } = req.body;

    if (!referral_code || !referred_id) {
      return ApiResponseUtil.error(res, 'Referral code and referred ID required');
    }

    // Extract referrer ID from code (assuming format: ROLE-USERID)
    const parts = referral_code.split('-');
    if (parts.length < 2) {
      return ApiResponseUtil.error(res, 'Invalid referral code');
    }

    const referrerId = parts.slice(1).join('-').toLowerCase();

    // Create referral record
    const { data, error } = await supabase.from('referrals').insert({
      referrer_id: referrerId,
      referred_id,
      referral_code,
      status: 'pending'
    }).select().single();

    if (error) throw error;

    return ApiResponseUtil.created(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Get My Referrals
app.get('/api/referrals/my', authenticate, async (req: Request, res: Response) => {
  try {
    const { data } = await supabase
      .from('referrals')
      .select(`
        *,
        referred:users!referrals_referred_id_fkey(phone, role, is_verified)
      `)
      .eq('referrer_id', req.user!.userId)
      .order('created_at', { ascending: false });

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// ===================
// PUBLIC PROFILES
// ===================

// Get Public Worker Profile (for employers after shortlisting)
app.get('/api/public/workers/:workerId', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { workerId } = req.params;

    // Check if employer has shortlisted this worker
    const { data: application } = await supabase
      .from('applications')
      .select('id, job_id')
      .eq('worker_id', workerId)
      .in('status', ['shortlisted', 'hired'])
      .limit(1)
      .single();

    if (!application) {
      return ApiResponseUtil.error(res, 'You can only view profiles of shortlisted workers');
    }

    // Get worker profile
    const { data: profile } = await supabase
      .from('worker_profiles')
      .select(`
        *,
        user:users!worker_profiles_user_id_fkey(phone, is_verified)
      `)
      .eq('user_id', workerId)
      .single();

    return ApiResponseUtil.success(res, profile);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message);
  }
});

// Get Public Employer Profile (for anyone)
app.get('/api/public/employers/:employerId', async (req: Request, res: Response) => {
  try {
    const { employerId } = req.params;

    // Get employer profile
    const { data: profile } = await supabase
      .from('employer_profiles')
      .select(`
        *,
        user:users!employer_profiles_user_id_fkey(phone, is_verified)
      `)
      .eq('user_id', employerId)
      .eq('verification_status', 'approved')
      .single();

    if (!profile) {
      return ApiResponseUtil.notFound(res, 'Employer not found');
    }

    // Get employer's active jobs
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', employerId)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(10);

    return ApiResponseUtil.success(res, { profile, activeJobs: jobs });
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










