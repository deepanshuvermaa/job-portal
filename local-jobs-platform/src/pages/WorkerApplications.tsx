import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { getWorkerApplications } from '../services/jobs';

export const WorkerApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getWorkerApplications();
        if (active) setApplications(data || []);
      } catch (err: any) {
        if (active) setError(err?.response?.data?.error || 'Failed to load applications');
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
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="text-gray-500">No applications found.</p>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{app.jobs?.title || 'Job'}</p>
                    <p className="text-sm text-gray-500">Status: {app.status}</p>
                  </div>
                  <Link to={`/worker/jobs/${app.job_id}`} className="text-sm text-primary-600">
                    View job
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
