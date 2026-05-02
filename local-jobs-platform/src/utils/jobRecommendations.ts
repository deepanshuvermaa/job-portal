import type { Job, User } from '../types';

interface JobWithScore extends Job {
  matchScore: number;
}

/**
 * Calculate match score between a worker and a job
 * Score ranges from 0-100
 */
export const calculateMatchScore = (worker: User, job: Job): number => {
  let score = 0;

  // 1. Skills Match (40 points)
  if ((worker as any).skills && (job as any).required_skills) {
    const workerSkills = (worker as any).skills.map(s => s.toLowerCase());
    const jobSkills = (job as any).required_skills.map(s => s.toLowerCase());
    const matchingSkills = workerSkills.filter(ws =>
      jobSkills.some(js => js.includes(ws) || ws.includes(js))
    );
    const skillMatchPercentage = matchingSkills.length / Math.max(jobSkills.length, 1);
    score += skillMatchPercentage * 40;
  }

  // 2. Location Match (30 points)
  if ((worker as any).city && job.location) {
    const workerCity = (worker as any).city.toLowerCase().trim();
    const jobCity = (job.location.city || '').toLowerCase().trim();

    if (workerCity === jobCity) {
      score += 30; // Same city - perfect match
    } else if ((worker as any).state === (job.location as any)?.state) {
      score += 15; // Same state - half points
    }
  }

  // 3. Experience Match (20 points)
  if ((job as any).experience_required !== undefined && (worker as any).experience_years !== undefined) {
    const expDiff = Math.abs((worker as any).experience_years - (job as any).experience_required);
    if (expDiff === 0) {
      score += 20; // Exact match
    } else if (expDiff <= 1) {
      score += 15; // Close match
    } else if (expDiff <= 2) {
      score += 10; // Acceptable
    }
  }

  // 4. Salary Match (10 points)
  if (job.salaryMax && (worker as any).expected_salary) {
    if ((worker as any).expected_salary <= job.salaryMax) {
      score += 10; // Salary expectations match
    } else if ((worker as any).expected_salary <= job.salaryMax * 1.1) {
      score += 5; // Close to budget
    }
  }

  return Math.min(100, Math.round(score));
};

/**
 * Get recommended jobs for a worker
 * Returns jobs sorted by match score (highest first)
 */
export const getRecommendedJobs = (
  worker: User,
  allJobs: Job[],
  minScore: number = 60
): JobWithScore[] => {
  return allJobs
    .map(job => ({
      ...job,
      matchScore: calculateMatchScore(worker, job)
    }))
    .filter(job => job.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore);
};

/**
 * Get match badge color based on score
 */
export const getMatchBadgeColor = (score: number): string => {
  if (score >= 80) return 'bg-green-100 text-green-700 border-green-200';
  if (score >= 60) return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-yellow-100 text-yellow-700 border-yellow-200';
};

/**
 * Get match description
 */
export const getMatchDescription = (score: number): string => {
  if (score >= 90) return 'Perfect Match';
  if (score >= 75) return 'Excellent Match';
  if (score >= 60) return 'Good Match';
  return 'Fair Match';
};
