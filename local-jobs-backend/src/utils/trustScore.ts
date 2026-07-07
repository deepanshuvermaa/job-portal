import { SupabaseClient } from '@supabase/supabase-js';

export async function calculateTrustScore(userId: string, supabase: SupabaseClient): Promise<number> {
  let score = 0;

  // Try worker profile first, then employer profile
  const { data: workerProfile } = await supabase
    .from('worker_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  const profile = workerProfile || employerProfile;

  if (!profile) {
    return 0;
  }

  // has_photo (+10)
  const photoUrl = profile.photo_url || profile.company_logo_url;
  if (photoUrl) {
    score += 10;
  }

  // has_aadhaar (+15) — workers only
  if (workerProfile) {
    if (workerProfile.aadhaar_front_url || workerProfile.aadhaar_number) {
      score += 15;
    }

    // aadhaar_verified (+10) — workers only
    if (workerProfile.ocr_verified === true || workerProfile.verification_status === 'approved') {
      score += 10;
    }
  }

  // For employers: GST/PAN verification equivalent
  if (employerProfile) {
    if (employerProfile.gst_number || employerProfile.gst_certificate_url) {
      score += 15;
    }
    if (employerProfile.verification_status === 'approved') {
      score += 10;
    }
  }

  // profile_complete_80pct (+15)
  const completeness = calculateProfileCompleteness(profile, !!workerProfile);
  if (completeness >= 80) {
    score += 15;
  }

  // has_reviews (+10)
  const { count: reviewCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('reviewee_id', userId);

  if (reviewCount && reviewCount > 0) {
    score += 10;
  }

  // avg_rating_above_4 (+10)
  if (workerProfile && workerProfile.average_rating && workerProfile.average_rating >= 4) {
    score += 10;
  }
  if (employerProfile && employerProfile.average_rating && employerProfile.average_rating >= 4) {
    score += 10;
  }

  // account_age_30d (+10)
  const { data: user } = await supabase
    .from('users')
    .select('created_at')
    .eq('id', userId)
    .single();

  if (user) {
    const accountAge = Date.now() - new Date(user.created_at).getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    if (accountAge >= 30 * dayMs) {
      score += 10;
    }

    // account_age_90d (+10)
    if (accountAge >= 90 * dayMs) {
      score += 10;
    }
  }

  // no_reports (+10)
  const { count: reportCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('reported_user_id', userId)
    .eq('status', 'resolved');

  if (!reportCount || reportCount === 0) {
    score += 10;
  }

  return Math.min(score, 100);
}

function calculateProfileCompleteness(profile: any, isWorker: boolean): number {
  if (isWorker) {
    const fields = [
      'full_name', 'city', 'state', 'pincode', 'address',
      'skills', 'experience_years', 'bio', 'photo_url',
      'preferred_job_types', 'preferred_locations',
    ];
    const filled = fields.filter(f => {
      const val = profile[f];
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === 'number') return true;
      return val && val !== '';
    }).length;
    return Math.round((filled / fields.length) * 100);
  } else {
    const fields = [
      'business_name', 'business_type', 'city', 'state', 'pincode',
      'address', 'description', 'industry', 'employee_count',
    ];
    const filled = fields.filter(f => {
      const val = profile[f];
      if (typeof val === 'number') return true;
      return val && val !== '';
    }).length;
    return Math.round((filled / fields.length) * 100);
  }
}

export function shouldAutoApprove(score: number): boolean {
  return score > 70;
}
