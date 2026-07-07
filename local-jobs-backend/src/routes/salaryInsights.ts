import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import ApiResponseUtil from '../utils/response';

const router = Router();

// GET /api/public/salary-insights?job_type=X&city=Y
router.get('/', async (req: Request, res: Response) => {
  try {
    const { job_type, city } = req.query;

    if (!job_type && !city) {
      return ApiResponseUtil.error(res, 'At least one of job_type or city is required');
    }

    // Build query for open jobs with salary data
    let query = supabase
      .from('jobs')
      .select('salary_min, salary_max, job_type, city')
      .eq('status', 'open')
      .not('salary_min', 'is', null)
      .not('salary_max', 'is', null);

    if (job_type) {
      query = query.eq('job_type', job_type);
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    const { data: jobs, error } = await query;

    if (error) throw error;

    if (!jobs || jobs.length === 0) {
      return ApiResponseUtil.success(res, {
        avg_salary: 0,
        min_salary: 0,
        max_salary: 0,
        sample_size: 0,
        job_type: job_type || null,
        city: city || null,
      });
    }

    // Calculate aggregated salary data
    const salaries = jobs.map(j => ({
      min: j.salary_min as number,
      max: j.salary_max as number,
      avg: ((j.salary_min as number) + (j.salary_max as number)) / 2,
    }));

    const allMins = salaries.map(s => s.min);
    const allMaxes = salaries.map(s => s.max);
    const allAvgs = salaries.map(s => s.avg);

    const avgSalary = Math.round(allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length);
    const minSalary = Math.min(...allMins);
    const maxSalary = Math.max(...allMaxes);

    return ApiResponseUtil.success(res, {
      avg_salary: avgSalary,
      min_salary: minSalary,
      max_salary: maxSalary,
      sample_size: jobs.length,
      job_type: job_type || null,
      city: city || null,
    });
  } catch (error: any) {
    return ApiResponseUtil.error(res, error.message || 'Failed to fetch salary insights', 500);
  }
});

export default router;
