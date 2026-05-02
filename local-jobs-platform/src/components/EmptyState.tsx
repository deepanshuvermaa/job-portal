import React from 'react';
import { Button } from './shared/Button';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🔍',
  title,
  description,
  actionLabel,
  actionPath,
  onAction
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionPath) {
      navigate(actionPath);
    }
  };

  return (
    <div className="text-center py-16 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && (
        <Button onClick={handleAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// Predefined empty states
export const EmptyStates = {
  NoJobs: () => (
    <EmptyState
      icon="💼"
      title="No jobs found"
      description="Try adjusting your filters or check back later for new opportunities"
      actionLabel="🔔 Set up Job Alerts"
      actionPath="/worker/job-alerts"
    />
  ),

  NoApplications: () => (
    <EmptyState
      icon="📝"
      title="No applications yet"
      description="Start applying to jobs to track your applications here"
      actionLabel="Browse Jobs"
      actionPath="/worker/jobs"
    />
  ),

  NoSavedJobs: () => (
    <EmptyState
      icon="⭐"
      title="No saved jobs"
      description="Save jobs you're interested in to view them later"
      actionLabel="Find Jobs"
      actionPath="/worker/jobs"
    />
  ),

  NoPostedJobs: () => (
    <EmptyState
      icon="📢"
      title="No jobs posted yet"
      description="Post your first job to start receiving applications"
      actionLabel="Post a Job"
      actionPath="/employer/post-job"
    />
  ),

  NoConnections: () => (
    <EmptyState
      icon="🤝"
      title="No connections yet"
      description="Connection requests will appear here once workers apply to your jobs"
    />
  ),

  NoNotifications: () => (
    <EmptyState
      icon="🔔"
      title="No notifications"
      description="You're all caught up! Notifications will appear here when there's activity"
    />
  )
};
