import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getWorkerApplications } from '../services/jobs';
import { VerificationBadge } from '../components/shared/VerificationBadge';
import { ApplicationTimeline } from '../components/shared/ApplicationTimeline';

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
    <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24">
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
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {app.jobs?.title || 'Job'}
                      </h3>

                      {app.jobs?.employer_profiles && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span>{app.jobs.employer_profiles.business_name}</span>
                          <VerificationBadge
                            isVerified={app.jobs.employer_profiles.user?.is_verified}
                            size="sm"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>📍 {app.jobs?.city}</span>
                        <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Link to={`/worker/jobs/${app.job_id}`}>
                      <Button variant="outline" size="sm">
                        View Job
                      </Button>
                    </Link>
                  </div>

                  <ApplicationTimeline
                    currentStatus={app.status}
                    createdAt={app.created_at}
                    updatedAt={app.updated_at}
                  />

                  {app.employer_notes && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Employer Note:</p>
                      <p className="text-sm text-blue-700">{app.employer_notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
