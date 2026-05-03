import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { applyToJob, getJob } from '../services/jobs';
import { updateSEO, SEO_PRESETS, generateJobPostingSchema } from '../utils/seo';
import { useAppStore } from '../store/appStore';
import {
  PERKS_BENEFITS,
  DEPARTMENTS,
  QUALIFICATION_OPTIONS,
  GENDER_OPTIONS,
  WORK_TYPES,
  SALARY_TYPES,
  BUSINESS_TYPES,
} from '../utils/constants';
import {
  Briefcase,
  MapPin,
  IndianRupee,
  Clock,
  CalendarDays,
  GraduationCap,
  Users,
  Building2,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Star,
  Zap,
  Wrench,
  Tag,
  User,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const hi = (language: string) => language === 'hi';

/** Find a label from a constant list by value */
function findLabel(
  list: { value: string; label: string; labelHi: string }[],
  value: string | undefined | null,
  language: string
): string | null {
  if (!value) return null;
  const match = list.find((item) => item.value === value);
  if (!match) return value;
  return hi(language) ? match.labelHi : match.label;
}

/** Format salary range */
function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  salaryType: string | undefined,
  language: string
): string {
  if (!min && !max) return hi(language) ? 'बातचीत योग्य' : 'Negotiable';
  const typeLabel = findLabel(SALARY_TYPES, salaryType, language) || salaryType || '';
  const fmt = (n: number) => n.toLocaleString('en-IN');
  if (min && max) return `₹${fmt(min)} - ₹${fmt(max)} ${typeLabel}`;
  if (min) return `₹${fmt(min)}+ ${typeLabel}`;
  return `Up to ₹${fmt(max!)} ${typeLabel}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** A single highlight row inside the Job Highlights card */
const HighlightRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5">
    <span className="mt-0.5 text-orange-500 shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-medium text-gray-900 break-words">{value}</p>
    </div>
  </div>
);

/** Section heading with optional Hindi subtitle */
const SectionHeading: React.FC<{
  title: string;
  titleHi?: string;
  language: string;
}> = ({ title, titleHi, language }) => (
  <h2 className="text-xl font-bold text-gray-900 mb-1">
    {hi(language) && titleHi ? titleHi : title}
    {hi(language) && titleHi && (
      <span className="block text-sm font-normal text-gray-500 mt-0.5">{title}</span>
    )}
    {!hi(language) && titleHi && (
      <span className="block text-sm font-normal text-gray-500 mt-0.5">{titleHi}</span>
    )}
  </h2>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const JobDetails: React.FC = () => {
  const { jobId } = useParams();
  const { language } = useAppStore();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  // ---- Data fetching ----
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!jobId) return;
      setLoading(true);
      try {
        const data = await getJob(jobId);
        if (active) setJob(data);
      } catch (err: any) {
        if (active) setError(err?.response?.data?.error || 'Failed to load job');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [jobId]);

  // ---- SEO / Schema ----
  useEffect(() => {
    if (!job) return;
    updateSEO(SEO_PRESETS.jobPosting(job.title, job.city || 'India', language));

    const schema = generateJobPostingSchema({
      title: job.title,
      description: job.description,
      company: (job?.employer || job?.employer_profiles)?.business_name || 'Employer',
      location: { city: job.city || 'India', area: job.location || '' },
      salary: {
        min: job.salary_min || 0,
        max: job.salary_max || 0,
        type: job.salary_type || 'monthly',
      },
      datePosted: job.created_at || new Date().toISOString(),
      employmentType: job.employment_type || 'full-time',
    });

    const existing = document.getElementById('job-schema');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'job-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const current = document.getElementById('job-schema');
      if (current) current.remove();
    };
  }, [job, language]);

  // ---- Apply handler ----
  const handleApply = async () => {
    if (!jobId) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await applyToJob(jobId, {
        cover_letter: coverLetter || null,
        expected_salary: expectedSalary ? Number(expectedSalary) : null,
      });
      setSuccess(
        hi(language)
          ? 'आवेदन भेजा गया। एडमिन जांच के बाद नियोक्ता को भेजेगा।'
          : 'Application submitted. Admin will review and forward to employer.'
      );
      toast.success(hi(language) ? 'आवेदन भेजा गया!' : 'Application submitted!');
      toast(
        hi(language)
          ? 'एडमिन आपका आवेदन जांचेगा और नियोक्ता से जोड़ेगा'
          : 'Admin will review your application and connect you with the employer',
        { icon: '⏳', duration: 5000 }
      );
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Failed to apply';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Derived data ----
  // Support both backend key shapes: `employer` and `employer_profiles`
  const employer = job?.employer || job?.employer_profiles || null;

  const salaryText = job
    ? formatSalary(job.salary_min, job.salary_max, job.salary_type, language)
    : '';

  const employmentLabel = findLabel(WORK_TYPES, job?.employment_type, language) || job?.employment_type;
  const departmentLabel = findLabel(DEPARTMENTS, job?.department, language);
  const qualificationLabel = findLabel(QUALIFICATION_OPTIONS, job?.education_required || job?.qualification, language);
  const genderLabel = findLabel(GENDER_OPTIONS, job?.gender_preference || job?.gender, language);

  // Map perks/benefits
  const perksList: { icon: string; label: string }[] = (job?.benefits || job?.perks_benefits || []).map(
    (val: string) => {
      const match = PERKS_BENEFITS.find((p) => p.value === val);
      return match
        ? { icon: match.icon, label: hi(language) ? match.labelHi : match.label }
        : { icon: '✅', label: val };
    }
  );

  // ---- Loading / Error states ----
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 pb-24 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-base text-gray-500">
            {hi(language) ? 'जॉब लोड हो रही है...' : 'Loading job...'}
          </p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 pb-24 flex items-center justify-center">
        <p className="text-base text-gray-500">
          {error || (hi(language) ? 'जॉब नहीं मिली।' : 'Job not found.')}
        </p>
      </div>
    );
  }

  // ---- Render ----
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* ===== SECTION 1: Job Header ===== */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            {job.title}
          </h1>
          {employer?.business_name && (
            <p className="text-lg font-semibold text-orange-600 flex items-center gap-1.5">
              <Building2 size={18} />
              {employer.business_name}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-gray-600">
            {job.city && (
              <span className="flex items-center gap-1">
                <MapPin size={16} className="text-gray-400" />
                {job.city}
              </span>
            )}
            {employmentLabel && (
              <span className="flex items-center gap-1">
                <Briefcase size={16} className="text-gray-400" />
                {employmentLabel}
              </span>
            )}
            {salaryText && (
              <span className="flex items-center gap-1 font-semibold text-green-700">
                <IndianRupee size={16} />
                {salaryText}
              </span>
            )}
          </div>
          {job.is_featured && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
              <Star size={14} /> {hi(language) ? 'फीचर्ड' : 'Featured'}
            </span>
          )}
        </div>

        {/* ===== SECTION 2: Job Highlights ===== */}
        <Card className="border-l-4 border-l-orange-500">
          <SectionHeading title="Job Highlights" titleHi="जॉब हाइलाइट्स" language={language} />

          <div className="divide-y divide-gray-100 mt-2">
            {job.incentives && (
              <HighlightRow
                icon={<Zap size={18} />}
                label={hi(language) ? 'इन्सेंटिव' : 'Incentives'}
                value={job.incentives}
              />
            )}

            {job.required_skills && job.required_skills.length > 0 && (
              <HighlightRow
                icon={<Wrench size={18} />}
                label={hi(language) ? 'आवश्यक स्किल्स' : 'Required Skills'}
                value={
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {job.required_skills.map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="inline-block bg-orange-50 text-orange-700 text-sm font-medium px-2.5 py-0.5 rounded-full border border-orange-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                }
              />
            )}

            {job.assets_required && (
              <HighlightRow
                icon={<Tag size={18} />}
                label={hi(language) ? 'ज़रूरी साधन' : 'Assets Required'}
                value={
                  Array.isArray(job.assets_required)
                    ? job.assets_required.join(', ')
                    : job.assets_required
                }
              />
            )}

            {job.working_hours && (
              <HighlightRow
                icon={<Clock size={18} />}
                label={hi(language) ? 'काम का समय' : 'Working Hours'}
                value={job.working_hours}
              />
            )}

            {job.working_days && (
              <HighlightRow
                icon={<CalendarDays size={18} />}
                label={hi(language) ? 'काम के दिन' : 'Working Days'}
                value={job.working_days}
              />
            )}

            {(job.department || departmentLabel) && (
              <HighlightRow
                icon={<Briefcase size={18} />}
                label={hi(language) ? 'विभाग' : 'Department'}
                value={departmentLabel || job.department}
              />
            )}

            {(job.role_title || job.job_type) && (
              <HighlightRow
                icon={<Tag size={18} />}
                label={hi(language) ? 'भूमिका' : 'Role'}
                value={job.role_title || job.job_type}
              />
            )}

            {job.vacancies > 0 && (
              <HighlightRow
                icon={<Users size={18} />}
                label={hi(language) ? 'खाली पद' : 'Vacancies'}
                value={job.vacancies}
              />
            )}
          </div>
        </Card>

        {/* ===== SECTION 3: Job Description ===== */}
        {job.description && (
          <Card>
            <SectionHeading title="Job Description" titleHi="जॉब विवरण" language={language} />
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line mt-2">
              {job.description}
            </p>
          </Card>
        )}

        {/* ===== SECTION 4: Candidate Requirements ===== */}
        {(job.min_age || job.max_age || qualificationLabel || genderLabel || job.experience_required != null) && (
          <Card>
            <SectionHeading
              title="Candidate Requirements"
              titleHi="उम्मीदवार की आवश्यकताएं"
              language={language}
            />
            <div className="divide-y divide-gray-100 mt-2">
              {(job.min_age || job.max_age) && (
                <HighlightRow
                  icon={<User size={18} />}
                  label={hi(language) ? 'उम्र' : 'Age'}
                  value={
                    job.min_age && job.max_age
                      ? `${job.min_age} - ${job.max_age} ${hi(language) ? 'वर्ष' : 'years'}`
                      : job.min_age
                      ? `${job.min_age}+ ${hi(language) ? 'वर्ष' : 'years'}`
                      : `${hi(language) ? 'अधिकतम' : 'Up to'} ${job.max_age} ${hi(language) ? 'वर्ष' : 'years'}`
                  }
                />
              )}

              {qualificationLabel && (
                <HighlightRow
                  icon={<GraduationCap size={18} />}
                  label={hi(language) ? 'शिक्षा' : 'Qualification'}
                  value={qualificationLabel}
                />
              )}

              {genderLabel && (
                <HighlightRow
                  icon={<Users size={18} />}
                  label={hi(language) ? 'लिंग' : 'Gender Preference'}
                  value={genderLabel}
                />
              )}

              {job.experience_required != null && (
                <HighlightRow
                  icon={<Briefcase size={18} />}
                  label={hi(language) ? 'अनुभव' : 'Experience'}
                  value={
                    job.experience_required === 0
                      ? hi(language)
                        ? 'फ्रेशर / बिना अनुभव'
                        : 'Fresher / No Experience'
                      : `${job.experience_required}+ ${hi(language) ? 'वर्ष' : 'years'}`
                  }
                />
              )}
            </div>
          </Card>
        )}

        {/* ===== SECTION 5: Perks & Benefits ===== */}
        {perksList.length > 0 && (
          <Card>
            <SectionHeading title="Perks & Benefits" titleHi="सुविधाएं और लाभ" language={language} />
            <div className="flex flex-wrap gap-2 mt-3">
              {perksList.map((perk, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 bg-green-50 text-green-800 text-sm font-medium px-3 py-1.5 rounded-full border border-green-200"
                >
                  <span className="text-base">{perk.icon}</span>
                  {perk.label}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* ===== SECTION 6: Company Details ===== */}
        {employer && (
          <Card>
            <SectionHeading title="Company Details" titleHi="कंपनी विवरण" language={language} />
            <div className="divide-y divide-gray-100 mt-2">
              {employer.business_name && (
                <HighlightRow
                  icon={<Building2 size={18} />}
                  label={hi(language) ? 'कंपनी का नाम' : 'Business Name'}
                  value={employer.business_name}
                />
              )}

              {employer.business_type && (
                <HighlightRow
                  icon={<Briefcase size={18} />}
                  label={hi(language) ? 'व्यवसाय प्रकार' : 'Business Type'}
                  value={findLabel(BUSINESS_TYPES, employer.business_type, language) || employer.business_type}
                />
              )}

              {employer.industry && (
                <HighlightRow
                  icon={<Tag size={18} />}
                  label={hi(language) ? 'उद्योग' : 'Industry'}
                  value={employer.industry}
                />
              )}

              {(employer.city || job.city) && (
                <HighlightRow
                  icon={<MapPin size={18} />}
                  label={hi(language) ? 'शहर' : 'City'}
                  value={employer.city || job.city}
                />
              )}

              {(employer.address || job.location) && (
                <HighlightRow
                  icon={<MapPin size={18} />}
                  label={hi(language) ? 'पता' : 'Address'}
                  value={employer.address || job.location}
                />
              )}

              {employer.employee_count && (
                <HighlightRow
                  icon={<Users size={18} />}
                  label={hi(language) ? 'कर्मचारियों की संख्या' : 'Employee Count'}
                  value={employer.employee_count}
                />
              )}

              {employer.average_rating > 0 && (
                <HighlightRow
                  icon={<Star size={18} />}
                  label={hi(language) ? 'रेटिंग' : 'Rating'}
                  value={
                    <span className="flex items-center gap-1">
                      {employer.average_rating.toFixed(1)} <Star size={14} className="fill-amber-400 text-amber-400" />
                    </span>
                  }
                />
              )}
            </div>
          </Card>
        )}

        {/* ===== SECTION 7: Interview / Contact Details ===== */}
        {(employer?.contact_person || job.contact_person || job.contact_phone) && (
          <Card>
            <SectionHeading title="Interview Details" titleHi="इंटरव्यू विवरण" language={language} />
            <div className="divide-y divide-gray-100 mt-2">
              {(employer?.contact_person || job.contact_person) && (
                <HighlightRow
                  icon={<User size={18} />}
                  label={hi(language) ? 'संपर्क व्यक्ति' : 'Contact Person'}
                  value={employer?.contact_person || job.contact_person}
                />
              )}
              {job.contact_phone && (
                <HighlightRow
                  icon={<Phone size={18} />}
                  label={hi(language) ? 'फ़ोन नंबर' : 'Phone'}
                  value={job.contact_phone}
                />
              )}
            </div>
          </Card>
        )}

        {/* ===== SECTION 8: Safety Notice ===== */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <ShieldCheck size={22} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-base font-semibold text-blue-800">
                {hi(language) ? 'कोई भुगतान नहीं' : 'No Payment Involved'}
              </p>
              <p className="text-sm text-blue-700 mt-0.5">
                {hi(language)
                  ? 'इस प्लेटफ़ॉर्म पर जॉब के लिए कोई शुल्क नहीं है।'
                  : 'Applying for jobs on this platform is completely free.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertTriangle size={22} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-base font-semibold text-red-800">
                {hi(language)
                  ? 'अगर पैसे मांगे जाएं तो रिपोर्ट करें'
                  : 'Report job if money is demanded'}
              </p>
              <p className="text-sm text-red-700 mt-0.5">
                {hi(language)
                  ? 'कोई भी नियोक्ता पैसे मांगे तो तुरंत रिपोर्ट करें।'
                  : 'If any employer asks for money, report them immediately.'}
              </p>
            </div>
          </div>
        </div>

        {/* ===== SECTION 9: Apply Section ===== */}
        <Card className="border-t-4 border-t-orange-500">
          <SectionHeading
            title="Apply for this Job"
            titleHi="इस जॉब के लिए आवेदन करें"
            language={language}
          />

          {error && (
            <div className="mt-3 p-3 text-base text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-3 p-3 text-base text-green-700 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <ShieldCheck size={18} className="shrink-0 mt-0.5" />
              {success}
            </div>
          )}

          {!success && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {hi(language) ? 'कवर लेटर (वैकल्पिक)' : 'Cover Letter (optional)'}
                </label>
                <textarea
                  className="input-field min-h-[120px] text-base"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder={
                    hi(language)
                      ? 'अपना परिचय और अनुभव लिखें...'
                      : 'Introduce yourself and your experience...'
                  }
                />
              </div>

              <Input
                type="number"
                label={hi(language) ? 'अपेक्षित वेतन (वैकल्पिक)' : 'Expected Salary (optional)'}
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                placeholder="15000"
              />

              <Button
                variant="primary"
                onClick={handleApply}
                loading={submitting}
                fullWidth
                className="min-h-[56px] text-lg font-bold"
              >
                {hi(language) ? 'अभी आवेदन करें' : 'Apply Now'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
