import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import ApiResponseUtil from '../utils/response';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/interviews/schedule — employer schedules interview (costs 1 credit)
router.post('/schedule', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { application_id, interview_type, scheduled_at, duration_minutes, location, notes } = req.body;

    if (!application_id || !interview_type || !scheduled_at) {
      return ApiResponseUtil.error(res, 'application_id, interview_type, and scheduled_at are required');
    }

    if (!['in-person', 'video', 'call'].includes(interview_type)) {
      return ApiResponseUtil.error(res, 'interview_type must be one of: in-person, video, call');
    }

    const scheduledDate = new Date(scheduled_at);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return ApiResponseUtil.error(res, 'scheduled_at must be a valid future date');
    }

    // Get the application to find worker and job IDs
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, worker_id, job_id')
      .eq('id', application_id)
      .single();

    if (appError || !application) {
      return ApiResponseUtil.notFound(res, 'Application not found');
    }

    // Verify the job belongs to this employer
    const { data: job } = await supabase
      .from('jobs')
      .select('id, employer_id, title')
      .eq('id', application.job_id)
      .eq('employer_id', req.user!.userId)
      .single();

    if (!job) {
      return ApiResponseUtil.error(res, 'You do not own this job', 403);
    }

    // Check and deduct 1 credit
    const { data: credits } = await supabase
      .from('credits')
      .select('*')
      .eq('employer_id', req.user!.userId)
      .single();

    if (!credits || credits.credits_remaining < 1) {
      return ApiResponseUtil.error(res, 'Insufficient interview credits. Please purchase more credits.', 402);
    }

    // Deduct credit
    await supabase
      .from('credits')
      .update({
        credits_remaining: credits.credits_remaining - 1,
        credits_used: credits.credits_used + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('employer_id', req.user!.userId);

    // Create scheduled interview
    const { data: interview, error: interviewError } = await supabase
      .from('scheduled_interviews')
      .insert({
        application_id,
        worker_id: application.worker_id,
        employer_id: req.user!.userId,
        job_id: application.job_id,
        interview_type,
        scheduled_at,
        duration_minutes: duration_minutes || 30,
        location: location || null,
        notes: notes || null,
        status: 'scheduled',
      })
      .select()
      .single();

    if (interviewError) throw interviewError;

    // Create notifications for both parties
    await Promise.all([
      supabase.from('notifications').insert({
        user_id: application.worker_id,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `You have an interview scheduled for ${job.title} on ${scheduledDate.toLocaleDateString('en-IN')}`,
        data: { interview_id: interview.id, job_id: job.id },
      }),
      supabase.from('notifications').insert({
        user_id: req.user!.userId,
        type: 'interview_scheduled',
        title: 'Interview Confirmed',
        message: `Interview for ${job.title} scheduled on ${scheduledDate.toLocaleDateString('en-IN')}`,
        data: { interview_id: interview.id, job_id: job.id },
      }),
    ]);

    console.log(`Interview scheduled: ${interview.id}, 1 credit deducted from employer ${req.user!.userId}`);

    return ApiResponseUtil.created(res, interview);
  } catch (error: any) {
    console.error('Interview scheduling failed:', error);
    return ApiResponseUtil.error(res, error.message || 'Failed to schedule interview', 500);
  }
});

