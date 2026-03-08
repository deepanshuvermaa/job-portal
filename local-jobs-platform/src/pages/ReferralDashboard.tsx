import React, { useEffect, useState } from 'react';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { generateReferralCode, getMyReferrals } from '../services/referrals';
import { Users, Copy, CheckCircle } from 'lucide-react';

export const ReferralDashboard: React.FC = () => {
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [code, refs] = await Promise.all([
        generateReferralCode(),
        getMyReferrals()
      ]);
      setReferralCode(code);
      setReferrals(refs || []);
    } catch (err: any) {
      setError('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifiedCount = referrals.filter(r => r.referred?.is_verified).length;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referrals</h1>
          <p className="text-gray-600 mt-1">Invite friends and earn rewards</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-500 mb-1">Total Referrals</p>
            <p className="text-3xl font-bold text-gray-900">{referrals.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500 mb-1">Verified Referrals</p>
            <p className="text-3xl font-bold text-green-600">{verifiedCount}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{referrals.length - verifiedCount}</p>
          </Card>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Code</h2>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 bg-gray-100 rounded-lg font-mono text-lg font-bold text-gray-900">
              {loading ? '...' : referralCode}
            </div>
            <Button variant="primary" onClick={handleCopy}>
              {copied ? (
                <>
                  <CheckCircle size={18} className="mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} className="mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Share this code with friends during their signup to track your referrals
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Referral History</h2>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No referrals yet</p>
              <p className="text-sm text-gray-400 mt-1">Start sharing your code!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((ref) => (
                <div key={ref.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{ref.referred?.phone || 'Unknown'}</p>
                    <p className="text-sm text-gray-500 capitalize">{ref.referred?.role || 'Unknown role'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ref.referred?.is_verified
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {ref.referred?.is_verified ? 'Verified' : 'Pending'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(ref.created_at).toLocaleDateString()}
                    </p>
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
