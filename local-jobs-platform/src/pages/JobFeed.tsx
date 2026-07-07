import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { searchJobs } from '../services/jobs';
import { getWorkerProfile } from '../services/profiles';
import { saveJob, unsaveJob, checkIfJobSaved, checkIfJobApplied } from '../services/savedJobs';
import { JOB_CATEGORIES, WORK_TYPES, SALARY_TYPES } from '../utils/constants';
import { updateSEO, SEO_PRESETS } from '../utils/seo';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Bookmark, BookmarkCheck, CheckCircle, MapPin, DollarSign, Briefcase, SlidersHorizontal } from 'lucide-react';
import { VerificationBadge } from '../components/shared/VerificationBadge';
import CityAutocomplete from '../components/shared/CityAutocomplete';
import MatchScoreBadge from '../components/shared/MatchScoreBadge';

const EXPERIENCE_LEVELS = [
  { value: '', label: 'Any Experience' },
  { value: 'fresher', label: 'Fresher' },
  { value: '1-2', label: '1-2 Years' },
  { value: '3-5', label: '3-5 Years' },
  { value: '5+', label: '5+ Years' },
];

const QUALIFICATIONS = [
  { value: '', label: 'Any Qualification' },
  { value: 'below_10th', label: 'Below 10th' },
  { value: '10th', label: '10th Pass' },
  { value: '12th', label: '12th Pass' },
  { value: 'graduate', label: 'Graduate' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'salary', label: 'Highest Salary' },
  { value: 'match', label: 'Best Match', authOnly: true },
];

export const JobFeed: React.FC = () => {
  const { language } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');
  const [jobType, setJobType] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [qualification, setQualification] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [savingJobId, setSavingJobId] = useState<string | null>(null);

  const loadJobs = async (params: Record<string, any>, sort = 'recent') => {
    setLoading(true);
    setError('');
    try {
      let data: any[];
      if (sort === 'match' && isAuthenticated) {
        const res = await api.get('/api/workers/jobs/recommended', { params });
        data = res.data.data || [];
      } else {
        data = await searchJobs(params);
      }

      // Client-side sort
      if (sort === 'salary') {
        data = [...(data || [])].sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
      }

      setJobs(data || []);

      // Check saved and applied status for all jobs
      if (data && data.length > 0) {
        const savedSet = new Set<string>();
        const appliedSet = new Set<string>();

        await Promise.all(
          data.map(async (job: any) => {
            try {
              const [isSaved, isApplied] = await Promise.all([
                checkIfJobSaved(job.id),
                checkIfJobApplied(job.id)
              ]);
              if (isSaved) savedSet.add(job.id);
              if (isApplied) appliedSet.add(job.id);
            } catch (err) {
              // Ignore errors for individual jobs
            }
          })
        );

        setSavedJobIds(savedSet);
        setAppliedJobIds(appliedSet);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        const profile = await getWorkerProfile();
        if (!active) return;
        const profileCity = profile?.city || '';
        setCity(profileCity);
        // Load ALL jobs initially - no city filter
        // Users can filter by city manually if they want
        await loadJobs({});
      } catch {
        await loadJobs({});
      }
    };

    init();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const titleCity = city || 'India';
    updateSEO(SEO_PRESETS.jobSearch(titleCity, language));
  }, [city, language]);

  const handleSearch = () => {
    const params: any = {};
    if (city) params.city = city;
    if (jobType) params.jobType = jobType;
    if (employmentType) params.employmentType = employmentType;
    if (minSalary) params.minSalary = minSalary;
    if (maxSalary) params.maxSalary = maxSalary;
    if (isRemote) params.is_remote = true;
    if (experienceLevel) params.experience_level = experienceLevel;
    if (qualification) params.qualification = qualification;
    loadJobs(params, sortBy);
  };

  const handleToggleSave = async (jobId: string) => {
    setSavingJobId(jobId);
    try {
      if (savedJobIds.has(jobId)) {
        await unsaveJob(jobId);
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await saveJob(jobId);
        setSavedJobIds(prev => new Set(prev).add(jobId));
      }
    } catch (err) {
      setError('Failed to save job');
    } finally {
      setSavingJobId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Jobs</h1>
            <p className="text-gray-600">Browse jobs near you.</p>
          </div>
          <Link to="/worker/saved-jobs">
            <Button variant="outline">
              <Bookmark size={18} className="mr-2" />
              Saved Jobs
            </Button>
          </Link>
        </div>

        <Card className="space-y-4">
          {/* Mobile filter toggle */}
          <div className="md:hidden flex items-center justify-between">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>
            <div className="flex items-center gap-2">
              <select
                className="input-field text-sm py-1.5"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.filter(o => !o.authOnly || isAuthenticated).map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <Button variant="primary" size="sm" onClick={handleSearch}>Search</Button>
            </div>
          </div>

          <div className={`space-y-4 ${filtersOpen ? 'block' : 'hidden'} md:block`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <CityAutocomplete
                  value={city}
                  onChange={(c) => setCity(c)}
                  placeholder="Search city..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  className="input-field"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {JOB_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Employment Type</label>
                <select
                  className="input-field"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {WORK_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Experience</label>
                <select
                  className="input-field"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  {EXPERIENCE_LEVELS.map(lvl => (
                    <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification</label>
                <select
                  className="input-field"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                >
                  {QUALIFICATIONS.map(q => (
                    <option key={q.value} value={q.value}>{q.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isRemote}
                    onChange={(e) => setIsRemote(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Work From Home</span>
                </label>
              </div>
              <div className="hidden md:block">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                <select
                  className="input-field"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.filter(o => !o.authOnly || isAuthenticated).map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="Min Salary"
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="10000"
              />
              <Input
                label="Max Salary"
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="50000"
              />
              <div className="flex items-end">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-3">No jobs found</p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Possible reasons:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>No jobs have been posted yet</li>
                  <li>Jobs are pending admin approval</li>
                  <li>Try removing your search filters</li>
                </ul>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => {
              const isSaved = savedJobIds.has(job.id);
              const isApplied = appliedJobIds.has(job.id);
              const isSaving = savingJobId === job.id;

              return (
                <Card key={job.id}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                        {job.match_score != null && <MatchScoreBadge score={job.match_score} />}
                        {isApplied && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                            <CheckCircle size={12} />
                            Applied
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          {job.city}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase size={16} />
                          {job.employment_type}
                        </div>
                        {(job.salary_min || job.salary_max) && (
                          <div className="flex items-center gap-1">
                            <DollarSign size={16} />
                            ₹{job.salary_min || 0} - ₹{job.salary_max || 0}
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">{job.description}</p>

                      {job.employer_profiles && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{job.employer_profiles.business_name}</span>
                          <VerificationBadge isVerified={job.employer_profiles.user?.is_verified} size="sm" />
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <Link to={`/worker/jobs/${job.id}`} className="flex-1 md:flex-initial">
                        <Button variant="primary" size="sm" fullWidth>
                          View details
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleSave(job.id)}
                        loading={isSaving}
                        fullWidth
                      >
                        {isSaved ? (
                          <>
                            <BookmarkCheck size={16} className="mr-1" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Bookmark size={16} className="mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
