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

    if (!firebaseToken || !role) {
      return ApiResponseUtil.error(res, 'Firebase token and role required', 400);
    }

    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(firebaseToken);
    const phone = decodedToken.phone_number;

    if (!phone) {
      return ApiResponseUtil.error(res, 'Phone number not found in token', 400);
    }

    // Check if user exists in Supabase
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    let user = existingUser;

    // If user doesn't exist, create new user
    if (!user) {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([
          {
            phone,
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

export default router;
