import React, { useEffect, useState } from 'react';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getAdminDashboard, getPendingJobs, getPendingVerifications, approveJob, rejectJob, verifyWorker, verifyEmployer } from '../services/admin';

type TabType = 'pending' | 'approved' | 'rejected' | 'all';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  const [allEmployers, setAllEmployers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [workerTab, setWorkerTab] = useState<TabType>('pending');
  const [employerTab, setEmployerTab] = useState<TabType>('pending');

  const loadData = async () => {
    setError('');
    try {
      const [statsData, allData, jobsData] = await Promise.all([
        getAdminDashboard(),
        getPendingVerifications(),
        getPendingJobs(),
      ]);
      setStats(statsData);
      setAllWorkers(allData?.workers || []);
      setAllEmployers(allData?.employers || []);
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

  const filterWorkers = (tab: TabType) => {
    if (tab === 'all') return allWorkers;
    return allWorkers.filter(w => {
      if (tab === 'pending') return w.verification_status === 'pending';
      if (tab === 'approved') return w.verification_status === 'approved';
      if (tab === 'rejected') return w.verification_status === 'rejected';
      return true;
    });
  };

  const filterEmployers = (tab: TabType) => {
    if (tab === 'all') return allEmployers;
    return allEmployers.filter(e => {
      if (tab === 'pending') return e.verification_status === 'pending';
      if (tab === 'approved') return e.verification_status === 'approved';
      if (tab === 'rejected') return e.verification_status === 'rejected';
      return true;
    });
  };

  const filteredWorkers = filterWorkers(workerTab);
  const filteredEmployers = filterEmployers(employerTab);

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">✓ Approved</span>;
    if (status === 'rejected') return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">✗ Rejected</span>;
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">⏳ Pending</span>;
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Worker Verifications</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setWorkerTab('pending')}
                className={`px-3 py-1 text-sm rounded ${workerTab === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Pending ({allWorkers.filter(w => w.verification_status === 'pending').length})
              </button>
              <button
                onClick={() => setWorkerTab('approved')}
                className={`px-3 py-1 text-sm rounded ${workerTab === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Approved ({allWorkers.filter(w => w.verification_status === 'approved').length})
              </button>
              <button
                onClick={() => setWorkerTab('rejected')}
                className={`px-3 py-1 text-sm rounded ${workerTab === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Rejected ({allWorkers.filter(w => w.verification_status === 'rejected').length})
              </button>
              <button
                onClick={() => setWorkerTab('all')}
                className={`px-3 py-1 text-sm rounded ${workerTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                All ({allWorkers.length})
              </button>
            </div>
          </div>
          {filteredWorkers.length === 0 ? (
            <p className="text-gray-500">No workers in this category.</p>
          ) : (
            <div className="space-y-4">
              {filteredWorkers.map((worker: any) => (
                <div key={worker.user_id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-lg font-semibold">{worker.full_name}</p>
                        {getStatusBadge(worker.verification_status)}
                      </div>
                      <p className="text-sm text-gray-600">Phone: {worker.users?.phone || 'N/A'}</p>
                      <p className="text-xs text-gray-500">Registered: {new Date(worker.created_at).toLocaleDateString()}</p>
                    </div>
                    {worker.verification_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button variant="primary" onClick={() => handleVerifyWorker(worker.user_id, 'approved')}>Approve</Button>
                        <Button variant="danger" onClick={() => handleVerifyWorker(worker.user_id, 'rejected')}>Reject</Button>
                      </div>
                    )}
                    {worker.verification_status === 'rejected' && (
                      <Button variant="primary" onClick={() => handleVerifyWorker(worker.user_id, 'approved')}>Re-Approve</Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div><span className="font-medium">City:</span> {worker.city || 'N/A'}</div>
                    <div><span className="font-medium">State:</span> {worker.state || 'N/A'}</div>
                    <div><span className="font-medium">Experience:</span> {worker.experience_years || 0} years</div>
                    <div><span className="font-medium">Gender:</span> {worker.gender || 'N/A'}</div>
                  </div>

                  {worker.skills && worker.skills.length > 0 && (
                    <div className="mb-3">
                      <span className="font-medium text-sm">Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {worker.skills.map((skill: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-3 mt-3">
                    <p className="font-medium text-sm mb-2">Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      {worker.aadhaar_front_url && (
                        <a href={worker.aadhaar_front_url} target="_blank" rel="noopener noreferrer"
                           className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200">
                          📄 Aadhaar Front
                        </a>
                      )}
                      {worker.aadhaar_back_url && (
                        <a href={worker.aadhaar_back_url} target="_blank" rel="noopener noreferrer"
                           className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200">
                          📄 Aadhaar Back
                        </a>
                      )}
                      {worker.photo_url && (
                        <a href={worker.photo_url} target="_blank" rel="noopener noreferrer"
                           className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200">
                          📷 Photo
                        </a>
                      )}
                      {worker.resume_url && (
                        <a href={worker.resume_url} target="_blank" rel="noopener noreferrer"
                           className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded hover:bg-purple-200">
                          📑 Resume
                        </a>
                      )}
                      {!worker.aadhaar_front_url && !worker.aadhaar_back_url && !worker.photo_url && !worker.resume_url && (
                        <span className="text-gray-500 text-xs">No documents uploaded</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Employer Verifications</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setEmployerTab('pending')}
                className={`px-3 py-1 text-sm rounded ${employerTab === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Pending ({allEmployers.filter(e => e.verification_status === 'pending').length})
              </button>
              <button
                onClick={() => setEmployerTab('approved')}
                className={`px-3 py-1 text-sm rounded ${employerTab === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Approved ({allEmployers.filter(e => e.verification_status === 'approved').length})
              </button>
              <button
                onClick={() => setEmployerTab('rejected')}
                className={`px-3 py-1 text-sm rounded ${employerTab === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Rejected ({allEmployers.filter(e => e.verification_status === 'rejected').length})
              </button>
              <button
                onClick={() => setEmployerTab('all')}
                className={`px-3 py-1 text-sm rounded ${employerTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                All ({allEmployers.length})
              </button>
            </div>
          </div>
          {filteredEmployers.length === 0 ? (
            <p className="text-gray-500">No employers in this category.</p>
          ) : (
            <div className="space-y-4">
              {filteredEmployers.map((employer: any) => (
                <div key={employer.user_id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-lg font-semibold">{employer.business_name}</p>
                        {getStatusBadge(employer.verification_status)}
                      </div>
                      <p className="text-sm text-gray-600">Phone: {employer.users?.phone || 'N/A'}</p>
                      <p className="text-xs text-gray-500">Registered: {new Date(employer.created_at).toLocaleDateString()}</p>
                    </div>
                    {employer.verification_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button variant="primary" onClick={() => handleVerifyEmployer(employer.user_id, 'approved')}>Approve</Button>
                        <Button variant="danger" onClick={() => handleVerifyEmployer(employer.user_id, 'rejected')}>Reject</Button>
                      </div>
                    )}
                    {employer.verification_status === 'rejected' && (
                      <Button variant="primary" onClick={() => handleVerifyEmployer(employer.user_id, 'approved')}>Re-Approve</Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div><span className="font-medium">Business Type:</span> {employer.business_type || 'N/A'}</div>
                    <div><span className="font-medium">Industry:</span> {employer.industry || 'N/A'}</div>
                    <div><span className="font-medium">City:</span> {employer.city || 'N/A'}</div>
                    <div><span className="font-medium">State:</span> {employer.state || 'N/A'}</div>
                    <div><span className="font-medium">GST:</span> {employer.gst_number || 'N/A'}</div>
                    <div><span className="font-medium">PAN:</span> {employer.pan_number || 'N/A'}</div>
                  </div>

                  {employer.description && (
                    <div className="mb-3 text-sm">
                      <span className="font-medium">Description:</span>
                      <p className="text-gray-600 mt-1">{employer.description}</p>
                    </div>
                  )}

                  <div className="border-t pt-3 mt-3">
                    <p className="font-medium text-sm mb-2">Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      {employer.gst_certificate_url && (
                        <a href={employer.gst_certificate_url} target="_blank" rel="noopener noreferrer"
                           className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200">
                          📄 GST Certificate
                        </a>
                      )}
                      {employer.business_license_url && (
                        <a href={employer.business_license_url} target="_blank" rel="noopener noreferrer"
                           className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200">
                          📄 Business License
                        </a>
                      )}
                      {employer.pan_card_url && (
                        <a href={employer.pan_card_url} target="_blank" rel="noopener noreferrer"
                           className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200">
                          📄 PAN Card
                        </a>
                      )}
                      {!employer.gst_certificate_url && !employer.business_license_url && !employer.pan_card_url && (
                        <span className="text-gray-500 text-xs">No documents uploaded</span>
                      )}
                    </div>
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
