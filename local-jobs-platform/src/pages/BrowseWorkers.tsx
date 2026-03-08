import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { api } from '../services/api';
import { VerificationBadge } from '../components/shared/VerificationBadge';
import { RatingStars } from '../components/shared/RatingStars';
import { MapPin, Briefcase, Download, User, Heart } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const BrowseWorkers: React.FC = () => {
  const { user } = useAuthStore();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expressInterestLoading, setExpressInterestLoading] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async (filters?: Record<string, any>) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        ...filters,
        limit: 50
      };
      const { data } = await api.get('/api/employers/workers/browse', { params });
      setWorkers(data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filters: any = {};
    if (searchQuery.trim()) filters.search = searchQuery.trim();
    if (cityFilter.trim()) filters.city = cityFilter.trim();
    if (skillFilter.trim()) filters.skill = skillFilter.trim();
    if (experienceFilter) filters.experience = experienceFilter;
    loadWorkers(filters);
  };

  const handleReset = () => {
    setSearchQuery('');
    setCityFilter('');
    setSkillFilter('');
    setExperienceFilter('');
    loadWorkers();
  };

  const handleExpressInterest = async (workerId: string) => {
    if (!user) return;

    setExpressInterestLoading(workerId);
    try {
      await api.post('/api/connections/create', {
        worker_id: workerId,
        employer_id: user.id,
        application_id: null  // No specific application, general interest
      });

      alert('Interest expressed! Admin will review your connection request.');
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to express interest';
      if (message.includes('already exists')) {
        alert('You have already expressed interest in this worker.');
      } else {
        alert(message);
      }
    } finally {
      setExpressInterestLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Workers</h1>
            <p className="text-gray-600">
              Find and connect with verified workers on the platform
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Input
              label="Search by name"
              placeholder="Search worker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Input
              label="City"
              placeholder="Enter city..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
            <Input
              label="Skill"
              placeholder="e.g., driver, mechanic..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience
              </label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any Experience</option>
                <option value="fresher">Fresher</option>
                <option value="0-2">0-2 years</option>
                <option value="2-5">2-5 years</option>
                <option value="5+">5+ years</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="primary" onClick={handleSearch}>
              Search Workers
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        </Card>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading workers...</p>
        ) : workers.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No workers found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search filters
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-2">
              Found {workers.length} worker{workers.length !== 1 ? 's' : ''}
            </div>

            <div className="grid gap-4">
              {workers.map((worker) => (
                <Card key={worker.id}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {worker.photo_url ? (
                        <img
                          src={worker.photo_url}
                          alt={worker.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <User size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {worker.full_name}
                            </h3>
                            <VerificationBadge
                              isVerified={worker.user?.is_verified}
                              size="sm"
                            />
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin size={16} />
                              {worker.city}, {worker.state || 'N/A'}
                            </div>
                            {worker.experience_years && (
                              <div className="flex items-center gap-1">
                                <Briefcase size={16} />
                                {worker.experience_years} years experience
                              </div>
                            )}
                          </div>

                          {worker.average_rating > 0 && (
                            <div className="mb-3">
                              <RatingStars
                                rating={worker.average_rating}
                                readonly
                                showNumber
                              />
                            </div>
                          )}

                          {worker.skills && worker.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {worker.skills.slice(0, 5).map((skill: string) => (
                                <span
                                  key={skill}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                              {worker.skills.length > 5 && (
                                <span className="text-xs text-gray-500">
                                  +{worker.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          )}

                          {worker.bio && (
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {worker.bio}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleExpressInterest(worker.user_id)}
                            disabled={expressInterestLoading === worker.user_id}
                          >
                            <Heart size={16} className="mr-1" />
                            {expressInterestLoading === worker.user_id ? 'Sending...' : 'Express Interest'}
                          </Button>
                          <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2">
                            <p className="text-xs text-blue-900 font-medium mb-1">
                              🔒 Contact Protected
                            </p>
                            <p className="text-xs text-blue-700">
                              Click "Express Interest" to request contact info
                            </p>
                          </div>
                          <div className="text-xs text-gray-500 text-right">
                            Joined: {new Date(worker.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded px-3 py-2">
                          <span>🔒</span>
                          <span>
                            <strong>Contact protected:</strong> Phone numbers visible after admin approves your connection request
                          </span>
                        </div>
                        {worker.availability && worker.availability.length > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            Available: {worker.availability.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium mb-2">
            🔒 How Connection Requests Work
          </p>
          <ol className="text-sm text-blue-700 space-y-1 ml-4 list-decimal">
            <li>You can see all worker profiles (skills, experience, location, etc.)</li>
            <li>Click "Express Interest" on workers you want to contact</li>
            <li>Admin reviews your connection request</li>
            <li>Once approved, phone numbers and resumes become visible</li>
            <li>This prevents spam and ensures both parties' privacy</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
