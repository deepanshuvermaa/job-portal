import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { ProfilePhotoUpload } from '../components/shared/ProfilePhotoUpload';
import { getEmployerProfile, updateEmployerProfile } from '../services/profiles';
import { uploadEmployerDocument } from '../services/uploads';
import { BUSINESS_TYPES } from '../utils/constants';

export const EmployerProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    contact_person: '',
    city: '',
    state: '',
    pincode: '',
    address: '',
    description: '',
    industry: '',
    employee_count: '',
    gst_number: '',
    pan_number: '',
    alternate_phones: [] as string[],
    new_phone: ''
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
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          address: data.address || '',
          description: data.description || '',
          industry: data.industry || '',
          employee_count: data.employee_count || '',
          gst_number: data.gst_number || '',
          pan_number: data.pan_number || '',
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

  const handleLogoUpload = async (file: File) => {
    try {
      const result = await uploadEmployerDocument('business_logo', file);
      setProfile((prev: any) => ({ ...prev, company_logo_url: result.url }));
      setSuccess('Logo uploaded successfully');
    } catch (err) {
      setError('Failed to upload logo');
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

      setSuccess('Profile updated successfully');
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
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Business Profile</h1>

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
              currentPhotoUrl={profile?.company_logo_url || profile?.profile_photo_url}
              onUpload={handleLogoUpload}
              label="Company Logo"
            />

            <Input
              label="Business Name"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Type</label>
                <select
                  className="input-field"
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                >
                  <option value="">Select type</option>
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Contact Person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Construction, Retail"
              />
              <Input
                label="Employee Count"
                value={formData.employee_count}
                onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                placeholder="e.g., 1-10, 50-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Description</label>
              <textarea
                className="input-field min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your business..."
              />
            </div>

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

            <Input
              label="Pincode"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <textarea
                className="input-field min-h-[80px]"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="GST Number (Optional)"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                placeholder="22AAAAA0000A1Z5"
              />
              <Input
                label="PAN Number (Optional)"
                value={formData.pan_number}
                onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                placeholder="ABCDE1234F"
              />
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
                onClick={() => navigate('/employer/profile')}
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
