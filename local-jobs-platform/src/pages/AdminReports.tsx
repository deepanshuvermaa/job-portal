import React, { useEffect, useState } from 'react';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getAllReports, updateReportStatus } from '../services/reports';
import { AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getAllReports(filter);
      setReports(data || []);
    } catch (err: any) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, status: string) => {
    setActioningId(reportId);
    try {
      await updateReportStatus(reportId, status, adminNotes[reportId] || undefined);
      await loadReports();
      setAdminNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[reportId];
        return newNotes;
      });
    } catch (err: any) {
      setError('Failed to update report');
    } finally {
      setActioningId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'reviewed':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'dismissed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports Management</h1>
            <p className="text-gray-600">Review and manage user reports</p>
          </div>
        </div>

        <div className="flex gap-2">
          {['pending', 'reviewed', 'resolved', 'dismissed'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading reports...</p>
        ) : reports.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg mb-2">No {filter} Reports</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={18} className="text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {report.reported_job_id ? 'Job Report' : 'User Report'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Reporter:</strong> {report.reporter?.phone || 'Unknown'}
                          {report.reporter?.worker_profiles?.[0]?.full_name &&
                            ` (${report.reporter.worker_profiles[0].full_name})`}
                          {report.reporter?.employer_profiles?.[0]?.business_name &&
                            ` (${report.reporter.employer_profiles[0].business_name})`}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Reason:</strong> {report.reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          {report.description}
                        </p>

                        {report.reported_job_id && (
                          <Link
                            to={`/admin/jobs`}
                            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
                          >
                            View Reported Job <ExternalLink size={12} />
                          </Link>
                        )}

                        {report.reported_user_id && (
                          <p className="text-xs text-gray-500">
                            Reported User ID: {report.reported_user_id}
                          </p>
                        )}
                      </div>

                      {report.admin_notes && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">Admin Notes:</p>
                          <p className="text-sm text-blue-700">{report.admin_notes}</p>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Submitted: {new Date(report.created_at).toLocaleDateString()} at{' '}
                        {new Date(report.created_at).toLocaleTimeString()}
                        {report.resolved_at && (
                          <> • Resolved: {new Date(report.resolved_at).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                  </div>

                  {report.status === 'pending' && (
                    <div className="border-t pt-4">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Notes (optional)
                        </label>
                        <textarea
                          value={adminNotes[report.id] || ''}
                          onChange={(e) => setAdminNotes(prev => ({ ...prev, [report.id]: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Add notes about this report..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                          loading={actioningId === report.id}
                        >
                          Mark as Reviewed
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateStatus(report.id, 'resolved')}
                          loading={actioningId === report.id}
                        >
                          Resolve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                          loading={actioningId === report.id}
                        >
                          Dismiss
                        </Button>
                      </div>
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
