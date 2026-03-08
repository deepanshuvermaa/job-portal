import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getWorkerApplications } from '../services/jobs';
import { getWorkerProfile } from '../services/profiles';

export const WorkerDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [appsData, profileData] = await Promise.all([
          getWorkerApplications(),
          getWorkerProfile(),
        ]);
        if (active) {
          setApplications(appsData || []);
          setProfile(profileData);
        }
      } catch (err: any) {
        if (active) setError(err?.response?.data?.error || 'Failed to load dashboard');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Worker Dashboard</h1>
            <p className="text-gray-600">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/worker/jobs">
              <Button variant="primary">Find Jobs</Button>
            </Link>
            <Link to="/notifications">
              <Button variant="outline">Notifications</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <h2 className="text-sm text-gray-500">Applications</h2>
            <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
          </Card>
          <Card>
            <h2 className="text-sm text-gray-500">Verification Status</h2>
            <p className="text-2xl font-bold text-gray-900 capitalize">{profile?.verification_status || 'pending'}</p>
          </Card>
          <Card>
            <h2 className="text-sm text-gray-500">Average Rating</h2>
            <p className="text-2xl font-bold text-gray-900">{profile?.average_rating ?? 0}</p>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Profile</h2>
            <Link to="/worker/profile/edit" className="text-sm text-primary-600">Edit Profile</Link>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading profile...</p>
          ) : profile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{profile.full_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{profile.city || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">State</p>
                  <p className="font-medium">{profile.state || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">{profile.experience_years || 0} years</p>
                </div>
              </div>

              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-3">Documents</p>
                <div className="flex flex-wrap gap-3">
                  {profile.resume_url && (
                    <a href={profile.resume_url} target="_blank" rel="noopener noreferrer"
                       className="px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex items-center gap-2">
                      📑 Resume
                    </a>
                  )}
                  {profile.photo_url && (
                    <a href={profile.photo_url} target="_blank" rel="noopener noreferrer"
                       className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-2">
                      📷 Photo
                    </a>
                  )}
                  {profile.aadhaar_front_url && (
                    <a href={profile.aadhaar_front_url} target="_blank" rel="noopener noreferrer"
                       className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-2">
                      📄 Aadhaar Front
                    </a>
                  )}
                  {profile.aadhaar_back_url && (
                    <a href={profile.aadhaar_back_url} target="_blank" rel="noopener noreferrer"
                       className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-2">
                      📄 Aadhaar Back
                    </a>
                  )}
                  {!profile.resume_url && !profile.photo_url && !profile.aadhaar_front_url && !profile.aadhaar_back_url && (
                    <p className="text-gray-500 text-sm">No documents uploaded</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Profile not found</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/worker/applications" className="text-sm text-primary-600">View all</Link>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading applications...</p>
          ) : applications.length === 0 ? (
            <p className="text-gray-500">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{app.jobs?.title || 'Job'}</p>
                    <p className="text-sm text-gray-500">Status: {app.status}</p>
                  </div>
                  <Link to={`/worker/jobs/${app.job_id}`} className="text-sm text-primary-600">
                    View job
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
