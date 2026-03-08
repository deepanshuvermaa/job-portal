import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { VerificationBadge } from '../components/shared/VerificationBadge';
import { RatingStars } from '../components/shared/RatingStars';
import { getPublicWorkerProfile } from '../services/publicProfiles';
import { User, MapPin, Briefcase, FileText } from 'lucide-react';

export const PublicWorkerProfile: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (workerId) {
      loadProfile();
    }
  }, [workerId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getPublicWorkerProfile(workerId!);
      setProfile(data);
    } catch (err: any) {
      setError('Worker profile not accessible. You can only view profiles of workers you have shortlisted.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <p className="text-gray-500">{error || 'Profile not found'}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {profile.profile_photo_url || profile.photo_url ? (
                <img
                  src={profile.profile_photo_url || profile.photo_url}
                  alt={profile.full_name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={48} className="text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
                <VerificationBadge isVerified={profile.user?.is_verified} />
              </div>

              <div className="flex items-center gap-2 text-gray-500 mb-3">
                <MapPin size={18} />
                {profile.city}, {profile.state || 'India'}
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div>
                  <RatingStars rating={profile.average_rating || 0} readonly showNumber />
                </div>
                <span className="text-sm text-gray-500">
                  {profile.total_ratings || 0} reviews
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase size={16} />
                {profile.experience_years || 0} years experience
              </div>
            </div>
          </div>

          {profile.bio && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium mb-2">
                🔒 Contact Information Protected
              </p>
              <p className="text-sm text-blue-700">
                Phone numbers are hidden for privacy. Contact details will be revealed after:
              </p>
              <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
                <li>You shortlist this worker from your job applications</li>
                <li>Admin approves the connection request</li>
              </ul>
              <p className="text-xs text-blue-600 mt-3">
                This protects both parties from spam and ensures genuine connections.
              </p>
            </div>
          </div>

          {profile.resume_url && (
            <div className="mt-6 pt-6 border-t">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Documents</h2>
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                <FileText size={18} />
                Download Resume
              </a>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
