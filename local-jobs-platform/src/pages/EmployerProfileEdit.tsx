import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { ProfilePhotoUpload } from '../components/shared/ProfilePhotoUpload';
import { FileUpload } from '../components/shared/FileUpload';
import { getEmployerProfile, updateEmployerProfile } from '../services/profiles';
import { uploadEmployerDocument } from '../services/uploads';
import { BUSINESS_TYPES } from '../utils/constants';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';

export const EmployerProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { language } = useAppStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    contact_person: '',
    contact_phone: '',
    city: '',
    state: '',
    pincode: '',
    address: '',
    description: '',
    industry: '',
    employee_count: '',
    gst_number: '',
    pan_number: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getEmployerProfile();
        setProfile(data);
        setFormData({
          business_name: data.business_name || '',
          business_type: data.business_type || '',
          contact_person: data.contact_person || '',
          contact_phone: data.contact_phone || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          address: data.address || '',
          description: data.description || '',
          industry: data.industry || '',
          employee_count: data.employee_count || '',
          gst_number: data.gst_number || '',
          pan_number: data.pan_number || '',
        });
      } catch (err: any) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogoUpload = async (file: File) => {
    try {
      const result = await uploadEmployerDocument('business_logo', file);
      setProfile((prev: any) => ({ ...prev, company_logo_url: result.url }));
      setSuccess(language === 'hi' ? 'लोगो अपलोड हो गया' : 'Logo uploaded successfully');
    } catch (err) {
      setError(language === 'hi' ? 'लोगो अपलोड नहीं हुआ' : 'Failed to upload logo');
    }
  };

  const handleVisitingCardUpload = async (file: File) => {
    try {
      const result = await uploadEmployerDocument('visiting_card', file);
      setProfile((prev: any) => ({ ...prev, visiting_card_url: result.url }));
      setSuccess(language === 'hi' ? 'विजिटिंग कार्ड अपलोड हो गया' : 'Visiting card uploaded');
    } catch (err) {
      setError(language === 'hi' ? 'विजिटिंग कार्ड अपलोड नहीं हुआ' : 'Failed to upload visiting card');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await updateEmployerProfile({
        business_name: formData.business_name,
        business_type: formData.business_type,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        address: formData.address,
        description: formData.description,
        industry: formData.industry,
        employee_count: formData.employee_count,
        gst_number: formData.gst_number,
        pan_number: formData.pan_number,
      });

      setSuccess(language === 'hi' ? 'प्रोफाइल अपडेट हो गई' : 'Profile updated successfully');
      setTimeout(() => navigate('/employer/profile'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            {language === 'hi' ? 'बिजनेस प्रोफाइल संपादित करें' : 'Edit Business Profile'}
          </h1>
          <button
            onClick={() => { logout(); navigate('/', { replace: true }); }}
            className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 min-h-[44px]"
          >
            {language === 'hi' ? 'लॉगआउट' : 'Logout'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">{success}</div>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Logo Upload */}
            <ProfilePhotoUpload
              currentPhotoUrl={profile?.company_logo_url || profile?.profile_photo_url}
              onUpload={handleLogoUpload}
              label={language === 'hi' ? 'कंपनी लोगो' : 'Company Logo'}
            />

            {/* Visiting Card Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'hi' ? 'विजिटिंग कार्ड' : 'Visiting Card'}
              </label>
              {profile?.visiting_card_url && (
                <div className="mb-2">
                  <img
                    src={profile.visiting_card_url}
                    alt="Visiting Card"
                    className="w-full max-w-xs rounded-lg border"
                  />
                </div>
              )}
              <FileUpload
                accept="image/*"
                maxSize={5 * 1024 * 1024}
                onFileSelect={handleVisitingCardUpload}
                helperText={language === 'hi' ? 'विजिटिंग कार्ड की फोटो अपलोड करें' : 'Upload a photo of your visiting card'}
              />
            </div>

            <Input
              label={language === 'hi' ? 'बिजनेस का नाम' : 'Business Name'}
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hi' ? 'बिजनेस प्रकार' : 'Business Type'}
                </label>
                <select
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base bg-white"
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                >
                  <option value="">{language === 'hi' ? 'चुनें' : 'Select'}</option>
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {language === 'hi' ? type.labelHi : type.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label={language === 'hi' ? 'संपर्क व्यक्ति' : 'Contact Person'}
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>

            <Input
              label={language === 'hi' ? 'संपर्क नंबर' : 'Contact Phone'}
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              type="tel"
              inputMode="numeric"
              placeholder="9876543210"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={language === 'hi' ? 'उद्योग' : 'Industry'}
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Construction, Retail"
              />
              <Input
                label={language === 'hi' ? 'कर्मचारियों की संख्या' : 'Employee Count'}
                value={formData.employee_count}
                onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                placeholder="e.g., 1-10, 50-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'hi' ? 'बिजनेस विवरण' : 'Business Description'}
              </label>
              <textarea
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === 'hi' ? 'अपने बिजनेस के बारे में लिखें...' : 'Describe your business...'}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={language === 'hi' ? 'शहर' : 'City'}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <Input
                label={language === 'hi' ? 'राज्य' : 'State'}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            <Input
              label={language === 'hi' ? 'पिनकोड' : 'Pincode'}
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              inputMode="numeric"
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'hi' ? 'पता' : 'Address'}
              </label>
              <textarea
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base min-h-[80px]"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="GST Number"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value.toUpperCase() })}
                placeholder="22AAAAA0000A1Z5"
                helperText={language === 'hi' ? 'वैकल्पिक' : 'Optional'}
              />
              <Input
                label="PAN Number"
                value={formData.pan_number}
                onChange={(e) => setFormData({ ...formData, pan_number: e.target.value.toUpperCase() })}
                placeholder="ABCDE1234F"
                helperText={language === 'hi' ? 'वैकल्पिक' : 'Optional'}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
                {language === 'hi' ? 'सेव करें' : 'Save Changes'}
              </Button>
            </div>

            <button
              type="button"
              onClick={() => navigate('/employer/profile')}
              className="w-full text-center py-3 text-gray-600 font-medium min-h-[48px]"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