// GET /api/interviews/my — returns all interviews for current user
router.get('/my', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    let query = supabase
      .from('scheduled_interviews')
      .select('*');

    if (role === 'employer') {
      query = query.eq('employer_id', userId);
    } else if (role === 'worker') {
      query = query.eq('worker_id', userId);
    } else {
      // Admin can see all
    }

    const { data: interviews, error } = await query.order('scheduled_at', { ascending: true });

    if (error) throw error;

    // Enrich with job and profile details
    if (interviews && interviews.length > 0) {
      const jobIds = [...new Set(interviews.map(i => i.job_id))];
      const workerIds = [...new Set(interviews.map(i => i.worker_id))];
      const employerIds = [...new Set(interviews.map(i => i.employer_id))];

      const [{ data: jobs }, { data: workers }, { data: employers }] = await Promise.all([
        supabase.from('jobs').select('id, title, city').in('id', jobIds),
        supabase.from('worker_profiles').select('user_id, full_name, city, photo_url').in('user_id', workerIds),
        supabase.from('employer_profiles').select('user_id, business_name, city').in('user_id', employerIds),
      ]);

      const enriched = interviews.map(interview => {
        const jobData = jobs?.find(j => j.id === interview.job_id);
        const workerData = workers?.find(w => w.user_id === interview.worker_id);
        const employerData = employers?.find(e => e.user_id === interview.employer_id);

        return {
          ...interview,
          job: jobData || null,
          worker: workerData ? {
            full_name: workerData.full_name,
            city: workerData.city,
            photo_url: workerData.photo_url,
          } : null,
          employer: employerData ? {
            business_name: employerData.business_name,
            city: employerData.city,
          } : null,
        };
      });

      return ApiResponseUtil.success(res, enriched);
    }

    return ApiResponseUtil.success(res, []);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to fetch interviews', 500);
  }
});

// PUT /api/interviews/:id/status — update interview status (employer only)
router.put('/:id/status', authenticate, authorize('employer'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['completed', 'cancelled', 'no-show'].includes(status)) {
      return ApiResponseUtil.error(res, 'Status must be one of: completed, cancelled, no-show');
    }

    // Verify the interview belongs to this employer
    const { data: interview, error: fetchError } = await supabase
      .from('scheduled_interviews')
      .select('*')
      .eq('id', id)
      .eq('employer_id', req.user!.userId)
      .single();

    if (fetchError || !interview) {
      return ApiResponseUtil.notFound(res, 'Interview not found');
    }

    const { error } = await supabase
      .from('scheduled_interviews')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    // Notify worker about status change
    await supabase.from('notifications').insert({
      user_id: interview.worker_id,
      type: 'interview_update',
      title: `Interview ${status}`,
      message: `Your interview has been marked as ${status}`,
      data: { interview_id: id },
    });

    return ApiResponseUtil.success(res, { message: `Interview marked as ${status}` });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to update interview', 500);
  }
});

// GET /api/interviews/:id — get interview details (only involved parties)
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const { data: interview, error } = await supabase
      .from('scheduled_interviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !interview) {
      return ApiResponseUtil.notFound(res, 'Interview not found');
    }

    // Only involved parties or admin can view
    if (role !== 'admin' && interview.worker_id !== userId && interview.employer_id !== userId) {
      return ApiResponseUtil.error(res, 'You are not authorized to view this interview', 403);
    }

    // Get job details
    const { data: job } = await supabase
      .from('jobs')
      .select('id, title, city, employment_type')
      .eq('id', interview.job_id)
      .single();

    // Get profiles
    const [{ data: workerProfile }, { data: employerProfile }] = await Promise.all([
      supabase.from('worker_profiles').select('user_id, full_name, city, state, photo_url, skills').eq('user_id', interview.worker_id).single(),
      supabase.from('employer_profiles').select('user_id, business_name, city, state').eq('user_id', interview.employer_id).single(),
    ]);

    // Share contact details if interview is scheduled or completed
    let workerContact: any = null;
    let employerContact: any = null;

    if (['scheduled', 'completed'].includes(interview.status)) {
      const [{ data: workerUser }, { data: employerUser }] = await Promise.all([
        supabase.from('users').select('phone').eq('id', interview.worker_id).single(),
        supabase.from('users').select('phone').eq('id', interview.employer_id).single(),
      ]);

      workerContact = { phone: workerUser?.phone || null };
      employerContact = { phone: employerUser?.phone || null };
    }

    return ApiResponseUtil.success(res, {
      ...interview,
      job: job || null,
      worker: {
        ...(workerProfile || {}),
        contact: workerContact,
      },
      employer: {
        ...(employerProfile || {}),
        contact: employerContact,
      },
    });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to fetch interview', 500);
  }
});

export default router;
