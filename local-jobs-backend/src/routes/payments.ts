import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { supabase } from '../config/supabase';
import ApiResponseUtil from '../utils/response';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { CREDIT_PACKS } from '../utils/creditPacks';

const router = Router();

// Mock mode: active when Razorpay keys are absent or still set to placeholder values
const MOCK_MODE = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_REPLACE_WITH_YOUR_KEY';

// Lazy-initialize Razorpay instance
let razorpayInstance: any = null;
function getRazorpay() {
  if (!razorpayInstance) {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

// POST /api/payments/create-order
router.post('/create-order', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { credits, amount, plan } = req.body;

    if (!credits && !plan) {
      return ApiResponseUtil.error(res, 'Either credits or plan is required');
    }

    let orderAmount: number;
    let orderCredits: number;

    if (plan) {
      // Subscription order — look up plan price
      const { SUBSCRIPTION_PLANS } = require('../utils/creditPacks');
      const selectedPlan = SUBSCRIPTION_PLANS.find((p: any) => p.id === plan);
      if (!selectedPlan || selectedPlan.price === 0) {
        return ApiResponseUtil.error(res, 'Invalid plan or free plan does not require payment');
      }
      orderAmount = selectedPlan.price;
      orderCredits = selectedPlan.credits_per_month;
    } else {
      // Credit pack order — validate against packs
      const pack = CREDIT_PACKS.find(p => p.credits === credits);
      if (pack) {
        orderAmount = pack.price;
        orderCredits = pack.credits;
      } else if (amount && credits) {
        orderAmount = amount;
        orderCredits = credits;
      } else {
        return ApiResponseUtil.error(res, 'Invalid credits amount');
      }
    }

    let orderId: string;

    if (MOCK_MODE) {
      // Mock mode: generate a fake order ID without calling Razorpay
      orderId = `mock_order_${Date.now()}`;
      console.log('[MOCK] Razorpay mock mode active — skipping real order creation');
    } else {
      const razorpay = getRazorpay();
      const order = await razorpay.orders.create({
        amount: Math.round(orderAmount * 100), // Razorpay expects paise
        currency: 'INR',
        receipt: `order_${Date.now()}_${req.user!.userId.slice(0, 8)}`,
        notes: {
          employer_id: req.user!.userId,
          credits: orderCredits,
          plan: plan || null,
        },
      });
      orderId = order.id;
    }

    // Record pending transaction
    await supabase.from('credit_transactions').insert({
      employer_id: req.user!.userId,
      amount: orderAmount,
      credits: orderCredits,
      razorpay_order_id: orderId,
      status: 'pending',
    });

    return ApiResponseUtil.success(res, {
      orderId,
      amount: orderAmount,
      currency: 'INR',
      key: MOCK_MODE ? 'mock_key' : process.env.RAZORPAY_KEY_ID,
      ...(MOCK_MODE && { mock: true }),
    });
  } catch (error: any) {
    console.error('Payment order creation failed:', error);
    return ApiResponseUtil.error(res, error.message || 'Failed to create payment order', 500);
  }
});

