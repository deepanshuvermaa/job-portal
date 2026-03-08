import React, { useEffect, useState } from 'react';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { api } from '../services/api';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ConnectionRequest {
  id: string;
  application_id: string;
  worker_id: string;
  employer_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  worker_name: string;
  employer_name: string;
  job_title: string;
  worker_phone?: string;
  employer_phone?: string;
}

export const AdminConnections: React.FC = () => {
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, [statusFilter]);

  const loadConnections = async () => {
    setLoading(true);
    setError('');
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const { data } = await api.get('/api/admin/connections', { params });
      setConnections(data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load connection requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (connectionId: string) => {
    setActioningId(connectionId);
    try {
      await api.put(`/api/admin/connections/${connectionId}/approve`);
      await loadConnections();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to approve connection');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (connectionId: string) => {
    setActioningId(connectionId);
    try {
      await api.put(`/api/admin/connections/${connectionId}/reject`);
      await loadConnections();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to reject connection');
    } finally {
      setActioningId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
            <CheckCircle size={14} /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium flex items-center gap-1">
            <XCircle size={14} /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium flex items-center gap-1">
            <Clock size={14} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connection Approvals</h1>
          <p className="text-gray-600">
            Manage employer-worker connection requests. Approve to share contact details.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
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
          <p className="text-gray-500">Loading connection requests...</p>
        ) : connections.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">
                No {statusFilter !== 'all' ? statusFilter : ''} connection requests
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {connections.map((connection) => (
              <Card key={connection.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Connection Request
                      </h3>
                      {getStatusBadge(connection.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-medium mb-1">WORKER</p>
                        <p className="font-semibold text-gray-900">{connection.worker_name}</p>
                        {connection.status === 'approved' && connection.worker_phone && (
                          <p className="text-sm text-gray-600 mt-1">
                            📞 {connection.worker_phone}
                          </p>
                        )}
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-green-600 font-medium mb-1">EMPLOYER</p>
                        <p className="font-semibold text-gray-900">{connection.employer_name}</p>
                        {connection.status === 'approved' && connection.employer_phone && (
                          <p className="text-sm text-gray-600 mt-1">
                            📞 {connection.employer_phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-600 font-medium mb-1">JOB</p>
                      <p className="text-sm text-gray-900">{connection.job_title}</p>
                    </div>

                    <div className="text-xs text-gray-500">
                      Requested: {new Date(connection.created_at).toLocaleDateString()} at{' '}
                      {new Date(connection.created_at).toLocaleTimeString()}
                    </div>
                  </div>

                  {connection.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(connection.id)}
                        loading={actioningId === connection.id}
                      >
                        Approve Connection
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(connection.id)}
                        loading={actioningId === connection.id}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>How it works:</strong> When an employer shortlists a worker, a connection request
            is automatically created. Approve the request to share phone numbers between both parties.
            This ensures privacy and prevents spam.
          </p>
        </div>
      </div>
    </div>
  );
};
