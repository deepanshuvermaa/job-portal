import React from 'react';
import { Card } from './shared/Card';
import { Button } from './shared/Button';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';

interface ProfileCompletionScoreProps {
  user: User;
  role: 'worker' | 'employer';
}

export const ProfileCompletionScore: React.FC<ProfileCompletionScoreProps> = ({ user, role }) => {
  const navigate = useNavigate();

  const calculateScore = () => {
    let score = 0;
    const checks: { label: string; completed: boolean; points: number }[] = [];

    if (role === 'worker') {
      checks.push(
        { label: 'Profile photo uploaded', completed: !!(user as any).profile_photo, points: 15 },
        { label: 'Bio/Description added', completed: !!(user as any).bio && (user as any).bio.length > 20, points: 15 },
        { label: 'Skills added (3+)', completed: ((user as any).skills?.length || 0) >= 3, points: 25 },
        { label: 'Resume uploaded', completed: !!(user as any).resume_url, points: 20 },
        { label: 'Phone verified', completed: !!(user as any).phone_verified, points: 15 },
        { label: 'Experience details added', completed: !!(user as any).experience_years, points: 10 }
      );
    } else {
      checks.push(
        { label: 'Company logo uploaded', completed: !!(user as any).profile_photo, points: 15 },
        { label: 'Company description added', completed: !!(user as any).bio && (user as any).bio.length > 30, points: 20 },
        { label: 'Business verified', completed: !!(user as any).business_verified, points: 25 },
        { label: 'Phone verified', completed: !!(user as any).phone_verified, points: 15 },
        { label: 'Posted first job', completed: ((user as any).jobs_count || 0) > 0, points: 25 }
      );
    }

    checks.forEach(check => {
      if (check.completed) score += check.points;
    });

    return { score, checks };
  };

  const { score, checks } = calculateScore();
  const incomplete = checks.filter(c => !c.completed);

  if (score === 100) {
    return null; // Don't show if profile is complete
  }

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Profile Strength</h3>
          <p className="text-sm text-gray-600">
            Complete your profile to get 3x more {role === 'worker' ? 'job offers' : 'applicants'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">{score}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Incomplete Items */}
      {incomplete.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Complete these steps:</p>
          {incomplete.slice(0, 3).map((check, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <Circle className="w-4 h-4 text-gray-400" />
              <span>{check.label}</span>
              <span className="ml-auto text-xs text-blue-600">+{check.points}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Completed Items (first 2) */}
      {checks.filter(c => c.completed).length > 0 && (
        <div className="space-y-1 mb-4">
          {checks.filter(c => c.completed).slice(0, 2).map((check, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="line-through">{check.label}</span>
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={() => navigate(role === 'worker' ? '/worker/profile/edit' : '/employer/profile/edit')}
        className="w-full flex items-center justify-center gap-2"
      >
        Complete Profile
        <ArrowRight className="w-4 h-4" />
      </Button>
    </Card>
  );
};
