import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getEmployerJobApplications, updateApplicationStatus } from '../services/jobs';
import { bulkUpdateApplications } from '../services/jobManagement';
import { CheckSquare, Square, User } from 'lucide-react';

export const EmployerJobApplications: React.FC = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

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

  const toggleSelection = (appId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appId)) {
        newSet.delete(appId);
      } else {
        newSet.add(appId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map(app => app.id)));
    }
  };

  const handleBulkAction = async (status: string) => {
    if (selectedIds.size === 0) return;

    setBulkActionLoading(true);
    try {
      await bulkUpdateApplications(Array.from(selectedIds), status);
      setSelectedIds(new Set());
      await loadApplications();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update applications');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const allSelected = applications.length > 0 && selectedIds.size === applications.length;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {selectedIds.size > 0 && (
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                {selectedIds.size} application{selectedIds.size !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('shortlisted')}
                  loading={bulkActionLoading}
                >
                  Shortlist Selected
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleBulkAction('rejected')}
                  loading={bulkActionLoading}
                >
                  Reject Selected
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleBulkAction('hired')}
                  loading={bulkActionLoading}
                >
                  Hire Selected
                </Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <p className="text-gray-500">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="text-gray-500">No applications yet.</p>
        ) : (
          <>
            <div className="flex items-center gap-3 px-2">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {allSelected ? (
                  <CheckSquare size={20} className="text-primary-600" />
                ) : (
                  <Square size={20} className="text-gray-400" />
                )}
                Select All
              </button>
            </div>

            <div className="grid gap-4">
              {applications.map((app) => {
                const isSelected = selectedIds.has(app.id);
                return (
                  <Card key={app.id} className={isSelected ? 'ring-2 ring-primary-500' : ''}>
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleSelection(app.id)}
                        className="flex-shrink-0 mt-1"
                      >
                        {isSelected ? (
                          <CheckSquare size={20} className="text-primary-600" />
                        ) : (
                          <Square size={20} className="text-gray-400" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900">
                                {app.worker_profiles?.full_name || 'Worker'}
                              </p>
                              {app.worker_profiles?.user_id && (
                                <Link
                                  to={`/employer/workers/${app.worker_profiles.user_id}`}
                                  className="text-xs text-primary-600 hover:underline"
                                >
                                  View Profile
                                </Link>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                app.status === 'hired' ? 'bg-green-100 text-green-700' :
                                app.status === 'shortlisted' ? 'bg-blue-100 text-blue-700' :
                                app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {app.status}
                              </span>
                              <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                            </div>
                            {app.cover_letter && (
                              <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                                {app.cover_letter}
                              </p>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 mt-2">
                              <p className="text-xs text-blue-900">
                                🔒 Resume & Contact Protected
                              </p>
                              <p className="text-xs text-blue-700 mt-1">
                                Shortlist this candidate and wait for admin approval to view full details.
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(app.id, 'shortlisted')}
                              disabled={app.status === 'shortlisted'}
                            >
                              Shortlist
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleStatusChange(app.id, 'rejected')}
                              disabled={app.status === 'rejected'}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleStatusChange(app.id, 'hired')}
                              disabled={app.status === 'hired'}
                            >
                              Hire
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
