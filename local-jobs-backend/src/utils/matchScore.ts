interface WorkerProfile {
  skills?: string[];
  city?: string;
  state?: string;
  experience_years?: number;
  minimum_salary?: number;
  expected_salary?: number;
}

interface Job {
  required_skills?: string[];
  city?: string;
  state?: string;
  experience_required?: number;
  salary_min?: number;
  salary_max?: number;
}

export function calculateMatchScore(workerProfile: WorkerProfile, job: Job): number {
  let score = 0;

  // Skills match: 40pts (intersection / union of skills)
  score += calculateSkillsScore(workerProfile.skills || [], job.required_skills || []);

  // Location match: 30pts (same city=30, same state=15)
  score += calculateLocationScore(workerProfile, job);

  // Experience match: 20pts (exact=20, within 1yr=15, within 2yr=10)
  score += calculateExperienceScore(workerProfile.experience_years, job.experience_required);

  // Salary match: 10pts (worker expected within job budget=10, within 110%=5)
  score += calculateSalaryScore(workerProfile, job);

  return Math.min(Math.round(score), 100);
}

function calculateSkillsScore(workerSkills: string[], jobSkills: string[]): number {
  if (jobSkills.length === 0 || workerSkills.length === 0) {
    return 20; // Partial score if no skills listed
  }

  const normalizedWorker = workerSkills.map(s => s.toLowerCase().trim());
  const normalizedJob = jobSkills.map(s => s.toLowerCase().trim());

  const intersection = normalizedWorker.filter(s => normalizedJob.includes(s));
  const unionSet = new Set([...normalizedWorker, ...normalizedJob]);

  if (unionSet.size === 0) return 20;

  const ratio = intersection.length / unionSet.size;
  return Math.round(ratio * 40);
}

function calculateLocationScore(worker: WorkerProfile, job: Job): number {
  if (!worker.city && !job.city) return 15;

  const workerCity = (worker.city || '').toLowerCase().trim();
  const jobCity = (job.city || '').toLowerCase().trim();
  const workerState = (worker.state || '').toLowerCase().trim();
  const jobState = (job.state || '').toLowerCase().trim();

  if (workerCity && jobCity && workerCity === jobCity) {
    return 30;
  }

  if (workerState && jobState && workerState === jobState) {
    return 15;
  }

  return 0;
}

function calculateExperienceScore(workerExp?: number, jobExp?: number): number {
  if (workerExp === undefined || workerExp === null || jobExp === undefined || jobExp === null) {
    return 10; // Partial score when data missing
  }

  const diff = Math.abs(workerExp - jobExp);

  if (diff === 0 || workerExp >= jobExp) {
    return 20;
  }

  if (diff <= 1) {
    return 15;
  }

  if (diff <= 2) {
    return 10;
  }

  return 0;
}

function calculateSalaryScore(worker: WorkerProfile, job: Job): number {
  const workerExpected = worker.minimum_salary || worker.expected_salary;

  if (!workerExpected || !job.salary_max) {
    return 5; // Partial score when data missing
  }

  if (workerExpected <= job.salary_max) {
    return 10;
  }

  // Within 110% of budget
  if (workerExpected <= job.salary_max * 1.1) {
    return 5;
  }

  return 0;
}
