import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { VerificationBadge } from '../components/shared/VerificationBadge';
import { getEmployerProfile } from '../services/profiles';
import { Building2, MapPin, Mail, Phone, FileText } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';

export const EmployerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { language } = useAppStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await getEmployerProfile();
        setProfile(data);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <Card>
            <p className="text-gray-500">Profile not found</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'hi' ? 'मेरा बिजनेस प्रोफाइल' : 'My Business Profile'}
          </h1>
          <div className="flex gap-2">
            <Link to="/employer/profile/edit">
              <Button variant="outline">{language === 'hi' ? 'संपादित करें' : 'Edit'}</Button>
            </Link>
            <button
              onClick={() => { logout(); navigate('/', { replace: true }); }}
              className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium min-h-[48px]"
            >
              {language === 'hi' ? 'लॉगआउट' : 'Logout'}
            </button>
          </div>
        </div>

        <Card>
          <div className="space-y-6">
            {/* Header with logo and basic info */}
            <div className="flex items-start gap-6">
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
                  <h2 className="text-2xl font-bold text-gray-900">{profile.business_name}</h2>
                  <VerificationBadge isVerified={profile.verification_status === 'approved'} />
                </div>
                <p className="text-gray-600 capitalize mb-1">{profile.business_type || 'Business'}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={16} />
                  {profile.city}, {profile.state}
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Verification Status</p>
                <p className={`text-lg font-semibold capitalize ${
                  profile.verification_status === 'approved' ? 'text-green-600' :
                  profile.verification_status === 'rejected' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {profile.verification_status || 'pending'}
                </p>
              </div>
            </div>

            {/* Rejection Reason */}
            {profile.verification_status === 'rejected' && profile.rejection_reason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason:</p>
                <p className="text-sm text-red-700">{profile.rejection_reason}</p>
                <Link to="/employer/profile/edit" className="text-sm text-red-600 underline mt-2 inline-block">
                  Update your profile and resubmit →
                </Link>
              </div>
            )}

            {/* Business Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Business Type</p>
                  <p className="font-medium capitalize">{profile.business_type || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="font-medium">{profile.industry || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employee Count</p>
                  <p className="font-medium">{profile.employee_count || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="font-medium">{profile.contact_person || 'Not set'}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {profile.description && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-700">{profile.description}</p>
              </div>
            )}

            {/* Address */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
              <div className="space-y-2">
                <p className="text-gray-700">{profile.address || 'Not set'}</p>
                <p className="text-gray-700">{profile.city}, {profile.state} - {profile.pincode}</p>
              </div>
            </div>

            {/* Contact Numbers */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone size={18} className="text-gray-500" />
                  <span className="text-gray-700">Primary: {profile.user?.phone || 'Not set'}</span>
                </div>
                {profile.alternate_phones && profile.alternate_phones.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Alternate Numbers:</p>
                    {profile.alternate_phones.map((phone: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 ml-6">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-gray-700">{phone}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
              <div className="flex flex-wrap gap-3">
                {profile.gst_certificate_url && (
                  <a
                    href={profile.gst_certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2"
                  >
                    <FileText size={18} />
                    GST Certificate
                  </a>
                )}
                {profile.business_license_url && (
                  <a
                    href={profile.business_license_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-2"
                  >
                    <FileText size={18} />
                    Business License
                  </a>
                )}
                {profile.pan_card_url && (
                  <a
                    href={profile.pan_card_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center gap-2"
                  >
                    <FileText size={18} />
                    PAN Card
                  </a>
                )}
                {!profile.gst_certificate_url && !profile.business_license_url && !profile.pan_card_url && (
                  <p className="text-gray-500 text-sm">No documents uploaded</p>
                )}
              </div>
            </div>

            {/* GST & PAN Numbers */}
            {(profile.gst_number || profile.pan_number) && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.gst_number && (
                    <div>
                      <p className="text-sm text-gray-500">GST Number</p>
                      <p className="font-medium font-mono">{profile.gst_number}</p>
                    </div>
                  )}
                  {profile.pan_number && (
                    <div>
                      <p className="text-sm text-gray-500">PAN Number</p>
                      <p className="font-medium font-mono">{profile.pan_number}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ratings */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ratings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.average_rating || 0} <span className="text-yellow-400">★</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Ratings</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.total_ratings || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Hires</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.total_hires || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