// POST /api/payments/verify
router.post('/verify', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return ApiResponseUtil.error(res, 'Missing payment verification parameters');
    }

    if (MOCK_MODE) {
      console.log('[MOCK] Razorpay mock mode active — skipping signature verification');
    } else {
      // Verify signature using HMAC SHA256
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        // Mark transaction as failed
        await supabase
          .from('credit_transactions')
          .update({ status: 'failed' })
          .eq('razorpay_order_id', razorpay_order_id);

        return ApiResponseUtil.error(res, 'Invalid payment signature', 400);
      }
    }

    // Get the pending transaction
    const { data: transaction, error: txError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('employer_id', req.user!.userId)
      .single();

    if (txError || !transaction) {
      return ApiResponseUtil.error(res, 'Transaction not found', 404);
    }

    // Update transaction as completed
    await supabase
      .from('credit_transactions')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'completed',
      })
      .eq('id', transaction.id);

    // Add credits to employer's account
    const { data: existingCredits } = await supabase
      .from('credits')
      .select('*')
      .eq('employer_id', req.user!.userId)
      .single();

    if (existingCredits) {
      await supabase
        .from('credits')
        .update({
          credits_remaining: existingCredits.credits_remaining + transaction.credits,
          updated_at: new Date().toISOString(),
        })
        .eq('employer_id', req.user!.userId);
    } else {
      await supabase.from('credits').insert({
        employer_id: req.user!.userId,
        credits_remaining: transaction.credits,
        credits_used: 0,
      });
    }

    return ApiResponseUtil.success(res, {
      message: 'Payment verified successfully',
      credits_added: transaction.credits,
    });
  } catch (error: any) {
    console.error('Payment verification failed:', error);
    return ApiResponseUtil.error(res, error.message || 'Payment verification failed', 500);
  }
});

// GET /api/payments/credits
router.get('/credits', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    // Get current credits
    const { data: credits } = await supabase
      .from('credits')
      .select('credits_remaining, credits_used')
      .eq('employer_id', req.user!.userId)
      .single();

    // Get transaction history
    const { data: transactions, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('employer_id', req.user!.userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return ApiResponseUtil.success(res, {
      credits_remaining: credits?.credits_remaining || 0,
      credits_used: credits?.credits_used || 0,
      transactions: transactions || [],
    });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to fetch credits', 500);
  }
});

// POST /api/payments/webhook — Razorpay webhook (no auth, verified by webhook signature)
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    if (MOCK_MODE) {
      console.log('[MOCK] Razorpay mock mode active — webhook ignored');
      return res.status(200).json({ status: 'ok' });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    // Verify webhook signature
    const receivedSignature = req.headers['x-razorpay-signature'] as string;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (receivedSignature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;

      // Find the transaction
      const { data: transaction } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('razorpay_order_id', orderId)
        .single();

      if (transaction && transaction.status === 'pending') {
        // Update transaction
        await supabase
          .from('credit_transactions')
          .update({
            razorpay_payment_id: payment.id,
            status: 'completed',
          })
          .eq('id', transaction.id);

        // Add credits
        const { data: existingCredits } = await supabase
          .from('credits')
          .select('*')
          .eq('employer_id', transaction.employer_id)
          .single();

        if (existingCredits) {
          await supabase
            .from('credits')
            .update({
              credits_remaining: existingCredits.credits_remaining + transaction.credits,
              updated_at: new Date().toISOString(),
            })
            .eq('employer_id', transaction.employer_id);
        } else {
          await supabase.from('credits').insert({
            employer_id: transaction.employer_id,
            credits_remaining: transaction.credits,
            credits_used: 0,
          });
        }

        console.log(`Webhook: ${transaction.credits} credits added for employer ${transaction.employer_id}`);
      }
    }

    if (event === 'subscription.charged') {
      const subscription = payload.subscription.entity;
      const subscriptionId = subscription.id;

      // Find the subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('razorpay_subscription_id', subscriptionId)
        .single();

      if (sub) {
        // Add monthly credits
        const { data: existingCredits } = await supabase
          .from('credits')
          .select('*')
          .eq('employer_id', sub.employer_id)
          .single();

        if (existingCredits) {
          await supabase
            .from('credits')
            .update({
              credits_remaining: existingCredits.credits_remaining + sub.credits_per_month,
              updated_at: new Date().toISOString(),
            })
            .eq('employer_id', sub.employer_id);
        } else {
          await supabase.from('credits').insert({
            employer_id: sub.employer_id,
            credits_remaining: sub.credits_per_month,
            credits_used: 0,
          });
        }

        console.log(`Webhook: Subscription charged, ${sub.credits_per_month} credits added for employer ${sub.employer_id}`);
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook processing failed:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
