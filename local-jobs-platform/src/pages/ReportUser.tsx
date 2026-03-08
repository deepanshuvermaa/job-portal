import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { createReport } from '../services/reports';
import type { CreateReportData } from '../services/reports';
import { AlertTriangle } from 'lucide-react';

type ReportReason = 'fake_profile' | 'spam' | 'harassment' | 'fraud' | 'inappropriate_content' | 'other';

export const ReportUser: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reasonOptions: ReportReason[] = [
    'spam',
    'fraud',
    'harassment',
    'fake_profile',
    'inappropriate_content',
    'other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      setError('Please select a reason');
      return;
    }

    if (!description.trim()) {
      setError('Please provide additional details');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createReport({
        reported_user_id: userId,
        reason: reason as ReportReason,
        description: description.trim()
      });
      setSuccess(true);
      setTimeout(() => navigate(-1), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted</h2>
              <p className="text-gray-600">
                Thank you for reporting this user. Our team will review it shortly.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report User</h1>
          <p className="text-gray-600">
            Help us maintain a safe community by reporting suspicious or inappropriate users
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for reporting *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select a reason</option>
                {reasonOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Please provide specific details about why you're reporting this user..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Include dates, screenshots, or specific incidents if possible
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                loading={loading}
              >
                Submit Report
              </Button>
            </div>
          </form>
        </Card>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> False reports may result in account suspension.
            Only report users who violate our community guidelines or terms of service.
          </p>
        </div>
      </div>
    </div>
  );
};
