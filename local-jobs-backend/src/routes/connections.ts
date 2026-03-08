import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { ApiResponseUtil } from '../utils/response';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Middleware aliases
const authMiddleware = authenticate;
const adminMiddleware = authorize('admin');

// GET /api/connections/admin
// List all connection requests (admin only)
router.get('/admin', adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('connections')
      .select(`
        *,
        worker:users!connections_worker_id_fkey(
          id,
          phone,
          worker_profiles(full_name, city, state)
        ),
        employer:users!connections_employer_id_fkey(
          id,
          phone,
          employer_profiles(business_name, city, state)
        ),
        application:applications(
          id,
          jobs(title)
        )
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    console.error('Failed to fetch connections:', error);
    return ApiResponseUtil.error(res, error.message || 'Failed to fetch connections', 500);
  }
});

// PUT /api/connections/:id/approve
// Approve a connection request (admin only)
router.put('/:id/approve', adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user.userId;

    const { data, error } = await supabase
      .from('connections')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: adminId
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Connection ${id} approved by admin ${adminId}`);

    return ApiResponseUtil.success(res, data, 'Connection approved successfully');
  } catch (error: any) {
    console.error('Failed to approve connection:', error);
    return ApiResponseUtil.error(res, error.message || 'Failed to approve connection', 500);
  }
});

// PUT /api/connections/:id/reject
// Reject a connection request (admin only)
router.put('/:id/reject', adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;
    const adminId = (req as any).user.userId;

    const { data, error } = await supabase
      .from('connections')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: adminId,
        admin_notes: admin_notes || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log(`❌ Connection ${id} rejected by admin ${adminId}`);

    return ApiResponseUtil.success(res, data, 'Connection rejected successfully');
  } catch (error: any) {
    console.error('Failed to reject connection:', error);
    return ApiResponseUtil.error(res, error.message || 'Failed to reject connection', 500);
  }
});

// POST /api/connections/create
// Create a connection request (triggered when employer shortlists worker)
router.post('/create', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { application_id, worker_id, employer_id } = req.body;

    if (!application_id || !worker_id || !employer_id) {
      return ApiResponseUtil.error(res, 'Missing required fields', 400);
    }

    // Check if connection already exists
    const { data: existing } = await supabase
      .from('connections')
      .select('*')
      .eq('application_id', application_id)
      .eq('worker_id', worker_id)
      .eq('employer_id', employer_id)
      .single();

    if (existing) {
      return ApiResponseUtil.success(res, existing, 'Connection request already exists');
    }

    // Create new connection request
    const { data, error } = await supabase
      .from('connections')
      .insert([{
        application_id,
        worker_id,
        employer_id,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    console.log(`📨 Connection request created: ${worker_id} <-> ${employer_id}`);

    return ApiResponseUtil.created(res, data, 'Connection request created successfully');
  } catch (error: any) {
    console.error('Failed to create connection:', error);
    return ApiResponseUtil.error(res, error.message || 'Failed to create connection', 500);
  }
});

// GET /api/connections/check
// Check if connection exists and is approved (for current user)
router.get('/check', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { worker_id, employer_id } = req.query;
    const userId = (req as any).user.userId;

    if (!worker_id || !employer_id) {
      return ApiResponseUtil.error(res, 'worker_id and employer_id required', 400);
    }

    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .eq('worker_id', worker_id)
      .eq('employer_id', employer_id)
      .eq('status', 'approved')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error;
    }

    return ApiResponseUtil.success(res, {
      hasConnection: !!data,
      connection: data || null
    });
  } catch (error: any) {
    console.error('Failed to check connection:', error);
    return ApiResponseUtil.error(res, error.message || 'Failed to check connection', 500);
  }
});

export default router;
