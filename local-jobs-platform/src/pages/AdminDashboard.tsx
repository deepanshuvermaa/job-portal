import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getAdminDashboard, getPendingJobs, getPendingVerifications, approveJob, rejectJob, verifyWorker, verifyEmployer } from '../services/admin';

type TabType = 'pending' | 'approved' | 'rejected' | 'all';
type MainTabType = 'overview' | 'workers' | 'employers' | 'jobs' | 'connections';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  const [allEmployers, setAllEmployers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [mainTab, setMainTab] = useState<MainTabType>('overview');
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        {/* Main Navigation Tabs */}
        <div className="bg-white border-b">
          <nav className="flex gap-1 px-6">
            <button
              onClick={() => setMainTab('overview')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                mainTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setMainTab('workers')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                mainTab === 'workers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              👷 Workers
              {allWorkers.filter(w => w.verification_status === 'pending').length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                  {allWorkers.filter(w => w.verification_status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setMainTab('employers')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                mainTab === 'employers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🏢 Employers
              {allEmployers.filter(e => e.verification_status === 'pending').length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                  {allEmployers.filter(e => e.verification_status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setMainTab('jobs')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                mainTab === 'jobs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              💼 Jobs
              {jobs.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                  {jobs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setMainTab('connections')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                mainTab === 'connections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🔗 Connections
              {stats?.totalApplications > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {stats.totalApplications}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Overview Tab */}
          {mainTab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMainTab('workers')}>
                  <p className="text-sm text-gray-500">Total Workers</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalWorkers}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {allWorkers.filter(w => w.verification_status === 'pending').length} pending
                  </p>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMainTab('employers')}>
                  <p className="text-sm text-gray-500">Total Employers</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalEmployers}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {allEmployers.filter(e => e.verification_status === 'pending').length} pending
                  </p>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMainTab('jobs')}>
                  <p className="text-sm text-gray-500">Total Jobs</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
                  <p className="text-xs text-yellow-600 mt-1">{jobs.length} pending approval</p>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMainTab('connections')}>
                  <p className="text-sm text-gray-500">Applications</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
                  <p className="text-xs text-blue-600 mt-1">Click to view connections</p>
                </Card>
              </div>

              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setMainTab('workers')}
                    className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">Review Workers</div>
                    <div className="text-sm text-gray-500">
                      {allWorkers.filter(w => w.verification_status === 'pending').length} pending verification
                    </div>
                  </button>
                  <button
                    onClick={() => setMainTab('employers')}
                    className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">Review Employers</div>
                    <div className="text-sm text-gray-500">
                      {allEmployers.filter(e => e.verification_status === 'pending').length} pending verification
                    </div>
                  </button>
                  <button
                    onClick={() => setMainTab('jobs')}
                    className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">Approve Jobs</div>
                    <div className="text-sm text-gray-500">{jobs.length} jobs awaiting approval</div>
                  </button>
                  <button
                    onClick={() => setMainTab('connections')}
                    className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">Manage Connections</div>
                    <div className="text-sm text-gray-500">Review application requests</div>
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* Workers Tab */}
          {mainTab === 'workers' && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Worker Verifications</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWorkerTab('pending')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      workerTab === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pending ({allWorkers.filter(w => w.verification_status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setWorkerTab('approved')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      workerTab === 'approved'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Approved ({allWorkers.filter(w => w.verification_status === 'approved').length})
                  </button>
                  <button
                    onClick={() => setWorkerTab('rejected')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      workerTab === 'rejected'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Rejected ({allWorkers.filter(w => w.verification_status === 'rejected').length})
                  </button>
                  <button
                    onClick={() => setWorkerTab('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      workerTab === 'all'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({allWorkers.length})
                  </button>
                </div>
              </div>

              {filteredWorkers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No workers in this category</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredWorkers.map((worker: any) => (
                        <tr key={worker.user_id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">{worker.full_name}</div>
                            <div className="text-xs text-gray-500">Registered: {new Date(worker.created_at).toLocaleDateString()}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">{worker.users?.phone || 'N/A'}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            {worker.city}, {worker.state || 'N/A'}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {worker.skills?.slice(0, 3).map((skill: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                              {worker.skills?.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{worker.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">{worker.experience_years || 0} yrs</td>
                          <td className="px-4 py-4">{getStatusBadge(worker.verification_status)}</td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              {worker.verification_status === 'pending' && (
                                <>
                                  <Button variant="primary" onClick={() => handleVerifyWorker(worker.user_id, 'approved')}>
                                    Approve
                                  </Button>
                                  <Button variant="danger" onClick={() => handleVerifyWorker(worker.user_id, 'rejected')}>
                                    Reject
                                  </Button>
                                </>
                              )}
                              {worker.verification_status === 'rejected' && (
                                <Button variant="primary" onClick={() => handleVerifyWorker(worker.user_id, 'approved')}>
                                  Re-Approve
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Old card-based worker view - REMOVE THIS */}
          {false && <Card>
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
        </Card>}

          {/* Employers Tab */}
          {mainTab === 'employers' && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Employer Verifications</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEmployerTab('pending')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      employerTab === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pending ({allEmployers.filter(e => e.verification_status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setEmployerTab('approved')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      employerTab === 'approved'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Approved ({allEmployers.filter(e => e.verification_status === 'approved').length})
                  </button>
                  <button
                    onClick={() => setEmployerTab('rejected')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      employerTab === 'rejected'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Rejected ({allEmployers.filter(e => e.verification_status === 'rejected').length})
                  </button>
                  <button
                    onClick={() => setEmployerTab('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      employerTab === 'all'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({allEmployers.length})
                  </button>
                </div>
              </div>

              {filteredEmployers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No employers in this category</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredEmployers.map((employer: any) => (
                        <tr key={employer.user_id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">{employer.business_name}</div>
                            <div className="text-xs text-gray-500">Registered: {new Date(employer.created_at).toLocaleDateString()}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">{employer.users?.phone || 'N/A'}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            {employer.city}, {employer.state || 'N/A'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">{employer.industry || 'N/A'}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{employer.business_type || 'N/A'}</td>
                          <td className="px-4 py-4">{getStatusBadge(employer.verification_status)}</td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              {employer.verification_status === 'pending' && (
                                <>
                                  <Button variant="primary" onClick={() => handleVerifyEmployer(employer.user_id, 'approved')}>
                                    Approve
                                  </Button>
                                  <Button variant="danger" onClick={() => handleVerifyEmployer(employer.user_id, 'rejected')}>
                                    Reject
                                  </Button>
                                </>
                              )}
                              {employer.verification_status === 'rejected' && (
                                <Button variant="primary" onClick={() => handleVerifyEmployer(employer.user_id, 'approved')}>
                                  Re-Approve
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Old employers cards - REMOVE */}
          {false && (
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

          {/* Jobs Tab */}
          {mainTab === 'jobs' && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Approvals</h2>
              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No pending jobs</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posted</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">{job.title}</div>
                            <div className="text-xs text-gray-500 max-w-xs truncate">{job.description}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">{job.city}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{job.job_type}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{job.employment_type}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            {job.salary_min && job.salary_max
                              ? `₹${job.salary_min}-${job.salary_max}`
                              : 'Not specified'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {new Date(job.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <Button variant="primary" onClick={() => handleJobAction(job.id, 'approve')}>
                                Approve
                              </Button>
                              <Button variant="danger" onClick={() => handleJobAction(job.id, 'reject')}>
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Connections Tab */}
          {mainTab === 'connections' && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Connection Requests</h2>
                <button
                  onClick={() => navigate('/admin/connections')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Full Connections Page
                </button>
              </div>
              <div className="text-center py-12 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
                <div className="text-4xl mb-4">🔗</div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Connection Management
                </p>
                <p className="text-gray-600 mb-4">
                  Review and approve worker-employer connection requests
                </p>
                <button
                  onClick={() => navigate('/admin/connections')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Go to Connections →
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
