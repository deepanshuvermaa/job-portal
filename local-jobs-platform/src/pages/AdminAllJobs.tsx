import React, { useEffect, useState } from 'react';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getAllJobs, approveJob, rejectJob } from '../services/admin';
import { Briefcase, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';

export const AdminAllJobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, [statusFilter, page]);

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllJobs(cityFilter || undefined, statusFilter || undefined, page, 20);
      if (page === 1) {
        setJobs(data || []);
      } else {
        setJobs(prev => [...prev, ...(data || [])]);
      }
      setHasMore(data && data.length === 20);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      await approveJob(jobId);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'open' } : j));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to approve job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      await rejectJob(jobId);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'rejected' } : j));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to reject job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFilterApply = () => {
    setPage(1);
    setJobs([]);
    loadJobs();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Approved';
      case 'draft': return 'Pending';
      case 'closed': return 'Closed';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">All Jobs</h1>

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Filter by city..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div className="flex-1">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base bg-white"
              >
                <option value="">All Statuses</option>
                <option value="open">Approved (Open)</option>
                <option value="draft">Pending (Draft)</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <Button variant="primary" onClick={handleFilterApply} className="min-h-[44px]">
              Filter
            </Button>
          </div>
        </Card>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        {loading && page === 1 ? (
          <p className="text-gray-500 text-center py-8">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No jobs found</p>
            </div>
          </Card>
        ) : (
          <>
            {jobs.map((job) => (
              <Card key={job.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1 break-words">{job.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(job.status)}`}>
                      {getStatusLabel(job.status)}
                    </span>
                  </div>

                  {job.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 break-words">{job.description}</p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    {job.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {job.city}
                      </span>
                    )}
                    {job.employment_type && (
                      <span className="flex items-center gap-1">
                        <Briefcase size={14} /> {job.employment_type}
                      </span>
                    )}
                    {(job.salary_min || job.salary_max) && (
                      <span>₹{job.salary_min || 0} - ₹{job.salary_max || 0}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {job.employer && (
                    <p className="text-sm text-gray-600">
                      <strong>Employer:</strong> {job.employer.business_name || 'Unknown'}
                      {job.employer.city && <> — {job.employer.city}</>}
                    </p>
                  )}

                  {/* Action buttons for draft jobs */}
                  {job.status === 'draft' && (
                    <div className="flex gap-2 pt-2 border-t">
                      <button
                        onClick={() => handleApprove(job.id)}
                        disabled={actionLoading === job.id}
                        className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 min-h-[44px] disabled:opacity-50"
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(job.id)}
                        disabled={actionLoading === job.id}
                        className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 min-h-[44px] disabled:opacity-50"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {hasMore && (
              <div className="text-center py-4">
                <Button variant="outline" onClick={() => setPage(p => p + 1)} loading={loading}>
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
