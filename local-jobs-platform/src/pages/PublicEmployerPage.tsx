import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { VerificationBadge } from '../components/shared/VerificationBadge';
import { RatingStars } from '../components/shared/RatingStars';
import { getPublicEmployerProfile } from '../services/publicProfiles';
import { Building2, MapPin, Briefcase } from 'lucide-react';

export const PublicEmployerPage: React.FC = () => {
  const { employerId } = useParams<{ employerId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employerId) {
      loadProfile();
    }
  }, [employerId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const result = await getPublicEmployerProfile(employerId!);
      setData(result);
    } catch (err: any) {
      setError('Employer not found or not verified');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Card>
            <p className="text-gray-500">{error || 'Employer not found'}</p>
          </Card>
        </div>
      </div>
    );
  }

  const profile = data.profile;
  const jobs = data.activeJobs || [];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <div className="flex items-start gap-6 mb-6">
            <div className="flex-shrink-0">
              {profile.company_logo_url || profile.profile_photo_url ? (
                <img
                  src={profile.company_logo_url || profile.profile_photo_url}
                  alt={profile.business_name}
                  className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Building2 size={48} className="text-primary-600" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{profile.business_name}</h1>
                <VerificationBadge isVerified={profile.user?.is_verified} />
              </div>
              <p className="text-gray-600 capitalize mb-2">{profile.business_type || 'Business'}</p>
              <div className="flex items-center gap-2 text-gray-500 mb-3">
                <MapPin size={18} />
                {profile.city}, {profile.state}
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <RatingStars rating={profile.average_rating || 0} readonly showNumber />
                </div>
                <span className="text-sm text-gray-500">
                  {profile.total_hires || 0} hires
                </span>
              </div>
            </div>
          </div>

          {profile.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-gray-700">{profile.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t pt-4">
            {profile.industry && (
              <div>
                <p className="text-gray-500">Industry</p>
                <p className="font-medium">{profile.industry}</p>
              </div>
            )}
            {profile.employee_count && (
              <div>
                <p className="text-gray-500">Company Size</p>
                <p className="font-medium">{profile.employee_count}</p>
              </div>
            )}
          </div>
        </Card>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Active Job Openings ({jobs.length})
          </h2>

          {jobs.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <Briefcase size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No active jobs at the moment</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job: any) => (
                <Card key={job.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                        <span>📍 {job.city}</span>
                        <span>💼 {job.employment_type}</span>
                        {(job.salary_min || job.salary_max) && (
                          <span>💰 ₹{job.salary_min || 0} - ₹{job.salary_max || 0}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{job.description}</p>
                    </div>
                    <Link to={`/worker/jobs/${job.id}`}>
                      <Button variant="primary" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
