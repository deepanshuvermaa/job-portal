import React, { useEffect, useState } from 'react';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getAdminDashboard, getPendingJobs, getPendingVerifications, approveJob, rejectJob, verifyWorker, verifyEmployer } from '../services/admin';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<any>({ workers: [], employers: [] });
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState('');

  const loadData = async () => {
    setError('');
    try {
      const [statsData, pendingData, jobsData] = await Promise.all([
        getAdminDashboard(),
        getPendingVerifications(),
        getPendingJobs(),
      ]);
      setStats(statsData);
      setPending(pendingData || { workers: [], employers: [] });
      setJobs(jobsData || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load admin dashboard');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyWorker = async (userId: string, status: string) => {
    await verifyWorker(userId, { status });
    await loadData();
  };

  const handleVerifyEmployer = async (userId: string, status: string) => {
    await verifyEmployer(userId, { status });
    await loadData();
  };

  const handleJobAction = async (jobId: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      await approveJob(jobId);
    } else {
      await rejectJob(jobId);
    }
    await loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><p className="text-sm text-gray-500">Workers</p><p className="text-2xl font-bold">{stats.totalWorkers}</p></Card>
            <Card><p className="text-sm text-gray-500">Employers</p><p className="text-2xl font-bold">{stats.totalEmployers}</p></Card>
            <Card><p className="text-sm text-gray-500">Jobs</p><p className="text-2xl font-bold">{stats.totalJobs}</p></Card>
            <Card><p className="text-sm text-gray-500">Applications</p><p className="text-2xl font-bold">{stats.totalApplications}</p></Card>
          </div>
        )}

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Worker Verifications</h2>
          {pending.workers?.length === 0 ? (
            <p className="text-gray-500">No pending workers.</p>
          ) : (
            <div className="space-y-3">
              {pending.workers.map((worker: any) => (
                <div key={worker.user_id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-semibold">{worker.full_name}</p>
                    <p className="text-sm text-gray-500">{worker.city || 'City not set'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" onClick={() => handleVerifyWorker(worker.user_id, 'approved')}>Approve</Button>
                    <Button variant="danger" onClick={() => handleVerifyWorker(worker.user_id, 'rejected')}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Employer Verifications</h2>
          {pending.employers?.length === 0 ? (
            <p className="text-gray-500">No pending employers.</p>
          ) : (
            <div className="space-y-3">
              {pending.employers.map((employer: any) => (
                <div key={employer.user_id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-semibold">{employer.business_name}</p>
                    <p className="text-sm text-gray-500">{employer.city || 'City not set'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" onClick={() => handleVerifyEmployer(employer.user_id, 'approved')}>Approve</Button>
                    <Button variant="danger" onClick={() => handleVerifyEmployer(employer.user_id, 'rejected')}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Job Approvals</h2>
          {jobs.length === 0 ? (
            <p className="text-gray-500">No pending jobs.</p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-semibold">{job.title}</p>
                    <p className="text-sm text-gray-500">{job.city}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" onClick={() => handleJobAction(job.id, 'approve')}>Approve</Button>
                    <Button variant="danger" onClick={() => handleJobAction(job.id, 'reject')}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
