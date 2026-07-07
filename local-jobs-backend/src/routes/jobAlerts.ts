import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import ApiResponseUtil from '../utils/response';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/job-alerts/preferences — get worker's alert preferences
router.get('/preferences', authenticate, authorize('worker'), async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('job_alert_preferences')
      .select('*')
      .eq('worker_id', req.user!.userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No preferences set yet — return defaults
      return ApiResponseUtil.success(res, {
        worker_id: req.user!.userId,
        categories: [],
        cities: [],
        min_salary: null,
        employment_types: [],
        is_active: true,
        frequency: 'daily',
      });
    }

    if (error) throw error;

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to fetch alert preferences', 500);
  }
});

// PUT /api/job-alerts/preferences — create or update alert preferences
router.put('/preferences', authenticate, authorize('worker'), async (req: Request, res: Response) => {
  try {
    const { categories, cities, min_salary, employment_types, is_active, frequency } = req.body;

    // Validate frequency
    if (frequency && !['instant', 'daily', 'weekly'].includes(frequency)) {
      return ApiResponseUtil.error(res, 'frequency must be one of: instant, daily, weekly');
    }

    // Validate arrays
    if (categories && !Array.isArray(categories)) {
      return ApiResponseUtil.error(res, 'categories must be an array');
    }
    if (cities && !Array.isArray(cities)) {
      return ApiResponseUtil.error(res, 'cities must be an array');
    }
    if (employment_types && !Array.isArray(employment_types)) {
      return ApiResponseUtil.error(res, 'employment_types must be an array');
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (categories !== undefined) updateData.categories = categories;
    if (cities !== undefined) updateData.cities = cities;
    if (min_salary !== undefined) updateData.min_salary = min_salary;
    if (employment_types !== undefined) updateData.employment_types = employment_types;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (frequency !== undefined) updateData.frequency = frequency;

    // Check if preferences exist
    const { data: existing } = await supabase
      .from('job_alert_preferences')
      .select('id')
      .eq('worker_id', req.user!.userId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('job_alert_preferences')
        .update(updateData)
        .eq('worker_id', req.user!.userId)
        .select()
        .single();

      if (error) throw error;
      return ApiResponseUtil.success(res, data);
    } else {
      const { data, error } = await supabase
        .from('job_alert_preferences')
        .insert({
          worker_id: req.user!.userId,
          ...updateData,
        })
        .select()
        .single();

      if (error) throw error;
      return ApiResponseUtil.created(res, data);
    }
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to update alert preferences', 500);
  }
});

// POST /api/job-alerts/check — manually trigger alert check
router.post('/check', authenticate, authorize('worker'), async (req: Request, res: Response) => {
  try {
    // Get worker's preferences
    const { data: prefs, error: prefsError } = await supabase
      .from('job_alert_preferences')
      .select('*')
      .eq('worker_id', req.user!.userId)
      .eq('is_active', true)
      .single();

    if (prefsError || !prefs) {
      return ApiResponseUtil.error(res, 'No active alert preferences found. Please set your preferences first.');
    }

    // Build query for matching jobs (posted in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from('jobs')
      .select('id, title, city, job_type, employment_type, salary_min, salary_max, created_at')
      .eq('status', 'open')
      .gte('created_at', sevenDaysAgo);

    // Apply filters based on preferences
    if (prefs.categories && prefs.categories.length > 0) {
      query = query.in('job_type', prefs.categories);
    }

    if (prefs.cities && prefs.cities.length > 0) {
      query = query.in('city', prefs.cities);
    }

    if (prefs.min_salary) {
      query = query.gte('salary_min', prefs.min_salary);
    }

    if (prefs.employment_types && prefs.employment_types.length > 0) {
      query = query.in('employment_type', prefs.employment_types);
    }

    const { data: matchingJobs, error: jobsError } = await query
      .order('created_at', { ascending: false })
      .limit(20);

    if (jobsError) throw jobsError;

    // Create notifications for matching jobs
    const notificationsToCreate = (matchingJobs || []).map(job => ({
      user_id: req.user!.userId,
      type: 'job_alert',
      title: 'New Job Match',
      message: `${job.title} in ${job.city} matches your alert preferences`,
      data: { job_id: job.id },
    }));

    if (notificationsToCreate.length > 0) {
      await supabase.from('notifications').insert(notificationsToCreate);
    }

    return ApiResponseUtil.success(res, {
      matching_jobs: matchingJobs || [],
      notifications_created: notificationsToCreate.length,
    });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to check job alerts', 500);
  }
});

export default router;
