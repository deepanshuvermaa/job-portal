import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { ProfilePhotoUpload } from '../components/shared/ProfilePhotoUpload';
import { getWorkerProfile, updateWorkerProfile } from '../services/profiles';
import { uploadWorkerDocument } from '../services/uploads';
import { JOB_CATEGORIES } from '../utils/constants';

export const WorkerProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    city: '',
    state: '',
    pincode: '',
    address: '',
    bio: '',
    experience_years: 0,
    skills: [] as string[],
    alternate_phones: [] as string[],
    new_phone: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getWorkerProfile();
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          address: data.address || '',
          bio: data.bio || '',
          experience_years: data.experience_years || 0,
          skills: data.skills || [],
          alternate_phones: data.alternate_phones || [],
          new_phone: ''
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

  const handleAddPhone = () => {
    if (formData.new_phone && !formData.alternate_phones.includes(formData.new_phone)) {
      setFormData(prev => ({
        ...prev,
        alternate_phones: [...prev.alternate_phones, prev.new_phone],
        new_phone: ''
      }));
    }
  };

  const handleRemovePhone = (phone: string) => {
    setFormData(prev => ({
      ...prev,
      alternate_phones: prev.alternate_phones.filter(p => p !== phone)
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
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        address: formData.address,
        bio: formData.bio,
        experience_years: Number(formData.experience_years),
        skills: formData.skills,
        alternate_phones: formData.alternate_phones
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
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>

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
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <Input
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
              <Input
                label="Experience (years)"
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <textarea
                className="input-field min-h-[80px]"
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Alternate Phone Numbers</label>
              <div className="space-y-2">
                {formData.alternate_phones.map((phone, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input value={phone} readOnly />
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemovePhone(phone)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add alternate number"
                    value={formData.new_phone}
                    onChange={(e) => setFormData({ ...formData, new_phone: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPhone}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" loading={submitting}>
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/worker/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
