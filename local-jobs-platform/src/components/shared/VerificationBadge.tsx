import React from 'react';
import { CheckCircle } from 'lucide-react';

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ isVerified, size = 'md' }) => {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <span className={`inline-flex items-center gap-1 bg-green-100 text-green-700 rounded-full font-medium ${sizeClasses[size]}`}>
      <CheckCircle size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
      Verified
    </span>
  );
};
