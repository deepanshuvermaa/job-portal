import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import {
  JOB_CATEGORIES,
  WORK_TYPES,
  SALARY_TYPES,
  DEPARTMENTS,
  PERKS_BENEFITS,
  QUALIFICATION_OPTIONS,
  GENDER_OPTIONS,
  EXPERIENCE_LEVELS,
} from '../utils/constants';
import { createJob } from '../services/jobs';
import { useAppStore } from '../store/appStore';

const SectionHeader: React.FC<{ en: string; hi: string }> = ({ en, hi }) => (
  <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mt-6 mb-4">
    {en} <span className="text-sm font-normal text-gray-500">/ {hi}</span>
  </h2>
);

export const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const language = useAppStore((s) => s.language);
  const isHi = language === 'hi';

  const [form, setForm] = useState({
    title: '',
    description: '',
    job_type: '',
    department: '',
    role: '',
    employment_type: 'full-time',
    city: '',
    location: '',
    salary_min: '',
    salary_max: '',
    salary_type: 'monthly',
    incentives: '',
    working_hours: '',
    working_days: '',
    required_skills: [] as string[],
    perks: [] as string[],
    min_age: '',
    max_age: '',
    qualification: 'any',
    gender_preference: 'any',
    experience_required: 'fresher',
    contact_person: '',
    interview_location: '',
  });

  const [customPerk, setCustomPerk] = useState('');
  const [customPerks, setCustomPerks] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      required_skills: prev.required_skills.includes(skill)
        ? prev.required_skills.filter((s) => s !== skill)
        : [...prev.required_skills, skill],
    }));
  };

  const togglePerk = (perk: string) => {
    setForm((prev) => ({
      ...prev,
      perks: prev.perks.includes(perk)
        ? prev.perks.filter((p) => p !== perk)
        : [...prev.perks, perk],
    }));
  };

  const addCustomPerk = () => {
    const trimmed = customPerk.trim();
    if (trimmed && !customPerks.includes(trimmed)) {
      setCustomPerks((prev) => [...prev, trimmed]);
      setForm((prev) => ({ ...prev, perks: [...prev.perks, `custom:${trimmed}`] }));
      setCustomPerk('');
    }
  };

  const removeCustomPerk = (perk: string) => {
    setCustomPerks((prev) => prev.filter((p) => p !== perk));
    setForm((prev) => ({
      ...prev,
      perks: prev.perks.filter((p) => p !== `custom:${perk}`),
    }));
  };

  const label = (en: string, hi: string) => (isHi ? `${hi} / ${en}` : `${en} / ${hi}`);
  const optLabel = (item: { label: string; labelHi: string }) =>
    isHi ? `${item.labelHi} (${item.label})` : `${item.label} (${item.labelHi})`;

  const handleSubmit = async () => {
    if (!form.title || !form.job_type || !form.city) {
      setError(isHi ? 'कृपया जॉब टाइटल, कैटेगरी और शहर भरें' : 'Please fill Job Title, Category and City');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await createJob({
        title: form.title,
        description: form.description,
        job_type: form.job_type,
        department: form.department || null,
        role: form.role || null,
        employment_type: form.employment_type,
        city: form.city,
        location: form.location || null,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        salary_type: form.salary_type,
        incentives: form.incentives || null,
        working_hours: form.working_hours || null,
        working_days: form.working_days || null,
        required_skills: form.required_skills,
        perks: form.perks,
        min_age: form.min_age ? Number(form.min_age) : null,
        max_age: form.max_age ? Number(form.max_age) : null,
        qualification: form.qualification,
        gender_preference: form.gender_preference,
        experience_required: form.experience_required === 'fresher' ? 0 : form.experience_required === '1-2' ? 1 : form.experience_required === '3-5' ? 3 : form.experience_required === '5+' ? 5 : 0,
        contact_person: form.contact_person || null,
        interview_location: form.interview_location || null,
      });
      setSuccess('जॉब पोस्ट हो गई। एडमिन अप्रूवल के बाद लिस्ट होगी।');
      setTimeout(() => navigate('/employer/jobs'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24">
      <div className="max-w-3xl mx-auto">
        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isHi ? 'नई जॉब पोस्ट करें' : 'Post a New Job'}
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            {isHi ? 'सभी जानकारी भरें, एडमिन अप्रूवल के बाद जॉब लाइव होगी' : 'Fill all details. Job will go live after admin approval.'}
          </p>

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
            {/* ── Job Basics / जॉब की जानकारी ── */}
            <SectionHeader en="Job Basics" hi="जॉब की जानकारी" />

            {/* 1. Job Title */}
            <Input
              label={label('Job Title', 'जॉब टाइटल')}
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Delivery Executive, Sales Boy"
            />

            {/* 2. Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label('Description', 'विवरण')}
              </label>
              <textarea
                className="input-field min-h-[120px]"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder={isHi ? 'जॉब की ज़िम्मेदारी और जानकारी लिखें' : 'Job responsibilities and details'}
              />
            </div>

            {/* 3. Category / Job Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label('Category / Job Type', 'कैटेगरी / जॉब प्रकार')}
              </label>
              <select
                className="input-field"
                value={form.job_type}
                onChange={(e) => update('job_type', e.target.value)}
              >
                <option value="">{isHi ? 'कैटेगरी चुनें' : 'Select category'}</option>
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {optLabel(cat)}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Department */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label('Department', 'विभाग')}
              </label>
              <select
                className="input-field"
                value={form.department}
                onChange={(e) => update('department', e.target.value)}
              >
                <option value="">{isHi ? 'विभाग चुनें' : 'Select department'}</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {optLabel(dept)}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Role */}
            <Input
              label={label('Role', 'भूमिका')}
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
              placeholder="e.g. Retail / Counter Sales / B2C"
            />

            {/* 6. Employment Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label('Employment Type', 'रोज़गार प्रकार')}
              </label>
              <select
                className="input-field"
                value={form.employment_type}
                onChange={(e) => update('employment_type', e.target.value)}
              >
                {WORK_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {optLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Location / स्थान ── */}
            <SectionHeader en="Location" hi="स्थान" />

            {/* 7. City + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={label('City', 'शहर')}
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder={isHi ? 'शहर का नाम' : 'City name'}
              />
              <Input
                label={label('Location / Area', 'इलाका / लोकेशन')}
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                placeholder={isHi ? 'इलाका / मोहल्ला' : 'Area / Locality'}
              />
            </div>

            {/* ── Salary & Compensation / वेतन और भत्ते ── */}
            <SectionHeader en="Salary & Compensation" hi="वेतन और भत्ते" />

            {/* 8. Salary Min + Max + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                type="number"
                label={label('Min Salary', 'न्यूनतम वेतन')}
                value={form.salary_min}
                onChange={(e) => update('salary_min', e.target.value)}
                placeholder="10000"
              />
              <Input
                type="number"
                label={label('Max Salary', 'अधिकतम वेतन')}
                value={form.salary_max}
                onChange={(e) => update('salary_max', e.target.value)}
                placeholder="15000"
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {label('Salary Type', 'वेतन प्रकार')}
                </label>
                <select
                  className="input-field"
                  value={form.salary_type}
                  onChange={(e) => update('salary_type', e.target.value)}
                >
                  {SALARY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {optLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 9. Incentives */}
            <Input
              label={label('Incentives', 'इन्सेंटिव')}
              value={form.incentives}
              onChange={(e) => update('incentives', e.target.value)}
              placeholder="e.g. 5000 joining bonus, per delivery incentive"
            />

            {/* ── Work Schedule / काम का समय ── */}
            <SectionHeader en="Work Schedule" hi="काम का समय" />

            {/* 10. Working Hours / Job Timings */}
            <Input
              label={label('Working Hours / Job Timings', 'काम का समय')}
              value={form.working_hours}
              onChange={(e) => update('working_hours', e.target.value)}
              placeholder="e.g. 9:30 AM - 6:30 PM"
            />

            {/* 11. Working Days */}
            <Input
              label={label('Working Days', 'काम के दिन')}
              value={form.working_days}
              onChange={(e) => update('working_days', e.target.value)}
              placeholder="e.g. Monday to Saturday"
            />

            {/* ── Skills & Benefits / स्किल्स और फायदे ── */}
            <SectionHeader en="Skills & Benefits" hi="स्किल्स और फायदे" />

            {/* 12. Required Skills */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label('Required Skills', 'ज़रूरी स्किल्स')}
              </label>
              <div className="flex flex-wrap gap-2">
                {JOB_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => toggleSkill(cat.value)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      form.required_skills.includes(cat.value)
                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {isHi ? cat.labelHi : cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 13. Perks & Benefits */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label('Perks & Benefits', 'सुविधाएं और फायदे')}
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PERKS_BENEFITS.map((perk) => (
                  <button
                    key={perk.value}
                    type="button"
                    onClick={() => togglePerk(perk.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
                      form.perks.includes(perk.value)
                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <span>{perk.icon}</span>
                    <span>{isHi ? perk.labelHi : perk.label}</span>
                  </button>
                ))}
              </div>

              {/* Custom perks display */}
              {customPerks.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {customPerks.map((cp) => (
                    <span
                      key={cp}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-primary-500 bg-primary-50 text-primary-700 font-medium"
                    >
                      {cp}
                      <button
                        type="button"
                        onClick={() => removeCustomPerk(cp)}
                        className="ml-1 text-primary-500 hover:text-red-500 font-bold"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Custom perk input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  value={customPerk}
                  onChange={(e) => setCustomPerk(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomPerk();
                    }
                  }}
                  placeholder={isHi ? 'अपनी सुविधा लिखें...' : 'Add custom perk...'}
                />
                <Button
                  variant="secondary"
                  onClick={addCustomPerk}
                  className="shrink-0"
                >
                  {isHi ? 'जोड़ें' : 'Add'}
                </Button>
              </div>
            </div>

            {/* ── Candidate Requirements / उम्मीदवार की ज़रूरतें ── */}
            <SectionHeader en="Candidate Requirements" hi="उम्मीदवार की ज़रूरतें" />

            {/* 14a. Age Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                label={label('Min Age', 'न्यूनतम उम्र')}
                value={form.min_age}
                onChange={(e) => update('min_age', e.target.value)}
                placeholder="18"
              />
              <Input
                type="number"
                label={label('Max Age', 'अधिकतम उम्र')}
                value={form.max_age}
                onChange={(e) => update('max_age', e.target.value)}
                placeholder="45"
              />
            </div>

            {/* 14b. Qualification */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label('Qualification', 'शैक्षिक योग्यता')}
              </label>
              <select
                className="input-field"
                value={form.qualification}
                onChange={(e) => update('qualification', e.target.value)}
              >
                {QUALIFICATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {optLabel(opt)}
                  </option>
                ))}
              </select>
            </div>

            {/* 14c. Gender Preference */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label('Gender Preference', 'लिंग प्राथमिकता')}
              </label>
              <select
                className="input-field"
                value={form.gender_preference}
                onChange={(e) => update('gender_preference', e.target.value)}
              >
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {optLabel(opt)}
                  </option>
                ))}
              </select>
            </div>

            {/* 14d. Experience Required */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label('Experience Required', 'अनुभव')}
              </label>
              <select
                className="input-field"
                value={form.experience_required}
                onChange={(e) => update('experience_required', e.target.value)}
              >
                {EXPERIENCE_LEVELS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {optLabel(opt)}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Contact Info / संपर्क जानकारी ── */}
            <SectionHeader en="Contact Info" hi="संपर्क जानकारी" />

            {/* 15. Contact Person Name */}
            <Input
              label={label('Contact Person Name', 'संपर्क व्यक्ति का नाम')}
              value={form.contact_person}
              onChange={(e) => update('contact_person', e.target.value)}
              placeholder={isHi ? 'नाम लिखें' : 'Contact person name'}
            />

            {/* 16. Interview Location (optional) */}
            <Input
              label={label('Interview Location (optional)', 'इंटरव्यू का पता (वैकल्पिक)')}
              value={form.interview_location}
              onChange={(e) => update('interview_location', e.target.value)}
              placeholder={isHi ? 'इंटरव्यू का पता' : 'Interview address'}
            />

            {/* ── Submit ── */}
            <div className="pt-4">
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={submitting}
                className="w-full text-base py-3"
              >
                जॉब पोस्ट करें / Submit Job
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
