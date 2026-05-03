import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getEmployerJobApplications, updateApplicationStatus } from '../services/jobs';
import { useAppStore } from '../store/appStore';
import { MapPin, Briefcase, Star, Clock, Shield, ChevronDown, ChevronUp } from 'lucide-react';

export const EmployerJobApplications: React.FC = () => {
  const { jobId } = useParams();
  const { language } = useAppStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadApplications = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const data = await getEmployerJobApplications(jobId);
      setApplications(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  const handleStatusChange = async (applicationId: string, status: string) => {
    try {
      await updateApplicationStatus(applicationId, { status });
      await loadApplications();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update');
    }
  };

  const hi = (hiText: string, enText: string) => language === 'hi' ? hiText : enText;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 pb-24">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {hi('आवेदन', 'Applications')}
        </h1>
        <p className="text-gray-500 text-sm">
          {hi('एडमिन द्वारा अप्रूव किए गए उम्मीदवार यहां दिखेंगे', 'Admin-approved candidates appear here')}
        </p>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
        )}

        {loading ? (
          <p className="text-gray-500 py-8 text-center">{hi('लोड हो रहा है...', 'Loading...')}</p>
        ) : applications.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500">{hi('अभी कोई आवेदन नहीं', 'No applications yet')}</p>
              <p className="text-sm text-gray-400 mt-1">
                {hi('जब एडमिन किसी आवेदन को अप्रूव करेगा, वह यहां दिखेगा', 'Applications will appear here after admin approval')}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const wp = app.worker_profiles || {};
              const isExpanded = expandedId === app.id;

              return (
                <Card key={app.id}>
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Avatar */}
                      {wp.profile_photo_url ? (
                        <img src={wp.profile_photo_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-gray-200" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                          {(wp.full_name || 'W')[0].toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{wp.full_name}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-0.5">
                          {wp.city && (
                            <span className="flex items-center gap-1"><MapPin size={14} />{wp.city}</span>
                          )}
                          {wp.experience_years > 0 && (
                            <span className="flex items-center gap-1"><Briefcase size={14} />{wp.experience_years} yrs</span>
                          )}
                          {wp.verification_status === 'approved' && (
                            <span className="flex items-center gap-1 text-green-600"><Shield size={14} />Verified</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      app.status === 'hired' ? 'bg-green-100 text-green-700' :
                      app.status === 'shortlisted' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {app.status === 'hired' ? hi('चयनित', 'Hired') :
                       app.status === 'shortlisted' ? hi('शॉर्टलिस्ट', 'Shortlisted') :
                       app.status}
                    </span>
                  </div>

                  {/* Skills */}
                  {wp.skills && wp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {wp.skills.map((skill: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium">{skill}</span>
                      ))}
                    </div>
                  )}

                  {/* Cover letter */}
                  {app.cover_letter && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-500 font-medium mb-1">{hi('कवर लेटर', 'Cover Letter')}</p>
                      <p className="text-sm text-gray-700">{app.cover_letter}</p>
                    </div>
                  )}

                  {app.expected_salary && (
                    <p className="text-sm text-gray-600 mt-2">
                      {hi('अपेक्षित वेतन', 'Expected Salary')}: <strong>₹{app.expected_salary}</strong>
                    </p>
                  )}

                  {/* Expand/collapse candidate details */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    className="flex items-center gap-1 text-sm text-blue-600 font-medium mt-3 hover:text-blue-800"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isExpanded
                      ? hi('कम देखें', 'Show Less')
                      : hi('उम्मीदवार की पूरी जानकारी देखें', 'View Full Candidate Details')}
                  </button>

                  {/* Expanded candidate profile */}
                  {isExpanded && (
                    <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
                      <h4 className="font-bold text-gray-900">{hi('उम्मीदवार प्रोफाइल', 'Candidate Profile')}</h4>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">{hi('शहर', 'City')}</span>
                          <p className="font-medium text-gray-900">{wp.city || 'N/A'}{wp.state ? `, ${wp.state}` : ''}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">{hi('अनुभव', 'Experience')}</span>
                          <p className="font-medium text-gray-900">{wp.experience_years || 0} {hi('वर्ष', 'years')}</p>
                        </div>
                        {wp.minimum_salary && (
                          <div>
                            <span className="text-gray-500">{hi('न्यूनतम वेतन', 'Min Salary')}</span>
                            <p className="font-medium text-gray-900">₹{wp.minimum_salary}/month</p>
                          </div>
                        )}
                        {wp.joining_days && (
                          <div>
                            <span className="text-gray-500">{hi('ज्वाइनिंग', 'Joining')}</span>
                            <p className="font-medium text-gray-900">
                              {wp.joining_days === 'immediate' ? hi('तुरंत', 'Immediately') :
                               `${wp.joining_days} ${hi('दिन में', 'days')}`}
                            </p>
                          </div>
                        )}
                        {wp.address && (
                          <div className="col-span-2">
                            <span className="text-gray-500">{hi('पता', 'Address')}</span>
                            <p className="font-medium text-gray-900">{wp.address}</p>
                          </div>
                        )}
                      </div>

                      {wp.bio && (
                        <div>
                          <span className="text-sm text-gray-500">{hi('परिचय', 'About')}</span>
                          <p className="text-sm text-gray-800 mt-1">{wp.bio}</p>
                        </div>
                      )}

                      {/* Contact info notice */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                        <p className="text-sm text-yellow-800 font-medium">
                          🔒 {hi('फ़ोन नंबर और रिज़्यूमे सुरक्षित है', 'Phone & resume are protected')}
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          {hi('"हायर करें" दबाएं, एडमिन आपको उम्मीदवार से जोड़ेगा',
                              'Click "Hire" and admin will connect you with the candidate')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    {app.status === 'shortlisted' && (
                      <>
                        <Button
                          variant="primary"
                          size="lg"
                          fullWidth
                          onClick={() => handleStatusChange(app.id, 'hired')}
                        >
                          {hi('हायर करें / Interview', 'Hire / Interview')}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                        >
                          {hi('अस्वीकार', 'Reject')}
                        </Button>
                      </>
                    )}
                    {app.status === 'hired' && (
                      <div className="w-full text-center py-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-green-700 font-semibold">
                          ✅ {hi('चयनित — एडमिन जल्द संपर्क करवाएगा', 'Hired — Admin will connect you soon')}
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    {hi('आवेदन', 'Applied')}: {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
