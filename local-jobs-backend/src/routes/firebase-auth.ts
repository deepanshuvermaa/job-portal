import { Router, Request, Response } from 'express';
import { verifyFirebaseToken } from '../services/firebase.service';
import { supabase } from '../config/supabase';
import { ApiResponseUtil } from '../utils/response';
import { JWTUtil } from '../utils/jwt';

const router = Router();

// POST /api/firebase-auth/verify
// Verify Firebase token and create/login user
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { firebaseToken, role } = req.body;

    console.log('📥 Verify request received');
    console.log('Token present:', !!firebaseToken);
    console.log('Role:', role);

    if (!firebaseToken) {
      return ApiResponseUtil.error(res, 'Firebase token required', 400);
    }

    // Verify Firebase token
    console.log('🔐 Verifying Firebase token...');
    const decodedToken = await verifyFirebaseToken(firebaseToken);
    console.log('✅ Token verified. Phone:', decodedToken.phone_number);
    const phone = decodedToken.phone_number;

    if (!phone) {
      return ApiResponseUtil.error(res, 'Phone number not found in token', 400);
    }

    // Remove country code prefix for storage (keep only 10 digits)
    const cleanPhone = phone.replace(/^\+91/, '');

    // Check if user exists in Supabase
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', cleanPhone)
      .single();

    // If user doesn't exist and no role provided, return isNewUser flag
    if (!existingUser && !role) {
      console.log('🆕 New user detected, role selection required');
      return ApiResponseUtil.success(res, {
        isNewUser: true,
        phone: cleanPhone
      });
    }

    let user = existingUser;

    // If user doesn't exist, create new user (requires role)
    if (!user) {

      const { data: newUser, error } = await supabase
        .from('users')
        .insert([
          {
            phone: cleanPhone,
            role,
            verification_status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      user = newUser;

      // Create profile based on role
      if (role === 'worker') {
        await supabase.from('worker_profiles').insert([
          {
            user_id: user.id,
            full_name: '',
            verification_status: 'pending',
          },
        ]);
      } else if (role === 'employer') {
        await supabase.from('employer_profiles').insert([
          {
            user_id: user.id,
            verification_status: 'pending',
          },
        ]);
      }
    }

    // Generate JWT tokens
    const tokens = JWTUtil.generateTokens(user.id, user.role);

    return ApiResponseUtil.success(res, {
      user,
      tokens,
      isNewUser: !existingUser,
    });
  } catch (error: any) {
    console.error('Firebase auth error:', error);
    return ApiResponseUtil.error(res, error.message || 'Authentication failed', 500);
  }
});

// POST /api/firebase-auth/register/employer
// Complete employer registration with Firebase token
router.post('/register/employer', async (req: Request, res: Response) => {
  try {
    const {
      firebaseToken,
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
    } = req.body;

    console.log('📥 Employer registration request received');

    if (!firebaseToken || !business_name) {
      return ApiResponseUtil.error(res, 'Firebase token and business name required', 400);
    }

    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(firebaseToken);
    const phone = decodedToken.phone_number;

    if (!phone) {
      return ApiResponseUtil.error(res, 'Phone number not found in token', 400);
    }

    const cleanPhone = phone.replace(/^\+91/, '');

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', cleanPhone)
      .single();

    if (existingUser) {
      return ApiResponseUtil.error(res, 'User already exists', 400);
    }

    // Create user record
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([
        {
          phone: cleanPhone,
          role: 'employer',
          verification_status: 'pending',
        },
      ])
      .select()
      .single();

    if (userError) throw userError;

    // Create employer profile
    const { error: profileError } = await supabase.from('employer_profiles').insert([
      {
        user_id: newUser.id,
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
        verification_status: 'pending',
      },
    ]);

    if (profileError) throw profileError;

    // Generate JWT tokens
    const tokens = JWTUtil.generateTokens(newUser.id, 'employer');

    console.log('✅ Employer registered successfully');

    return ApiResponseUtil.created(res, { user: newUser, tokens });
  } catch (error: any) {
    console.error('Employer registration error:', error);
    return ApiResponseUtil.error(res, error.message || 'Registration failed', 500);
  }
});

// POST /api/firebase-auth/register/worker
// Complete worker registration with Firebase token
router.post('/register/worker', async (req: Request, res: Response) => {
  try {
    const {
      firebaseToken,
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
    } = req.body;

    console.log('📥 Worker registration request received');

    if (!firebaseToken || !full_name) {
      return ApiResponseUtil.error(res, 'Firebase token and full name required', 400);
    }

    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(firebaseToken);
    const phone = decodedToken.phone_number;

    if (!phone) {
      return ApiResponseUtil.error(res, 'Phone number not found in token', 400);
    }

    const cleanPhone = phone.replace(/^\+91/, '');

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', cleanPhone)
      .single();

    if (existingUser) {
      return ApiResponseUtil.error(res, 'User already exists', 400);
    }

    // Create user record
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([
        {
          phone: cleanPhone,
          role: 'worker',
          verification_status: 'pending',
        },
      ])
      .select()
      .single();

    if (userError) throw userError;

    // Create worker profile
    const { error: profileError } = await supabase.from('worker_profiles').insert([
      {
        user_id: newUser.id,
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
        verification_status: 'pending',
      },
    ]);

    if (profileError) throw profileError;

    // Generate JWT tokens
    const tokens = JWTUtil.generateTokens(newUser.id, 'worker');

    console.log('✅ Worker registered successfully');

    return ApiResponseUtil.created(res, { user: newUser, tokens });
  } catch (error: any) {
    console.error('Worker registration error:', error);
    return ApiResponseUtil.error(res, error.message || 'Registration failed', 500);
  }
});

export default router;
