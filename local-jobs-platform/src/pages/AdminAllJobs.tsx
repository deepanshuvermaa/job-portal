import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getAllJobs } from '../services/admin';
import { Briefcase, MapPin, Calendar } from 'lucide-react';

export const AdminAllJobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [cityFilter, statusFilter, page]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await getAllJobs(cityFilter || undefined, statusFilter || undefined, page, 20);
      if (page === 1) {
        setJobs(data || []);
      } else {
        setJobs(prev => [...prev, ...(data || [])]);
      }
      setHasMore(data && data.length === 20);
    } catch (err: any) {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    setPage(1);
    setJobs([]);
    loadJobs();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Jobs</h1>
          <p className="text-gray-600">View and manage all job postings</p>
        </div>

        <Card>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Filter by city..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="primary" onClick={handleFilterChange}>
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading && page === 1 ? (
          <p className="text-gray-500">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No jobs found</p>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          {job.city}, {job.state}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase size={16} />
                          {job.employment_type}
                        </div>
                        {(job.salary_min || job.salary_max) && (
                          <span>
                            ₹{job.salary_min || 0} - ₹{job.salary_max || 0}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          Posted: {new Date(job.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {job.employer_profiles && (
                        <div className="text-sm text-gray-600">
                          <strong>Employer:</strong> {job.employer_profiles.business_name || 'Unknown'}
                          {job.employer_profiles.user?.phone && (
                            <> • {job.employer_profiles.user.phone}</>
                          )}
                        </div>
                      )}

                      {job.rejection_reason && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {job.rejection_reason}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link to={`/worker/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          View Job
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {hasMore && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  loading={loading}
                >
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
