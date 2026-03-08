import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getSavedJobs, unsaveJob } from '../services/savedJobs';
import { Bookmark, MapPin, DollarSign, Briefcase } from 'lucide-react';

export const SavedJobs: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    setLoading(true);
    try {
      const data = await getSavedJobs();
      setSavedJobs(data || []);
    } catch (err: any) {
      setError('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId: string) => {
    try {
      await unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(item => item.job_id !== jobId));
    } catch (err) {
      setError('Failed to remove job');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
            <p className="text-gray-600 mt-1">Jobs you've bookmarked for later</p>
          </div>
          <Link to="/worker/jobs">
            <Button variant="outline">Find More Jobs</Button>
          </Link>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading saved jobs...</p>
        ) : savedJobs.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Bookmark size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg mb-2">No saved jobs yet</p>
              <p className="text-gray-400 text-sm mb-6">
                Start browsing jobs and click the bookmark icon to save them
              </p>
              <Link to="/worker/jobs">
                <Button variant="primary">Browse Jobs</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {savedJobs.map((item) => {
              const job = item.job;
              return (
                <Card key={item.id}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {job.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
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
                            ₹{job.salary_min || 0} - ₹{job.salary_max || 0} / {job.salary_type}
                          </div>
                        )}
                      </div>

                      <p className="text-gray-700 line-clamp-2 mb-3">{job.description}</p>

                      {job.required_skills && job.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.required_skills.slice(0, 5).map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-gray-400">
                        Saved on {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <Link to={`/worker/jobs/${job.id}`} className="flex-1 md:flex-initial">
                        <Button variant="primary" fullWidth>
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => handleUnsave(job.id)}
                        fullWidth
                      >
                        Remove
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
