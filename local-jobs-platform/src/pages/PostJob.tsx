import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { JOB_CATEGORIES, WORK_TYPES, SALARY_TYPES } from '../utils/constants';
import { createJob } from '../services/jobs';

export const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    job_type: '',
    employment_type: 'full-time',
    city: '',
    location: '',
    salary_min: '',
    salary_max: '',
    salary_type: 'monthly',
    required_skills: [] as string[],
    working_hours: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const toggleSkill = (skill: string) => {
    const exists = form.required_skills.includes(skill);
    const updated = exists
      ? form.required_skills.filter((s) => s !== skill)
      : [...form.required_skills, skill];
    setForm({ ...form, required_skills: updated });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await createJob({
        title: form.title,
        description: form.description,
        job_type: form.job_type,
        employment_type: form.employment_type,
        city: form.city,
        location: form.location,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        salary_type: form.salary_type,
        required_skills: form.required_skills,
        working_hours: form.working_hours || null,
      });
      setSuccess('Job submitted for review.');
      setTimeout(() => navigate('/employer/jobs'), 800);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post a Job</h1>

          {error && (
            <div className="mb-3 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Job Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Delivery Driver"
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                className="input-field min-h-[120px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Job responsibilities and details"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                className="input-field"
                value={form.job_type}
                onChange={(e) => setForm({ ...form, job_type: e.target.value })}
              >
                <option value="">Select category</option>
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Employment Type</label>
              <select
                className="input-field"
                value={form.employment_type}
                onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
              >
                {WORK_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
              />
              <Input
                label="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Area / Locality"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="number"
                label="Min Salary"
                value={form.salary_min}
                onChange={(e) => setForm({ ...form, salary_min: e.target.value })}
                placeholder="10000"
              />
              <Input
                type="number"
                label="Max Salary"
                value={form.salary_max}
                onChange={(e) => setForm({ ...form, salary_max: e.target.value })}
                placeholder="15000"
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Salary Type</label>
                <select
                  className="input-field"
                  value={form.salary_type}
                  onChange={(e) => setForm({ ...form, salary_type: e.target.value })}
                >
                  {SALARY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Required Skills</label>
              <div className="flex flex-wrap gap-2">
                {JOB_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => toggleSkill(cat.value)}
                    className={`px-3 py-2 text-sm rounded-lg border ${
                      form.required_skills.includes(cat.value)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="Working Hours"
              value={form.working_hours}
              onChange={(e) => setForm({ ...form, working_hours: e.target.value })}
              placeholder="9 AM - 6 PM"
            />
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              Submit Job
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

