import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  User,
  AlertCircle,
  X,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface InterviewSchedulerProps {
  applicationId: string;
  workerName: string;
  jobTitle: string;
  onScheduled: () => void;
}

type InterviewType = 'in-person' | 'video' | 'call';
type Duration = '30' | '45' | '60';

const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  applicationId,
  workerName,
  jobTitle,
  onScheduled,
}) => {
  const [interviewType, setInterviewType] = useState<InterviewType>('in-person');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState<Duration>('30');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getToken = () => localStorage.getItem('token') || '';

  const validate = (): string | null => {
    if (!date) return 'Please select a date';
    if (!time) return 'Please select a time';

    const selectedDateTime = new Date(`${date}T${time}`);
    if (selectedDateTime <= new Date()) {
      return 'Interview must be scheduled in the future';
    }

    if (interviewType === 'in-person' && !location.trim()) {
      return 'Please enter the interview location';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/interviews/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          application_id: applicationId,
          interview_type: interviewType,
          scheduled_at: new Date(`${date}T${time}`).toISOString(),
          duration_minutes: parseInt(duration),
          location: interviewType === 'in-person' ? location : undefined,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to schedule interview');
      }

      setSuccess(true);
      setTimeout(() => {
        onScheduled();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const typeOptions: { value: InterviewType; label: string; icon: React.ReactNode }[] = [
    { value: 'in-person', label: 'In-Person', icon: <User className="h-4 w-4" /> },
    { value: 'video', label: 'Video Call', icon: <Video className="h-4 w-4" /> },
    { value: 'call', label: 'Phone Call', icon: <Phone className="h-4 w-4" /> },
  ];

  const durationOptions: { value: Duration; label: string }[] = [
    { value: '30', label: '30 min' },
    { value: '45', label: '45 min' },
    { value: '60', label: '1 hour' },
  ];

  // Get tomorrow as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-lg mx-auto text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Interview Scheduled!</h3>
        <p className="text-sm text-gray-600 mb-1">
          Both parties will be notified.
        </p>
        <p className="text-xs text-gray-400">
          दोनों पक्षों को सूचित किया जाएगा।
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Schedule Interview</h3>
          <p className="text-xs text-gray-500">इंटरव्यू शेड्यूल करें</p>
        </div>
        <button
          onClick={onScheduled}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-5 text-sm">
        <p className="text-gray-700">
          <span className="font-semibold">{workerName}</span> for{' '}
          <span className="font-semibold">{jobTitle}</span>
        </p>
      </div>

      {/* Credit notice */}
      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-5">
        <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
        <p className="text-xs text-yellow-700">
          This will use 1 interview credit / इसमें 1 इंटरव्यू क्रेडिट लगेगा
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Interview Type */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Interview Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setInterviewType(opt.value)}
                className={cn(
                  'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all',
                  interviewType === opt.value
                    ? 'bg-primary-50 border-primary-400 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Date</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Calendar className="h-4 w-4" />
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        {/* Time */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Time</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Clock className="h-4 w-4" />
            </div>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Duration
          </label>
          <div className="flex gap-2">
            {durationOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDuration(opt.value)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                  duration === opt.value
                    ? 'bg-primary-50 border-primary-400 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location (conditional) */}
        {interviewType === 'in-person' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Location</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <MapPin className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter interview location"
                className="input-field pl-10"
                required
              />
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions for the candidate..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-base bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Schedule Interview
        </button>
      </form>
    </div>
  );
};

export default InterviewScheduler;
