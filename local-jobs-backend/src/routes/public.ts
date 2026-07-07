import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import ApiResponseUtil from '../utils/response';
import citiesData from '../data/cities.json';
import faqData from '../data/faq.json';

const router = Router();

// In-memory cache for stats
let statsCache: { data: any; timestamp: number } | null = null;
const STATS_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// GET /api/public/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Return cached result if still valid
    if (statsCache && Date.now() - statsCache.timestamp < STATS_CACHE_TTL) {
      return ApiResponseUtil.success(res, statsCache.data);
    }

    const [
      { count: jobs },
      { count: workers },
      { count: employers },
      { count: applications },
    ] = await Promise.all([
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('worker_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('employer_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('applications').select('*', { count: 'exact', head: true }),
    ]);

    const data = {
      jobs: jobs || 0,
      workers: workers || 0,
      employers: employers || 0,
      applications: applications || 0,
    };

    statsCache = { data, timestamp: Date.now() };

    return ApiResponseUtil.success(res, data);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to fetch stats', 500);
  }
});

// GET /api/public/cities?q=del
router.get('/cities', (req: Request, res: Response) => {
  try {
    const query = ((req.query.q as string) || '').toLowerCase().trim();

    if (!query) {
      return ApiResponseUtil.success(res, citiesData.slice(0, 10));
    }

    // First: cities starting with query, then: cities containing query
    const startsWithMatches = citiesData.filter(
      (c: any) => c.name.toLowerCase().startsWith(query)
    );
    const includesMatches = citiesData.filter(
      (c: any) => !c.name.toLowerCase().startsWith(query) && c.name.toLowerCase().includes(query)
    );

    const results = [...startsWithMatches, ...includesMatches].slice(0, 10);

    return ApiResponseUtil.success(res, results);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to search cities', 500);
  }
});

// GET /api/public/jobs — paginated public job listing (no contact details)
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const {
      city,
      category,
      employment_type,
      is_remote,
      min_salary,
      max_salary,
      experience_level,
      qualification,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));

    let query = supabase
      .from('jobs')
      .select('id, title, description, job_type, employment_type, city, state, pincode, salary_min, salary_max, salary_type, required_skills, experience_required, education_required, vacancies, benefits, working_hours, status, is_remote, views_count, created_at, expiry_date, employer_id', { count: 'exact' })
      .eq('status', 'open');

    if (city) query = query.ilike('city', `%${city}%`);
    if (category) query = query.eq('job_type', category);
    if (employment_type) query = query.eq('employment_type', employment_type);
    if (is_remote === 'true') query = query.eq('is_remote', true);
    if (min_salary) query = query.gte('salary_min', parseInt(min_salary as string, 10));
    if (max_salary) query = query.lte('salary_max', parseInt(max_salary as string, 10));
    if (experience_level) query = query.lte('experience_required', parseInt(experience_level as string, 10));
    if (qualification) query = query.eq('education_required', qualification);

    const { data: jobs, error, count } = await query
      .order('created_at', { ascending: false })
      .range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

    if (error) throw error;

    // Attach employer info (business_name, verification badge only — no contact details)
    if (jobs && jobs.length > 0) {
      const employerIds = [...new Set(jobs.map((j: any) => j.employer_id))];
      const { data: employers } = await supabase
        .from('employer_profiles')
        .select('user_id, business_name, company_logo_url, verification_status')
        .in('user_id', employerIds);

      const jobsWithEmployers = jobs.map((job: any) => {
        const emp = employers?.find((e: any) => e.user_id === job.employer_id);
        return {
          ...job,
          employer: emp
            ? {
                business_name: emp.business_name,
                logo_url: emp.company_logo_url || null,
                is_verified: emp.verification_status === 'approved',
              }
            : null,
          // Explicitly remove employer_id from public response
          employer_id: undefined,
        };
      });

      return ApiResponseUtil.paginated(res, jobsWithEmployers, pageNum, limitNum, count || 0);
    }

    return ApiResponseUtil.paginated(res, [], pageNum, limitNum, 0);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to fetch jobs', 500);
  }
});

// GET /api/public/jobs/:jobId — single job detail (no contact info)
router.get('/jobs/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const { data: job, error } = await supabase
      .from('jobs')
      .select('id, title, description, job_type, employment_type, city, state, pincode, salary_min, salary_max, salary_type, required_skills, experience_required, education_required, vacancies, benefits, working_hours, status, is_remote, views_count, created_at, expiry_date, employer_id')
      .eq('id', jobId)
      .eq('status', 'open')
      .single();

    if (error || !job) {
      return ApiResponseUtil.notFound(res, 'Job not found');
    }

    // Employer info without contact details
    const { data: employer } = await supabase
      .from('employer_profiles')
      .select('business_name, company_logo_url, verification_status, city, state, description, industry, employee_count')
      .eq('user_id', job.employer_id)
      .single();

    // Increment views
    await supabase.from('jobs').update({ views_count: (job.views_count || 0) + 1 }).eq('id', jobId);

    return ApiResponseUtil.success(res, {
      ...job,
      employer_id: undefined,
      employer: employer
        ? {
            business_name: employer.business_name,
            logo_url: employer.company_logo_url || null,
            is_verified: employer.verification_status === 'approved',
            city: employer.city,
            state: employer.state,
            description: employer.description,
            industry: employer.industry,
            employee_count: employer.employee_count,
          }
        : null,
    });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to fetch job', 500);
  }
});

// GET /api/public/faq
router.get('/faq', (req: Request, res: Response) => {
  return ApiResponseUtil.success(res, faqData);
});

// GET /api/public/testimonials
router.get('/testimonials', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return ApiResponseUtil.success(res, data || []);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to fetch testimonials', 500);
  }
});

// GET /api/public/employer-logos
router.get('/employer-logos', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('employer_profiles')
      .select('business_name, company_logo_url')
      .eq('verification_status', 'approved')
      .not('company_logo_url', 'is', null)
      .limit(20);

    if (error) throw error;

    const logos = (data || []).map((e: any) => ({
      business_name: e.business_name,
      logo_url: e.company_logo_url,
    }));

    return ApiResponseUtil.success(res, logos);
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to fetch employer logos', 500);
  }
});

export default router;
