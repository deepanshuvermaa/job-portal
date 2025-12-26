import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getEmployerJobApplications, updateApplicationStatus } from '../services/jobs';

export const EmployerJobApplications: React.FC = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadApplications = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const data = await getEmployerJobApplications(jobId);
      setApplications(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  const handleStatusChange = async (applicationId: string, status: string) => {
    try {
      await updateApplicationStatus(applicationId, { status });
      await loadApplications();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update application');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="text-gray-500">No applications yet.</p>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{app.worker_profiles?.full_name || 'Worker'}</p>
                    <p className="text-sm text-gray-500">Status: {app.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleStatusChange(app.id, 'shortlisted')}>
                      Shortlist
                    </Button>
                    <Button variant="danger" onClick={() => handleStatusChange(app.id, 'rejected')}>
                      Reject
                    </Button>
                    <Button variant="primary" onClick={() => handleStatusChange(app.id, 'hired')}>
                      Hire
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
