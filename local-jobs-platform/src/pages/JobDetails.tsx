import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { applyToJob, getJob } from '../services/jobs';
import { updateSEO, SEO_PRESETS, generateJobPostingSchema } from '../utils/seo';
import { useAppStore } from '../store/appStore';

export const JobDetails: React.FC = () => {
  const { jobId } = useParams();
  const { language } = useAppStore();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!jobId) return;
      setLoading(true);
      try {
        const data = await getJob(jobId);
        if (active) setJob(data);
      } catch (err: any) {
        if (active) setError(err?.response?.data?.error || 'Failed to load job');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [jobId]);

  useEffect(() => {
    if (!job) return;
    updateSEO(SEO_PRESETS.jobPosting(job.title, job.city || 'India', language));

    const schema = generateJobPostingSchema({
      title: job.title,
      description: job.description,
      company: job.employer_profiles?.business_name || 'Employer',
      location: { city: job.city || 'India', area: job.location || '' },
      salary: { min: job.salary_min || 0, max: job.salary_max || 0, type: job.salary_type || 'monthly' },
      datePosted: job.created_at || new Date().toISOString(),
      employmentType: job.employment_type || 'full-time',
    });

    const existing = document.getElementById('job-schema');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'job-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const current = document.getElementById('job-schema');
      if (current) current.remove();
    };
  }, [job, language]);

  const handleApply = async () => {
    if (!jobId) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await applyToJob(jobId, {
        cover_letter: coverLetter || null,
        expected_salary: expectedSalary ? Number(expectedSalary) : null,
      });
      setSuccess('Application submitted successfully.');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to apply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {loading ? (
          <p className="text-gray-500">Loading job...</p>
        ) : job ? (
          <>
            <Card>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-gray-600">{job.city} ? {job.employment_type}</p>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p><strong>Description:</strong> {job.description}</p>
                <p><strong>Salary:</strong> {job.salary_min || 'N/A'} - {job.salary_max || 'N/A'} ({job.salary_type || 'N/A'})</p>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Required Skills:</strong> {job.required_skills?.join(', ') || 'Not specified'}</p>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Apply for this job</h2>
              {error && (
                <div className="mb-3 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-3 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                  {success}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Letter (optional)</label>
                  <textarea
                    className="input-field min-h-[120px]"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Introduce yourself and your experience"
                  />
                </div>
                <Input
                  type="number"
                  label="Expected Salary (optional)"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  placeholder="15000"
                />
                <Button variant="primary" onClick={handleApply} loading={submitting}>
                  Apply Now
                </Button>
              </div>
            </Card>
          </>
        ) : (
          <p className="text-gray-500">Job not found.</p>
        )}
      </div>
    </div>
  );
};
