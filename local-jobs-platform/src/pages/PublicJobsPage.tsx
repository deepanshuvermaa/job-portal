import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Briefcase, DollarSign, Filter, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { JOB_CATEGORIES, WORK_TYPES, EXPERIENCE_LEVELS } from '../utils/constants';
import { VerificationBadge } from '../components/shared/VerificationBadge';
import CityAutocomplete from '../components/shared/CityAutocomplete';
import { api } from '../services/api';

interface PublicJob {
  id: string;
  title: string;
  city: string;
  salary_min?: number;
  salary_max?: number;
  employment_type?: string;
  job_type?: string;
  created_at?: string;
  description?: string;
  work_from_home?: boolean;
  experience_required?: string;
  employer_profiles?: {
    business_name?: string;
    user?: { is_verified?: boolean };
  };
}

export const PublicJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [category, setCategory] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [workFromHome, setWorkFromHome] = useState(false);
  const [experience, setExperience] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  const fetchJobs = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, any> = { page: pageNum, limit: 20 };
      if (keyword) params.keyword = keyword;
      if (city) params.city = city;
      if (category) params.jobType = category;
      if (employmentType) params.employmentType = employmentType;
      if (workFromHome) params.workFromHome = true;
      if (experience) params.experience = experience;
      if (minSalary) params.minSalary = minSalary;
      if (maxSalary) params.maxSalary = maxSalary;

      const { data } = await api.get('/api/public/jobs', { params });
      const results = data.data || data.jobs || data || [];
      const jobList = Array.isArray(results) ? results : [];

      if (append) {
        setJobs((prev) => [...prev, ...jobList]);
      } else {
        setJobs(jobList);
      }
      setHasMore(jobList.length >= 20);
    } catch {
      // Fallback: try the authenticated endpoint without auth
      try {
        const params: Record<string, any> = {};
        if (keyword) params.keyword = keyword;
        if (city) params.city = city;
        if (category) params.jobType = category;
        if (employmentType) params.employmentType = employmentType;

        const { data } = await api.get('/api/workers/jobs/search', { params });
        const results = data.data || data || [];
        setJobs(Array.isArray(results) ? results : []);
        setHasMore(false);
      } catch {
        setError('Failed to load jobs. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [keyword, city, category, employmentType, workFromHome, experience, minSalary, maxSalary]);

  useEffect(() => {
    fetchJobs(1);
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchJobs(1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(nextPage, true);
  };

  const handleApply = (jobId: string) => {
    if (isAuthenticated) {
      navigate(`/worker/jobs/${jobId}`);
    } else {
      navigate(`/auth/phone?redirect=/worker/jobs/${jobId}`);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
            Find Jobs Near You
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100">
            अपने पास नौकरी खोजें
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
          {/* Primary search row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Delivery Boy, Driver, Cook"
                className="input-field pl-10"
              />
            </div>
            <CityAutocomplete
              value={city}
              onChange={setCity}
              placeholder="City / शहर"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Search className="w-5 h-5" />
              Search / खोजें
            </button>
          </div>

          {/* Filter toggle for mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 text-blue-600 font-medium text-sm mb-3"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Extended filters */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${showFilters ? 'block' : 'hidden md:grid'}`}>
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories / सभी श्रेणी</option>
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label} / {cat.labelHi}</option>
              ))}
            </select>

            <select
              className="input-field"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
            >
              <option value="">All Types / सभी प्रकार</option>
              {WORK_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label} / {type.labelHi}</option>
              ))}
            </select>

            <select
              className="input-field"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option value="">Experience / अनुभव</option>
              {EXPERIENCE_LEVELS.map((exp) => (
                <option key={exp.value} value={exp.value}>{exp.label} / {exp.labelHi}</option>
              ))}
            </select>

            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="Min Salary"
                className="input-field pl-10"
              />
            </div>

            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="Max Salary"
                className="input-field pl-10"
              />
            </div>

            <label className="flex items-center gap-3 px-3 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={workFromHome}
                onChange={(e) => setWorkFromHome(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-base text-gray-700 font-medium">
                Work From Home / घर से काम
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading && jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-100">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              No jobs found matching your criteria.
            </h3>
            <p className="text-base sm:text-lg text-gray-500">
              Try different filters. / अलग फ़िल्टर आज़माएं।
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl p-5 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {job.title}
                      </h2>

                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                        {job.employer_profiles?.business_name && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{job.employer_profiles.business_name}</span>
                            <VerificationBadge isVerified={job.employer_profiles?.user?.is_verified} size="sm" />
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.city}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.employment_type && (
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                            {job.employment_type}
                          </span>
                        )}
                        {job.job_type && (
                          <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                            {job.job_type}
                          </span>
                        )}
                        {job.work_from_home && (
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                            WFH
                          </span>
                        )}
                        {job.created_at && (
                          <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full">
                            {formatDate(job.created_at)}
                          </span>
                        )}
                      </div>

                      {(job.salary_min || job.salary_max) && (
                        <div className="flex items-center gap-1 text-sm font-medium text-green-700">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            ₹{job.salary_min?.toLocaleString('en-IN') || '0'} - ₹{job.salary_max?.toLocaleString('en-IN') || '0'}
                          </span>
                        </div>
                      )}

                      {job.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleApply(job.id)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-blue-700 transition-colors min-h-[48px] whitespace-nowrap"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors min-h-[48px] disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More / और देखें'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
