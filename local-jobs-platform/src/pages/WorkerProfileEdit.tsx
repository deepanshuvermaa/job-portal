import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { ProfilePhotoUpload } from '../components/shared/ProfilePhotoUpload';
import { getWorkerProfile, updateWorkerProfile } from '../services/profiles';
import { uploadWorkerDocument } from '../services/uploads';
import { JOB_CATEGORIES } from '../utils/constants';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';

export const WorkerProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { language } = useAppStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    contact_phone: '',
    city: '',
    state: '',
    pincode: '',
    address: '',
    bio: '',
    experience_years: 0,
    minimum_salary: '',
    joining_days: '',
    skills: [] as string[],
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getWorkerProfile();
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          contact_phone: data.contact_phone || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          address: data.address || '',
          bio: data.bio || '',
          experience_years: data.experience_years || 0,
          minimum_salary: data.minimum_salary ? String(data.minimum_salary) : '',
          joining_days: data.joining_days || '',
          skills: data.skills || [],
        });
      } catch (err: any) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      const result = await uploadWorkerDocument('photo', file);
      setProfile((prev: any) => ({ ...prev, profile_photo_url: result.url }));
      setSuccess('Photo uploaded successfully');
    } catch (err) {
      setError('Failed to upload photo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await updateWorkerProfile({
        full_name: formData.full_name,
        contact_phone: formData.contact_phone,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        address: formData.address,
        bio: formData.bio,
        experience_years: Number(formData.experience_years),
        minimum_salary: formData.minimum_salary ? Number(formData.minimum_salary) : null,
        joining_days: formData.joining_days,
        skills: formData.skills,
      });

      setSuccess('Profile updated successfully');
      setTimeout(() => navigate('/worker/dashboard'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'hi' ? 'प्रोफाइल संपादित करें' : 'Edit Profile'}
          </h1>
          <button
            onClick={() => { logout(); navigate('/', { replace: true }); }}
            className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium min-h-[48px]"
          >
            {language === 'hi' ? 'लॉगआउट' : 'Logout'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
            {success}
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ProfilePhotoUpload
              currentPhotoUrl={profile?.profile_photo_url}
              onUpload={handlePhotoUpload}
              label="Profile Photo"
            />

            <Input
              label={language === 'hi' ? 'पूरा नाम' : 'Full Name'}
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />

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
                label={language === 'hi' ? 'शहर' : 'City'}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <Input
                label={language === 'hi' ? 'राज्य' : 'State'}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={language === 'hi' ? 'पिनकोड' : 'Pincode'}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                inputMode="numeric"
              />
              <Input
                label={language === 'hi' ? 'अनुभव (वर्ष)' : 'Experience (years)'}
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={language === 'hi' ? 'न्यूनतम वेतन (₹/महीना)' : 'Minimum Salary (₹/month)'}
                value={formData.minimum_salary}
                onChange={(e) => setFormData({ ...formData, minimum_salary: e.target.value })}
                type="number"
                inputMode="numeric"
                placeholder="10000"
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hi' ? 'कितने दिन में जॉइन कर सकते हैं' : 'Can join within'}
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-white"
                  value={formData.joining_days}
                  onChange={(e) => setFormData({ ...formData, joining_days: e.target.value })}
                >
                  <option value="">{language === 'hi' ? 'चुनें' : 'Select'}</option>
                  <option value="immediate">{language === 'hi' ? 'तुरंत' : 'Immediately'}</option>
                  <option value="3">{language === 'hi' ? '3 दिन में' : 'Within 3 days'}</option>
                  <option value="7">{language === 'hi' ? '1 हफ्ते में' : 'Within 1 week'}</option>
                  <option value="15">{language === 'hi' ? '15 दिन में' : 'Within 15 days'}</option>
                  <option value="30">{language === 'hi' ? '1 महीने में' : 'Within 1 month'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'hi' ? 'पता' : 'Address'}
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base min-h-[80px]"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
              <textarea
                className="input-field min-h-[100px]"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell employers about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Skills</label>
              <div className="flex flex-wrap gap-2">
                {JOB_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleSkillToggle(cat.value)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      formData.skills.includes(cat.value)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
                {language === 'hi' ? 'सेव करें' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
