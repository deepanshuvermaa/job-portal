import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Video, Phone, User, X, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';

interface Interview {
  id: string;
  worker_name?: string;
  job_title?: string;
  interview_type?: string;
  scheduled_at?: string;
  status?: string;
  location?: string;
  meeting_link?: string;
  notes?: string;
}

type TabType = 'upcoming' | 'completed' | 'cancelled';

export const EmployerInterviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [credits, setCredits] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/interviews/my');
      setInterviews(data.data || data.interviews || data || []);
      if (data.credits !== undefined) setCredits(data.credits);
    } catch {
      setError('Failed to load interviews.');
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'cancel' | 'complete' | 'no-show') => {
    setActionLoading(id);
    try {
      const statusMap = { cancel: 'cancelled', complete: 'completed', 'no-show': 'no-show' };
      await api.put(`/api/interviews/${id}`, { status: statusMap[action] });
      await fetchInterviews();
    } catch {
      setError('Action failed. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    if (activeTab === 'upcoming') return interview.status === 'scheduled' || interview.status === 'upcoming' || interview.status === 'confirmed';
    if (activeTab === 'completed') return interview.status === 'completed' || interview.status === 'no-show';
    if (activeTab === 'cancelled') return interview.status === 'cancelled';
    return true;
  });

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return { date: 'N/A', time: 'N/A' };
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const tabs: { key: TabType; label: string; labelHi: string }[] = [
    { key: 'upcoming', label: 'Upcoming', labelHi: 'आगामी' },
    { key: 'completed', label: 'Completed', labelHi: 'पूर्ण' },
    { key: 'cancelled', label: 'Cancelled', labelHi: 'रद्द' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Interviews</h1>
              <p className="text-base text-gray-500">Manage your interviews / इंटरव्यू प्रबंधित करें</p>
            </div>
          </div>
          {credits !== null && (
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
              Credits remaining: {credits}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 rounded-lg text-base font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="block text-xs font-normal">{tab.labelHi}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Loading interviews...</p>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-5xl mb-4">
                {activeTab === 'upcoming' ? '📅' : activeTab === 'completed' ? '✅' : '❌'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {activeTab === 'upcoming' && 'No upcoming interviews / कोई आगामी इंटरव्यू नहीं'}
                {activeTab === 'completed' && 'No completed interviews / कोई पूर्ण इंटरव्यू नहीं'}
                {activeTab === 'cancelled' && 'No cancelled interviews / कोई रद्द इंटरव्यू नहीं'}
              </h3>
              <p className="text-base text-gray-500">
                {activeTab === 'upcoming'
                  ? 'Interviews you schedule will appear here.'
                  : 'Past interviews will appear here.'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredInterviews.map((interview) => {
              const { date, time } = formatDateTime(interview.scheduled_at);
              const isUpcoming = activeTab === 'upcoming';

              return (
                <Card key={interview.id}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-lg font-bold text-gray-900">
                          {interview.worker_name || 'Unknown Worker'}
                        </span>
                      </div>

                      {interview.job_title && (
                        <p className="text-base text-gray-600 mb-2">
                          For: {interview.job_title}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{time}</span>
                        </div>
                        {interview.interview_type && (
                          <div className="flex items-center gap-1">
                            {interview.interview_type === 'video' ? (
                              <Video className="w-4 h-4" />
                            ) : (
                              <Phone className="w-4 h-4" />
                            )}
                            <span className="capitalize">{interview.interview_type}</span>
                          </div>
                        )}
                        {interview.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{interview.location}</span>
                          </div>
                        )}
                      </div>

                      {interview.meeting_link && (
                        <a
                          href={interview.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 underline"
                        >
                          Join Meeting Link
                        </a>
                      )}

                      <div className="mt-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          interview.status === 'completed' ? 'bg-green-100 text-green-700' :
                          interview.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          interview.status === 'no-show' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {interview.status?.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Scheduled'}
                        </span>
                      </div>
                    </div>

                    {isUpcoming && (
                      <div className="flex sm:flex-col gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          loading={actionLoading === interview.id}
                          onClick={() => handleAction(interview.id, 'cancel')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          loading={actionLoading === interview.id}
                          onClick={() => handleAction(interview.id, 'complete')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          loading={actionLoading === interview.id}
                          onClick={() => handleAction(interview.id, 'no-show')}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          No-Show
                        </Button>
                      </div>
                    )}
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
