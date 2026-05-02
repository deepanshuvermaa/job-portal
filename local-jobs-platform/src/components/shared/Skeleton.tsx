import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const JobCardSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="h-4 w-2/3 mb-2" />
    <Skeleton className="h-4 w-1/2 mb-4" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  </div>
);

export const ProfileCardSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

export const DashboardCardSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow animate-pulse">
    <Skeleton className="h-8 w-24 mb-2" />
    <Skeleton className="h-10 w-16" />
  </div>
);
