import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { searchJobs } from '../services/jobs';
import { getWorkerProfile } from '../services/profiles';
import { JOB_CATEGORIES } from '../utils/constants';
import { updateSEO, SEO_PRESETS } from '../utils/seo';
import { useAppStore } from '../store/appStore';

export const JobFeed: React.FC = () => {
  const { language } = useAppStore();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');
  const [jobType, setJobType] = useState('');

  const loadJobs = async (params: Record<string, any>) => {
    setLoading(true);
    setError('');
    try {
      const data = await searchJobs(params);
      setJobs(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        const profile = await getWorkerProfile();
        if (!active) return;
        const profileCity = profile?.city || '';
        setCity(profileCity);
        await loadJobs({ city: profileCity || undefined });
      } catch {
        await loadJobs({});
      }
    };

    init();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const titleCity = city || 'India';
    updateSEO(SEO_PRESETS.jobSearch(titleCity, language));
  }, [city, language]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Jobs</h1>
          <p className="text-gray-600">Browse jobs near you.</p>
        </div>

        <Card className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                className="input-field"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option value="">All Categories</option>
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="primary"
                fullWidth
                onClick={() => loadJobs({ city: city || undefined, jobType: jobType || undefined })}
              >
                Search
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-500">No jobs found.</p>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                    <p className="text-sm text-gray-600">{job.city} ? {job.employment_type}</p>
                    <p className="text-sm text-gray-600">Salary: {job.salary_min || 'N/A'} - {job.salary_max || 'N/A'}</p>
                  </div>
                  <Link to={`/worker/jobs/${job.id}`} className="text-primary-600 text-sm">View details</Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
