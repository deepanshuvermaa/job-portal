import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { useAuthStore } from '../store/authStore';
import { getWorkerProfile } from '../services/profiles';
import { getEmployerProfile } from '../services/profiles';
import { Clock, XCircle } from 'lucide-react';

export const VerificationPending: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user?.role === 'worker') {
          const data = await getWorkerProfile();
          setProfile(data);
        } else if (user?.role === 'employer') {
          const data = await getEmployerProfile();
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const isRejected = profile?.verification_status === 'rejected';
  const rejectionReason = profile?.rejection_reason;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isRejected ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            {isRejected ? (
              <XCircle className="w-8 h-8 text-red-600" />
            ) : (
              <Clock className="w-8 h-8 text-yellow-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isRejected ? 'Verification Rejected' : 'Verification Pending'}
          </h1>
          <p className="text-gray-600">
            {isRejected
              ? 'Your verification was rejected. Please review the reason below and resubmit your documents.'
              : 'Your profile is under review. We will notify you once verification is complete.'
            }
          </p>
        </div>

        {isRejected && rejectionReason && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason:</p>
            <p className="text-sm text-red-700">{rejectionReason}</p>
          </div>
        )}

        <div className="space-y-3">
          {isRejected ? (
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate(user?.role === 'worker' ? '/worker/profile/edit' : '/employer/profile/edit')}
            >
              Update Profile & Resubmit
            </Button>
          ) : (
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate(user?.role === 'worker' ? '/worker/dashboard' : '/employer/dashboard')}
            >
              Go to Dashboard
            </Button>
          )}
          <Button variant="outline" fullWidth onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
};
