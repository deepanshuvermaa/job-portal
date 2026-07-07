import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import ApiResponseUtil from '../utils/response';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { SUBSCRIPTION_PLANS } from '../utils/creditPacks';

const router = Router();

// GET /api/subscriptions/plans — returns available plans
router.get('/plans', (req: Request, res: Response) => {
  return ApiResponseUtil.success(res, SUBSCRIPTION_PLANS);
});

// GET /api/subscriptions/my — returns current subscription
router.get('/my', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('employer_id', req.user!.userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code === 'PGRST116') {
      // No active subscription — return free plan info
      return ApiResponseUtil.success(res, {
        plan: 'free',
        credits_per_month: 2,
        max_active_jobs: 1,
        price: 0,
        status: 'active',
        is_free: true,
      });
    }

    if (error) throw error;

    // Get matching plan details
    const planDetails = SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan);

    return ApiResponseUtil.success(res, {
      ...subscription,
      plan_details: planDetails || null,
    });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to fetch subscription', 500);
  }
});

// POST /api/subscriptions/subscribe — create subscription via Razorpay
router.post('/subscribe', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;

    if (!plan) {
      return ApiResponseUtil.error(res, 'Plan is required');
    }

    const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === plan);
    if (!selectedPlan) {
      return ApiResponseUtil.error(res, 'Invalid plan');
    }

    // Free plan — just create a subscription record
    if (selectedPlan.price === 0) {
      // Check if already has an active subscription
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('employer_id', req.user!.userId)
        .eq('status', 'active')
        .single();

      if (existing) {
        return ApiResponseUtil.error(res, 'You already have an active subscription');
      }

      const { data: sub, error } = await supabase
        .from('subscriptions')
        .insert({
          employer_id: req.user!.userId,
          plan: selectedPlan.id,
          credits_per_month: selectedPlan.credits_per_month,
          max_active_jobs: selectedPlan.max_active_jobs,
          price: 0,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Initialize credits for free plan
      const { data: existingCredits } = await supabase
        .from('credits')
        .select('*')
        .eq('employer_id', req.user!.userId)
        .single();

      if (!existingCredits) {
        await supabase.from('credits').insert({
          employer_id: req.user!.userId,
          credits_remaining: selectedPlan.credits_per_month,
          credits_used: 0,
        });
      }

      return ApiResponseUtil.created(res, sub);
    }

    // Paid plan — create Razorpay subscription
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create a Razorpay plan (or use pre-created plan IDs)
    // For simplicity, create an order first and handle subscription on verification
    const order = await razorpay.orders.create({
      amount: Math.round(selectedPlan.price * 100),
      currency: 'INR',
      receipt: `sub_${Date.now()}_${req.user!.userId.slice(0, 8)}`,
      notes: {
        employer_id: req.user!.userId,
        plan: selectedPlan.id,
        type: 'subscription',
      },
    });

    // Create pending subscription record
    const { data: sub, error } = await supabase
      .from('subscriptions')
      .insert({
        employer_id: req.user!.userId,
        plan: selectedPlan.id,
        credits_per_month: selectedPlan.credits_per_month,
        max_active_jobs: selectedPlan.max_active_jobs,
        price: selectedPlan.price,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return ApiResponseUtil.success(res, {
      subscription: sub,
      orderId: order.id,
      amount: selectedPlan.price,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Subscription creation failed:', error);
    return ApiResponseUtil.error(res, error.message || 'Failed to create subscription', 500);
  }
});

export default router;
