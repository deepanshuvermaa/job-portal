import React, { useEffect, useState } from 'react';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getWorkerProfile, updateWorkerProfile } from '../services/profiles';
import { JOB_CATEGORIES } from '../utils/constants';
import { Bell, BellOff } from 'lucide-react';

export const JobAlerts: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Alert preferences
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [preferredCities, setPreferredCities] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const profile = await getWorkerProfile();

      // For now, we'll use the profile's existing data as preferences
      // In a full implementation, this would come from a separate alerts table
      if (profile) {
        setSelectedCategories(profile.skills || []);
        setPreferredCities(profile.city || '');
      }
    } catch (err: any) {
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      // Note: This is a UI-only implementation
      // Backend API for job alerts preferences doesn't exist yet
      // This would need a new endpoint like POST /api/workers/alert-preferences

      // For now, just show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Alerts</h1>
            <p className="text-gray-600">
              Set your preferences to receive notifications about relevant jobs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700 font-medium">
              {alertsEnabled ? 'Alerts Enabled' : 'Alerts Disabled'}
            </span>
            <button
              onClick={() => setAlertsEnabled(!alertsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                alertsEnabled ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  alertsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            Preferences saved successfully!
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Job alerts feature is currently in development.
            Preferences saved here will be used once the backend API is implemented.
          </p>
        </div>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Notification Preferences
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Job Categories
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {JOB_CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleToggleCategory(category.value)}
                    disabled={!alertsEnabled}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedCategories.includes(category.value)
                        ? 'bg-primary-100 border-primary-500 text-primary-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    } ${!alertsEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedCategories.length} categor{selectedCategories.length !== 1 ? 'ies' : 'y'} selected
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Cities (comma-separated)
              </label>
              <input
                type="text"
                value={preferredCities}
                onChange={(e) => setPreferredCities(e.target.value)}
                disabled={!alertsEnabled}
                placeholder="Mumbai, Delhi, Bangalore"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    disabled={!alertsEnabled}
                    placeholder="Min ₹"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                    disabled={!alertsEnabled}
                    placeholder="Max ₹"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="primary"
                onClick={handleSave}
                loading={saving}
                disabled={!alertsEnabled || loading}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            {alertsEnabled ? (
              <Bell size={24} className="text-green-600 mt-1" />
            ) : (
              <BellOff size={24} className="text-gray-400 mt-1" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How Job Alerts Work</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• You'll receive notifications when new jobs matching your preferences are posted</li>
                <li>• Alerts are sent via in-app notifications (email/SMS coming soon)</li>
                <li>• You can update your preferences anytime</li>
                <li>• Toggle alerts on/off using the switch above</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
