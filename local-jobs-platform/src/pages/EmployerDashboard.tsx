import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getEmployerJobs } from '../services/jobs';
import { getEmployerProfile } from '../services/profiles';

export const EmployerDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [jobsData, profileData] = await Promise.all([
          getEmployerJobs(),
          getEmployerProfile(),
        ]);
        if (active) {
          setJobs(jobsData || []);
          setProfile(profileData);
        }
      } catch (err: any) {
        if (active) setError(err?.response?.data?.error || 'Failed to load dashboard');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
            <p className="text-gray-600">Welcome back{profile?.business_name ? `, ${profile.business_name}` : ''}.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/employer/post-job">
              <Button variant="primary">Post a Job</Button>
            </Link>
            <Link to="/notifications">
              <Button variant="outline">Notifications</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <h2 className="text-sm text-gray-500">Total Jobs</h2>
            <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
          </Card>
          <Card>
            <h2 className="text-sm text-gray-500">Verification Status</h2>
            <p className="text-2xl font-bold text-gray-900 capitalize">{profile?.verification_status || 'pending'}</p>
          </Card>
          <Card>
            <h2 className="text-sm text-gray-500">Total Applications</h2>
            <p className="text-2xl font-bold text-gray-900">
              {jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0)}
            </p>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
            <Link to="/employer/jobs" className="text-sm text-primary-600">View all</Link>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p className="text-gray-500">No jobs posted yet.</p>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-500">{job.city} ? {job.status}</p>
                  </div>
                  <Link to={`/employer/jobs/${job.id}/applications`} className="text-sm text-primary-600">
                    View applications
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
