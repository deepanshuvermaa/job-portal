import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getJobAnalytics } from '../services/jobManagement';
import { Eye, Users, CheckCircle, XCircle, Clock, UserCheck, ArrowLeft } from 'lucide-react';

export const JobAnalytics: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (jobId) {
      loadAnalytics();
    }
  }, [jobId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getJobAnalytics(jobId!);
      setAnalytics(data);
    } catch (err: any) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error || 'Analytics not found'}</div>
        </div>
      </div>
    );
  }

  const job = analytics.job;
  const stats = analytics.applicationStats;
  const totalApps = analytics.totalApplications;
  const totalViews = analytics.totalViews;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/employer/jobs')}>
            <ArrowLeft size={18} className="mr-1" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-sm text-gray-500">Job Analytics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{totalApps}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">View to Apply Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalViews > 0 ? ((totalApps / totalViews) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock size={32} className="text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <UserCheck size={32} className="text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.shortlisted}</p>
              <p className="text-sm text-gray-500">Shortlisted</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.hired}</p>
              <p className="text-sm text-gray-500">Hired</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle size={32} className="text-red-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle size={32} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.withdrawn}</p>
              <p className="text-sm text-gray-500">Withdrawn</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium capitalize">{job.status}</p>
            </div>
            <div>
              <p className="text-gray-500">Posted On</p>
              <p className="font-medium">{new Date(job.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-medium">{job.city}</p>
            </div>
            <div>
              <p className="text-gray-500">Employment Type</p>
              <p className="font-medium capitalize">{job.employment_type}</p>
            </div>
            {job.expiry_date && (
              <div>
                <p className="text-gray-500">Expires On</p>
                <p className="font-medium">{new Date(job.expiry_date).toLocaleDateString()}</p>
              </div>
            )}
            {job.vacancies && (
              <div>
                <p className="text-gray-500">Vacancies</p>
                <p className="font-medium">{job.vacancies}</p>
              </div>
            )}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="primary" onClick={() => navigate(`/employer/jobs/${jobId}/applications`)}>
            View Applications
          </Button>
          <Button variant="outline" onClick={() => navigate('/employer/jobs')}>
            Back to Jobs
          </Button>
        </div>
      </div>
    </div>
  );
};
