import React from 'react';
import { Check, Clock, X, UserCheck } from 'lucide-react';

interface TimelineEvent {
  status: string;
  timestamp: string;
  label: string;
}

interface ApplicationTimelineProps {
  currentStatus: string;
  createdAt: string;
  updatedAt?: string;
}

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({
  currentStatus,
  createdAt,
  updatedAt
}) => {
  const statuses = ['pending', 'shortlisted', 'hired'];
  const rejectedStatuses = ['rejected', 'withdrawn'];

  const isRejected = rejectedStatuses.includes(currentStatus);
  const currentIndex = statuses.indexOf(currentStatus);

  const getStatusIcon = (status: string, index: number) => {
    if (isRejected && status === currentStatus) {
      return <X size={20} className="text-red-600" />;
    }

    if (status === currentStatus) {
      return <Clock size={20} className="text-blue-600" />;
    }

    if (index < currentIndex || (status === 'hired' && currentStatus === 'hired')) {
      return <Check size={20} className="text-green-600" />;
    }

    return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
  };

  const getStatusClass = (status: string, index: number) => {
    if (isRejected && status === currentStatus) {
      return 'bg-red-100 border-red-300';
    }

    if (status === currentStatus) {
      return 'bg-blue-100 border-blue-300';
    }

    if (index < currentIndex || (status === 'hired' && currentStatus === 'hired')) {
      return 'bg-green-100 border-green-300';
    }

    return 'bg-gray-50 border-gray-300';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Application Submitted';
      case 'shortlisted':
        return 'Shortlisted';
      case 'hired':
        return 'Hired';
      case 'rejected':
        return 'Rejected';
      case 'withdrawn':
        return 'Withdrawn';
      default:
        return status;
    }
  };

  const getLineClass = (index: number) => {
    if (isRejected) {
      return 'bg-gray-300';
    }

    if (index < currentIndex) {
      return 'bg-green-500';
    }

    return 'bg-gray-300';
  };

  if (isRejected) {
    return (
      <div className="py-4">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getStatusClass(currentStatus, -1)}`}>
            <X size={20} className="text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{getStatusLabel(currentStatus)}</p>
            <p className="text-sm text-gray-500">
              {new Date(updatedAt || createdAt).toLocaleDateString()} at{' '}
              {new Date(updatedAt || createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-start justify-between">
        {statuses.map((status, index) => (
          <React.Fragment key={status}>
            <div className="flex flex-col items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getStatusClass(status, index)}`}>
                {getStatusIcon(status, index)}
              </div>
              <p className={`mt-2 text-sm font-medium text-center ${
                status === currentStatus ? 'text-gray-900' :
                index < currentIndex ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {getStatusLabel(status)}
              </p>
              {status === currentStatus && (
                <p className="text-xs text-gray-500 text-center mt-1">
                  {new Date(updatedAt || createdAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {index < statuses.length - 1 && (
              <div className="flex items-center pt-5 flex-1">
                <div className={`h-0.5 w-full ${getLineClass(index)}`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
